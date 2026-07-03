'use client';
import { useState, useEffect } from 'react';
import { X, Send, Loader2, Mail, MessageCircle, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'email' | 'whatsapp';
  auditData: {
    url: string;
    score: number;
    pass: number;
    warn: number;
    fail: number;
  };
  prefillBody?: string;
  prefillSubject?: string;
}

export function AuditContactModal({ isOpen, onClose, mode, auditData, prefillBody, prefillSubject }: AuditContactModalProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isEmail = mode === 'email';
  const domain = (() => {
    try { return new URL(auditData.url.startsWith('http') ? auditData.url : `https://${auditData.url}`).hostname; }
    catch { return auditData.url; }
  })();

  const defaultBody = isEmail
    ? `Hola,\n\nHemos realizado una auditoría SEO de ${auditData.url} y el resultado es:\n\n• Score SEO: ${auditData.score}/100\n• Checks correctos: ${auditData.pass}\n• Avisos: ${auditData.warn}\n• Errores críticos: ${auditData.fail}\n\nPodemos ayudarte a mejorar tu posicionamiento.\n\nUn saludo.`
    : `Hola 👋\n\nHemos analizado tu web *${domain}* y hemos encontrado ${auditData.fail} errores SEO que están afectando tu visibilidad en Google.\n\nTu puntuación actual es *${auditData.score}/100*.\n\n¿Te interesa que te expliquemos cómo mejorarla? 🚀`;

  const defaultSubject = `Auditoría SEO de ${domain} - Score: ${auditData.score}/100`;

  useEffect(() => {
    if (!isOpen) return;
    setSent(false);
    setSubject(prefillSubject || defaultSubject);
    setBody(prefillBody || defaultBody);
    setRecipient('');
    setSelectedTemplate(null);
    setTemplates([]);
    setLoadingTemplates(true);

    supabase
      .from('io_pro_message_templates')
      .select('id, name, type, category, subject, body')
      .order('category')
      .order('name')
      .then(({ data, error }) => {
        setLoadingTemplates(false);
        if (error) {
          console.error('[Templates] Error:', error.message);
          return;
        }
        const all = data || [];
        setTemplates(all);
        // Auto-seleccionar plantilla de AUDITORÍA SEO del tipo correcto
        if (!prefillBody) {
          const match =
            all.find((t: any) => t.category === 'AUDITORÍA SEO' && t.type === (isEmail ? 'email' : 'whatsapp')) ||
            all.find((t: any) => t.category === 'AUDITORÍA SEO');
          if (match) {
            setSelectedTemplate(match);
            if (isEmail && match.subject) setSubject(match.subject);
            setBody(match.body);
          }
        }
      });
  }, [isOpen]);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    if (isEmail) {
      setSubject(template.subject || defaultSubject);
      setBody(template.body || defaultBody);
    } else {
      setBody(template.body || defaultBody);
    }
  };

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast.error(isEmail ? 'Introduce un email' : 'Introduce un teléfono');
      return;
    }
    if (!body.trim()) {
      toast.error('El mensaje no puede estar vacío');
      return;
    }

    setSending(true);
    try {
      if (isEmail) {
        await api.sendEmail({ to: recipient, subject, body });
      } else {
        await api.sendWhatsApp({ phone: recipient, message: body });
      }
      setSent(true);
      toast.success(isEmail ? 'Email enviado' : 'WhatsApp enviado');
      setTimeout(onClose, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <div className="flex items-center gap-3">
            {isEmail
              ? <Mail size={20} className="text-blue-400" />
              : <MessageCircle size={20} className="text-green-400" />
            }
            <h2 className="text-lg font-bold text-white">
              {isEmail ? 'Enviar informe por Email' : 'Enviar resumen por WhatsApp'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-lg transition">
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto flex flex-col">

          {/* Resumen de la auditoría */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 flex items-center gap-6 text-sm">
            <span className="text-zinc-400 truncate flex-1">{auditData.url}</span>
            <span className={`font-bold ${auditData.score >= 80 ? 'text-green-400' : auditData.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {auditData.score}/100
            </span>
            <span className="text-green-400 inline-flex items-center gap-0.5"><Check size={11} /> {auditData.pass}</span>
            <span className="text-yellow-400 inline-flex items-center gap-0.5"><AlertTriangle size={11} /> {auditData.warn}</span>
            <span className="text-red-400 inline-flex items-center gap-0.5"><X size={11} /> {auditData.fail}</span>
          </div>

          {/* Plantillas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                Plantillas guardadas
              </label>
              <a href="/crm/plantillas" target="_blank"
                className="text-xs text-blue-400 hover:underline">
                + Crear plantilla →
              </a>
            </div>
            {loadingTemplates ? (
              <p className="text-xs text-zinc-500 py-2">Cargando plantillas...</p>
            ) : templates.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2">
                No hay plantillas. <a href="/crm/plantillas" target="_blank" className="text-blue-400 hover:underline">Crea una en CRM › Plantillas</a>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                      selectedTemplate?.id === t.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                    }`}
                  >
                    {t.type === 'email' ? <Mail size={11} /> : <MessageCircle size={11} />}
                    {t.name}
                    {t.category === 'AUDITORÍA SEO' && (
                      <span className="text-[10px] bg-purple-600/40 text-purple-300 px-1 rounded">audit</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destinatario */}
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">
              {isEmail ? 'Email del destinatario' : 'Teléfono (con prefijo, ej: +34612345678)'}
            </label>
            <input
              type={isEmail ? 'email' : 'tel'}
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder={isEmail ? 'cliente@ejemplo.com' : '+34612345678'}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Asunto (solo email) */}
          {isEmail && (
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Asunto</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Cuerpo - ocupa el espacio restante */}
          <div className="flex-1 flex flex-col min-h-0">
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Mensaje</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              className="flex-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none font-mono min-h-[200px]"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-2 flex-shrink-0">
            <button onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition">
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={sending || sent}
              className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                sent
                  ? 'bg-green-600 text-white'
                  : isEmail
                    ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60'
                    : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-60'
              }`}
            >
              {sending
                ? <><Loader2 size={15} className="animate-spin" /> Enviando...</>
                : sent
                  ? <><Check size={15} /> Enviado</>
                  : <><Send size={15} /> {isEmail ? 'Enviar Email' : 'Enviar WhatsApp'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
