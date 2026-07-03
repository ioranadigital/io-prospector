import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ text: null, available: false });
    }

    const { report } = await req.json();

    // Importación dinámica solo si hay API key
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const issuesList = report.issues
      .map((i: any) => `- ${i.severity === 'critical' ? '[CRÍTICO]' : '[AVISO]'} ${i.title}: ${i.impact}`)
      .join('\n');

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Eres un experto en SEO y marketing digital. Redacta un mensaje de WhatsApp para un cliente potencial (dueño de negocio local, sin conocimientos técnicos) tras analizar su web.

DATOS:
- Dominio: ${report.domain}
- Score SEO: ${report.score}/100 (${report.scoreLabel})
- Problemas:
${issuesList}

INSTRUCCIONES:
- Español, tono profesional pero cercano
- Máximo 200 palabras
- Explica 2-3 problemas en lenguaje de negocio (impacto en ventas, no técnico)
- Cierra con pregunta que invite a responder
- Emojis con moderación
- Negrita WhatsApp con *texto*
- SOLO el mensaje, sin explicaciones.`,
      }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : null;
    return NextResponse.json({ text, available: true });

  } catch (err: any) {
    console.error('AI report error:', err);
    return NextResponse.json({ text: null, available: false });
  }
}
