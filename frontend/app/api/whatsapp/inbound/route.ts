import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { phoneLookupVariants } from '@/lib/phone';

// Recibe las respuestas entrantes de WhatsApp reenviadas por el workflow n8n
// "Io-Prospector-Twilio>Google Sheets y Telegram" (webhook inbound de la
// Messaging Service de Twilio). Abre la ventana de 24h de texto libre para
// el/los lead(s) que respondieron.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret');
  if (!secret || secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { from, body, waId, messageSid } = await req.json();

    if (!from) {
      return NextResponse.json({ error: 'from es obligatorio' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const variants = phoneLookupVariants(from);

    const { data: leads, error: lookupError } = await supabase
      .from('io_pro_leads')
      .select('id')
      .in('phone', variants);

    if (lookupError) throw lookupError;

    if (!leads || leads.length === 0) {
      console.warn(`WhatsApp inbound sin lead asociado: from=${from}`);
      return NextResponse.json({ matched: 0 });
    }

    // Números de teléfono duplicados entre leads existen en producción — se
    // actualizan todos los coincidentes en vez de adivinar uno solo. Abre la
    // ventana de texto libre de más en el peor caso, pero nunca la pierde.
    if (leads.length > 1) {
      console.warn(`WhatsApp inbound con teléfono duplicado (${leads.length} leads): from=${from}`);
    }

    const now = new Date().toISOString();

    for (const lead of leads) {
      const { error: updateError } = await supabase
        .from('io_pro_leads')
        .update({ last_inbound_at: now })
        .eq('id', lead.id);
      if (updateError) console.error('Lead last_inbound_at update error:', updateError);

      const { error: activityError } = await supabase.from('io_pro_lead_activities').insert({
        lead_id: lead.id,
        type: 'whatsapp',
        direction: 'inbound',
        outcome: 'received',
        metadata: { from, wa_id: waId, message_sid: messageSid, body, matched_lead_count: leads.length },
      });
      if (activityError) console.error('WhatsApp inbound activity insert error:', activityError);
    }

    return NextResponse.json({ matched: leads.length });
  } catch (err: any) {
    console.error('WhatsApp inbound error:', err);
    return NextResponse.json({ error: err.message || 'Error procesando WhatsApp entrante' }, { status: 500 });
  }
}
