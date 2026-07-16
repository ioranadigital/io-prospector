import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Añade +34 cuando el número viene sin prefijo internacional (scraping ES).
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('34')) return `+${digits}`;
  return `+34${digits}`;
}

export async function POST(req: NextRequest) {
  try {
    const { leadId, phone, message, templateId, templateName } = await req.json();

    if (!phone || !message) {
      return NextResponse.json({ error: 'phone y message son obligatorios' }, { status: 400 });
    }

    const webhookUrl = process.env.N8N_WHATSAPP_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'N8N_WHATSAPP_WEBHOOK_URL no configurada — webhook de producción aún no activado' },
        { status: 503 }
      );
    }

    const to = normalizePhone(phone);

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, body: message, leadId }),
    });

    if (!n8nResponse.ok) {
      const detail = await n8nResponse.text().catch(() => '');
      throw new Error(`n8n respondió ${n8nResponse.status}: ${detail}`);
    }

    if (leadId) {
      const supabase = createAdminClient();
      await supabase.from('io_pro_lead_activities').insert({
        lead_id: leadId,
        type: 'whatsapp',
        direction: 'outbound',
        body: message,
        outcome: 'sent',
        metadata: { template_id: templateId, template_name: templateName, channel: 'n8n_twilio' },
      });
      await supabase
        .from('io_pro_leads')
        .update({ last_contact_at: new Date().toISOString(), crm_status: 'contacted' })
        .eq('id', leadId);
    }

    return NextResponse.json({ sent: true, to });
  } catch (err: any) {
    console.error('WhatsApp send error:', err);
    return NextResponse.json({ error: err.message || 'Error enviando WhatsApp' }, { status: 500 });
  }
}
