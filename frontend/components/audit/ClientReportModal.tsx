'use client';
import { useState } from 'react';
import { X, Sparkles, Loader2, Copy, Mail, MessageCircle, Check, ClipboardList, Eye, Pencil, XCircle, AlertTriangle } from 'lucide-react';
import { ClientReport, SCORE_LABELS } from '@/lib/audit-client-report';

interface ClientReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ClientReport;
  onSendEmail: (body: string, subject: string) => void;
  onSendWhatsApp: (body: string) => void;
}

export function ClientReportModal({ isOpen, onClose, report, onSendEmail, onSendWhatsApp }: ClientReportModalProps) {
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'visual' | 'email' | 'whatsapp'>('visual');
  const [hookText, setHookText] = useState(report.hook);
  const [farewellText, setFarewellText] = useState('Si tienes cualquier duda o quieres que analicemos juntos los resultados, estamos a tu disposición.\n\nUn saludo,\nEquipo Iorana Digital');

  const scoreMeta = SCORE_LABELS[report.scoreLevel];

  const whatsappText = `Hola 👋

Hemos analizado la web *${report.domain}* y hemos encontrado ${report.issues.filter(i => i.severity === 'critical').length} problemas importantes que están afectando tu visibilidad en Google.

📊 *Puntuación SEO: ${report.score}/100* · ${scoreMeta.emoji} ${report.scoreLabel}

${report.hook}

*Problemas detectados:*
${report.issues.slice(0, 4).map((issue, i) =>
  `${issue.severity === 'critical' ? '❌' : '⚠️'} *${issue.title}*\n${issue.impact}`
).join('\n\n')}

¿Te gustaría que te explicáramos cómo solucionarlo? Podemos ayudarte a mejorar tu posicionamiento y conseguir más clientes. 🚀`;

  const emailSubject = `Auditoría SEO de ${report.domain} · Puntuación: ${report.score}/100`;

  const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

      <!-- HEADER -->
      <tr>
        <td style="background:#18181b;padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#ffffff;font-size:20px;font-weight:bold;">Iorana Digital</td>
              <td align="right" style="color:#71717a;font-size:13px;">Auditoría SEO</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- HOOK -->
      <tr>
        <td style="padding:32px 32px 0;">
          <p style="margin:0 0 8px;color:#71717a;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">INFORME SEO PARA</p>
          <h1 style="margin:0 0 16px;color:#18181b;font-size:24px;font-weight:700;">${report.domain}</h1>
          <p style="margin:0;color:#52525b;font-size:15px;line-height:1.6;">${hookText}</p>
        </td>
      </tr>

      <!-- SCORE -->
      <tr>
        <td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;" align="center">
                <p style="margin:0 0 4px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:1px;">PUNTUACIÓN SEO</p>
                <p style="margin:0;font-size:56px;font-weight:700;color:${scoreMeta.color};">${report.score}</p>
                <p style="margin:4px 0 0;color:#71717a;font-size:13px;">/100 · ${scoreMeta.emoji} ${report.scoreLabel}</p>
              </td>
              <td style="padding:20px 24px;border-left:1px solid #e4e4e7;">
                <table cellpadding="0" cellspacing="0">
                  <tr><td style="padding:4px 0;">
                    <span style="color:#22c55e;font-size:14px;">✓ ${report.passCount} checks correctos</span>
                  </td></tr>
                  <tr><td style="padding:4px 0;">
                    <span style="color:#ef4444;font-size:14px;">✗ ${report.issues.filter(i=>i.severity==='critical').length} errores críticos</span>
                  </td></tr>
                  <tr><td style="padding:4px 0;">
                    <span style="color:#eab308;font-size:14px;">⚠ ${report.issues.filter(i=>i.severity==='warning').length} avisos</span>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- PROBLEMAS -->
      <tr>
        <td style="padding:0 32px 24px;">
          <h2 style="margin:0 0 16px;color:#18181b;font-size:17px;font-weight:700;">Problemas detectados en tu web</h2>
          ${report.issues.map(issue => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border:1px solid ${issue.severity === 'critical' ? '#fecaca' : '#fef08a'};border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:14px 16px;background:${issue.severity === 'critical' ? '#fef2f2' : '#fefce8'};">
                <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${issue.severity === 'critical' ? '#991b1b' : '#854d0e'};">
                  ${issue.severity === 'critical' ? '❌' : '⚠️'} ${issue.title}
                </p>
                <p style="margin:0;font-size:13px;color:#52525b;line-height:1.5;">${issue.impact}</p>
              </td>
            </tr>
          </table>`).join('')}
        </td>
      </tr>

      <!-- FAREWELL -->
      <tr>
        <td style="padding:0 32px 24px;">
          <p style="margin:0;color:#52525b;font-size:14px;line-height:1.7;white-space:pre-line;">${farewellText}</p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding:0 32px 32px;" align="center">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#2563eb;border-radius:8px;">
                <a href="mailto:info@ioranadigital.com" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">
                  Quiero mejorar mi web →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding:20px 32px;background:#f4f4f5;border-top:1px solid #e4e4e7;">
          <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">
            Iorana Digital · Este informe ha sido generado automáticamente para ${report.domain}
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      const response = await fetch('/api/audit-report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report }),
      });
      const data = await response.json();
      setAiAvailable(data.available ?? false);
      if (data.text) setAiText(data.text);
    } catch {
      setAiAvailable(false);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><ClipboardList size={18} /> Informe para el cliente</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{report.domain} · Score: {report.score}/100</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
              {([
                { id: 'visual',    icon: <Eye size={12} />,          label: 'Vista previa' },
                { id: 'email',     icon: <Mail size={12} />,         label: 'Email HTML' },
                { id: 'whatsapp',  icon: <MessageCircle size={12} />, label: 'WhatsApp' },
              ] as const).map(t => (
                <button key={t.id} onClick={() => setMode(t.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1 ${mode === t.id ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition text-zinc-400">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">

          {/* VISTA PREVIA VISUAL */}
          {mode === 'visual' && (
            <div className="p-6">
              <div className="bg-white rounded-xl overflow-hidden text-black">
                {/* Header */}
                <div className="bg-zinc-900 px-8 py-5 flex items-center justify-between">
                  <span className="text-white font-bold text-lg">Iorana Digital</span>
                  <span className="text-zinc-400 text-sm">Auditoría SEO</span>
                </div>
                {/* Body */}
                <div className="px-8 py-6 space-y-6">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">INFORME SEO PARA</p>
                    <h1 className="text-2xl font-bold text-zinc-900">{report.domain}</h1>
                    <p className="text-zinc-600 mt-2 leading-relaxed">{hookText}</p>
                  </div>
                  {/* Score */}
                  <div className="bg-zinc-100 rounded-xl p-5 flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Puntuación SEO</p>
                      <p className="text-6xl font-bold" style={{ color: scoreMeta.color }}>{report.score}</p>
                      <p className="text-sm text-zinc-500 mt-1">/100 · {scoreMeta.emoji} {report.scoreLabel}</p>
                    </div>
                    <div className="border-l border-zinc-300 pl-8 space-y-2">
                      <p className="text-sm text-green-600 flex items-center gap-1"><Check size={12} /> {report.passCount} checks correctos</p>
                      <p className="text-sm text-red-600 flex items-center gap-1"><XCircle size={12} /> {report.issues.filter(i=>i.severity==='critical').length} errores críticos</p>
                      <p className="text-sm text-yellow-600 flex items-center gap-1"><AlertTriangle size={12} /> {report.issues.filter(i=>i.severity==='warning').length} avisos</p>
                    </div>
                  </div>
                  {/* Problemas */}
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 mb-3">Problemas detectados en tu web</h2>
                    <div className="space-y-3">
                      {report.issues.map((issue, i) => (
                        <div key={i} className={`border rounded-lg p-4 ${issue.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                          <p className={`font-semibold text-sm flex items-center gap-1 ${issue.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'}`}>
                            {issue.severity === 'critical' ? <XCircle size={13} /> : <AlertTriangle size={13} />} {issue.title}
                          </p>
                          <p className="text-sm text-zinc-600 mt-1">{issue.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Despedida */}
                  <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">{farewellText}</p>
                  {/* CTA */}
                  <div className="text-center pt-2">
                    <div className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-sm">
                      Quiero mejorar mi web →
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div className="bg-zinc-100 px-8 py-4 text-center">
                  <p className="text-xs text-zinc-400">Iorana Digital · Informe generado para {report.domain}</p>
                </div>
              </div>
            </div>
          )}

          {/* EMAIL HTML */}
          {mode === 'email' && (
            <div className="flex flex-col h-full p-6 gap-4">

              {/* Texto editable del intro */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                  <Pencil size={11} /> Texto de introducción (editable)
                </label>
                <textarea
                  value={hookText}
                  onChange={e => setHookText(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-800 border border-blue-600/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-zinc-600 mt-1">Aparece debajo del nombre del dominio.</p>
              </div>

              {/* Texto de despedida editable */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                  <Pencil size={11} /> Texto de despedida (editable)
                </label>
                <textarea
                  value={farewellText}
                  onChange={e => setFarewellText(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-800 border border-blue-600/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-zinc-600 mt-1">Aparece antes del botón "Quiero mejorar mi web".</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">Código HTML listo para usar en tu cliente de email</p>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(emailHtml)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition">
                    {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar HTML</>}
                  </button>
                  <button onClick={() => onSendEmail(emailHtml, emailSubject)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition">
                    <Mail size={13} /> Usar en Email
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={emailHtml}
                className="flex-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-xs text-zinc-300 font-mono resize-none focus:outline-none"
              />
            </div>
          )}

          {/* WHATSAPP */}
          {mode === 'whatsapp' && (
            <div className="flex flex-col h-full p-6 gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">Mensaje listo para WhatsApp</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateAI}
                    disabled={generatingAI}
                    title={aiAvailable === false ? 'Añade ANTHROPIC_API_KEY en .env para activar esta función' : ''}
                    className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition disabled:opacity-60 ${
                      aiAvailable === false
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {generatingAI
                      ? <><Loader2 size={13} className="animate-spin" /> Generando...</>
                      : aiAvailable === false
                        ? <><Sparkles size={13} /> IA no disponible</>
                        : <><Sparkles size={13} /> Mejorar con IA</>
                    }
                  </button>
                  {aiAvailable === false && (
                    <span className="text-xs text-zinc-600">Añade <code className="text-zinc-400">ANTHROPIC_API_KEY</code> para activar</span>
                  )}
                  <button onClick={() => handleCopy(aiText || whatsappText)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition">
                    {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                  </button>
                  <button onClick={() => onSendWhatsApp(aiText || whatsappText)}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition">
                    <MessageCircle size={13} /> Usar en WhatsApp
                  </button>
                </div>
              </div>
              <textarea
                value={aiText || whatsappText}
                onChange={e => setAiText(e.target.value)}
                className="flex-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300 font-mono resize-none focus:outline-none focus:border-green-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
