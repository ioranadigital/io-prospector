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
    const { leadId, email, templateId, templateName, variables } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_SEND_EMAIL');
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('io_prosp_message_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) throw new Error('Template not found');

    // Generate icebreaker if missing and Claude API is available
    let icebreaker = variables.icebreaker || '';
    if (!icebreaker && claudeApiKey) {
      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeApiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-4-1',
            max_tokens: 150,
            messages: [
              {
                role: 'user',
                content: `Genera una frase personalizada corta (máx 15 palabras) para prospectar ${variables.business_name || 'cliente'}.
                Contexto: ${variables.seo_gap || 'mejora SEO'}.
                Solo retorna la frase, sin explicaciones.`,
              },
            ],
          }),
        });

        const claudeData = await claudeResponse.json();
        icebreaker = claudeData.content?.[0]?.text || '';
      } catch (e) {
        console.warn('Claude API not available, skipping icebreaker generation');
      }
    }

    // Substitute variables in template
    let body = template.body || '';
    let subject = template.subject || '';
    const allVars = { ...variables, icebreaker };

    Object.entries(allVars).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      body = body.replace(placeholder, String(value || ''));
      subject = subject.replace(placeholder, String(value || ''));
    });

    // Send to n8n webhook if configured, otherwise mock
    if (n8nWebhookUrl) {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          email,
          subject,
          body,
          variables: allVars,
        }),
      });
    } else {
      console.log('[MOCK EMAIL]', { email, subject, body });
    }

    // Record activity
    const { error: activityError } = await supabase
      .from('io_prosp_lead_activities')
      .insert({
        lead_id: leadId,
        type: 'email',
        direction: 'outbound',
        subject,
        body,
        outcome: 'sent',
        metadata: {
          template_id: templateId,
          template_name: templateName,
          variables: allVars
        },
      });

    if (activityError) throw activityError;

    return new Response(
      JSON.stringify({ success: true, icebreaker, message: 'Email queued for sending' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
