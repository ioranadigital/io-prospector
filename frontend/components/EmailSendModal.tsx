'use client';
import { useState, useEffect } from 'react';
import { X, Send, Loader2, Check, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Lead {
  id: string;
  business_name: string;
  email: string;
}

interface EmailSendModalProps {
  leads: Lead[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EmailSendModal({ leads, isOpen, onClose, onSuccess }: EmailSendModalProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [progress, setProgress] = useState(0);

  const leadsArray = Array.isArray(leads) ? leads : [];

  useEffect(() => {
    if (isOpen) {
      api.getTemplates('email').then((result: any) => setTemplates(result)).catch(() => setTemplates([]));
      setSent(false);
      setProgress(0);
      setCustomSubject('');
      setCustomBody('');
    }
  }, [isOpen]);

  const handleTemplateSelect = async (template: any) => {
    setSelectedTemplate(template);
    const rendered = (await api.renderTemplate({
      template_id: template.id,
      lead_id: leadsArray[0]?.id,
    }).catch(() => template)) as any;
    setCustomSubject(rendered?.subject || template.subject);
    setCustomBody(rendered?.body || template.body);
  };

  const handleSend = async () => {
    if (!customSubject || !customBody) {
      toast.error('Completa el asunto y el cuerpo del email');
      return;
    }

    setSending(true);
    setProgress(0);

    try {
      // API para envío masivo
      const response = (await api.sendBulkEmails({
        lead_ids: leadsArray.map(l => l.id),
        subject: customSubject,
        body: customBody,
        template_id: selectedTemplate?.id,
      })) as any;

      // Simular progreso (en prod: usar WebSocket o polling)
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);

      // Esperar a que termine
      const checkStatus = async () => {
        const status = (await api.getBulkEmailStatus(response?.batch_id)) as any;
        if (status.completed) {
          clearInterval(interval);
          setProgress(100);
          setSent(true);
          setSending(false);
          toast.success(`${status.sent} emails enviados`);
          setTimeout(() => {
            onClose();
            onSuccess?.();
          }, 2000);
        } else {
          setTimeout(checkStatus, 1000);
        }
      };
      checkStatus();
    } catch (err: any) {
      setSending(false);
      toast.error(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Mail size={18} /> Enviar Email Masivo</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        {!sent ? (
          <div className="p-6 space-y-5">
            {/* Información de destinatarios */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-300">
                <strong>{leadsArray.length}</strong> lead{leadsArray.length > 1 ? 's' : ''} seleccionado{leadsArray.length > 1 ? 's' : ''}
              </p>
              <div className="mt-2 space-y-1 text-xs text-blue-300/80">
                {leadsArray.map(lead => (
                  <div key={lead.id}>→ {lead.business_name} ({lead.email})</div>
                ))}
              </div>
            </div>

            {/* Plantillas */}
            {templates.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Plantillas Predefinidas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(tpl => (
                    <button
                      key={tpl.id}
                      onClick={() => handleTemplateSelect(tpl)}
                      className={`p-3 rounded-lg text-xs text-left transition-colors ${
                        selectedTemplate?.id === tpl.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      <p className="font-semibold">{tpl.name}</p>
                      <p className="text-[10px] opacity-70 mt-1 line-clamp-2">{tpl.subject}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Asunto */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Asunto
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                placeholder="Ej: Mejora tu SEO sin inversión inicial"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Body */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Mensaje
              </label>
              <textarea
                value={customBody}
                onChange={e => setCustomBody(e.target.value)}
                placeholder="Escribe tu mensaje. Usa {{business_name}}, {{city}}, {{audit_issues}} para variables personalizadas"
                rows={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Variables: {'{'}'{'{business_name}'}'{'}'} {'{'}'{'{city}'}'{'}'} {'{'}'{'{email}'}'{'}'} {'{'}'{'{audit_issues}'}'{'}'}
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !customSubject || !customBody}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        ) : (
          /* Estado de éxito */
          <div className="p-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-900/30 rounded-full p-4">
                <Check size={48} className="text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">¡Hecho!</h3>
            <p className="text-zinc-400">
              Se enviaron {leadsArray.length} emails correctamente. Los prospectos han sido marcados como contactados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
