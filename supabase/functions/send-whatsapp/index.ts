import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId, phone, templateId, templateName, variables } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_SEND_WHATSAPP');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('io_prosp_message_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) throw new Error('Template not found');

    // Substitute variables in template
    let message = template.body || '';
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value || ''));
    });

    // Send to n8n webhook if configured, otherwise mock
    if (n8nWebhookUrl) {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          phone: phone.replace(/\D/g, ''),
          message,
          variables,
        }),
      });
    } else {
      console.log('[MOCK WHATSAPP]', { phone, message });
    }

    // Record activity
    const { error: activityError } = await supabase
      .from('io_prosp_lead_activities')
      .insert({
        lead_id: leadId,
        type: 'whatsapp',
        direction: 'outbound',
        body: message,
        outcome: 'sent',
        metadata: {
          template_id: templateId,
          template_name: templateName,
          variables
        },
      });

    if (activityError) throw activityError;

    return new Response(
      JSON.stringify({ success: true, message: 'WhatsApp message queued for sending' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);

    // Record failed activity
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { leadId, templateId } = await req.json();

      await supabase
        .from('io_prosp_lead_activities')
        .insert({
          lead_id: leadId,
          type: 'whatsapp',
          direction: 'outbound',
          outcome: 'failed',
          metadata: { template_id: templateId, template_name: templateName, error: error.message },
        });
    } catch (e) {
      console.error('Error recording activity:', e);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
