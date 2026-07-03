'use client';
import { useState, useEffect } from 'react';
import { X, Send, Loader2, Check, AlertCircle, MessageCircle, Leaf, Zap, Flame } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Lead {
  id: string;
  business_name: string;
  phone: string;
}

interface WhatsAppSendModalProps {
  leads: Lead[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WhatsAppSendModal({ leads, isOpen, onClose, onSuccess }: WhatsAppSendModalProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [intensity, setIntensity] = useState<'soft' | 'medium' | 'hard'>('medium');
  const [leadsWithoutPhone, setLeadsWithoutPhone] = useState<Lead[]>([]);

  const leadsArray = Array.isArray(leads) ? leads : [];

  useEffect(() => {
    if (isOpen) {
      const without = leadsArray.filter(l => !l.phone);
      setLeadsWithoutPhone(without);
      api.getTemplates('whatsapp').then((result: any) => setTemplates(result)).catch(() => setTemplates([]));
      setSent(false);
      setCustomMessage('');
    }
  }, [isOpen, leads]);

  const handleTemplateSelect = async (template: any) => {
    setSelectedTemplate(template);
    const rendered = (await api.renderTemplate({
      template_id: template.id,
      lead_id: leadsArray[0]?.id,
    }).catch(() => template)) as any;
    setCustomMessage(rendered?.body || template.body);
  };

  const validLeads = leadsArray.filter(l => l.phone);

  const handleSend = async () => {
    if (!customMessage) {
      toast.error('Escribe un mensaje');
      return;
    }

    setSending(true);

    try {
      const response = (await api.sendBulkWhatsApp({
        lead_ids: validLeads.map(l => l.id),
        message: customMessage,
        intensity,
        template_id: selectedTemplate?.id,
      })) as any;

      // Esperar a que termine
      const checkStatus = async () => {
        const status = (await api.getBulkWhatsAppStatus(response?.batch_id)) as any;
        if (status.completed) {
          setSent(true);
          setSending(false);
          toast.success(`${status.sent} mensajes enviados`);
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
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><MessageCircle size={18} /> Enviar WhatsApp Masivo</h2>
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
            <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
              <p className="text-sm text-green-300">
                <strong>{validLeads.length}</strong> lead{validLeads.length > 1 ? 's' : ''} con teléfono
              </p>
              {leadsWithoutPhone.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-300 font-semibold flex items-center gap-2">
                    <AlertCircle size={14} /> {leadsWithoutPhone.length} lead{leadsWithoutPhone.length > 1 ? 's' : ''} sin teléfono
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-yellow-300/80">
                    {leadsWithoutPhone.map(lead => (
                      <div key={lead.id}>→ {lead.business_name}</div>
                    ))}
                  </div>
                </div>
              )}
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
                          ? 'bg-green-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      <p className="font-semibold">{tpl.name}</p>
                      <p className="text-[10px] opacity-70 mt-1 line-clamp-2">{tpl.body}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Mensaje
              </label>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder="Hola {{business_name}}, hemos encontrado problemas SEO en tu web..."
                rows={5}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Variables: {'{'}'{'{business_name}'}'{'}'} {'{'}'{'{city}'}'{'}'} {'{'}'{'{audit_issues}'}'{'}'}
              </p>
            </div>

            {/* Intensidad */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Intensidad de envío
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['soft', 'medium', 'hard'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setIntensity(level)}
                    className={`p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      intensity === level
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {level === 'soft' && <><Leaf size={12} className="inline mr-1" />Suave (1 msg)</>}
                    {level === 'medium' && <><Zap size={12} className="inline mr-1" />Media (2 msgs)</>}
                    {level === 'hard' && <><Flame size={12} className="inline mr-1" />Fuerte (3 msgs)</>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {intensity === 'soft' && 'Un mensaje único de presentación'}
                {intensity === 'medium' && 'Mensaje inicial + seguimiento en 24h'}
                {intensity === 'hard' && 'Secuencia: presentación, seguimiento 24h y recordatorio 48h'}
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
                disabled={sending || !customMessage || validLeads.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
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
            <h3 className="text-2xl font-bold text-white">¡Enviado!</h3>
            <p className="text-zinc-400">
              Se programaron {validLeads.length} WhatsApp para enviarse según la intensidad seleccionada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
