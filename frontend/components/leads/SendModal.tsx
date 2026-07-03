'use client';

import { useState, useEffect } from 'react';
import { supabase, type MessageTemplate } from '@/lib/supabase';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Loader, Mail, MessageCircle, Copy } from 'lucide-react';

type SendModalProps = {
  leadId: string;
  leadName: string;
  email: string;
  phone: string;
  mainCompetitor: string;
  missingService: string;
  seoGap: string;
  website: string;
  auditScore?: number;
  brokenLinksCount?: number;
  gmbRating?: number;
  reviewCount?: number;
  gmbClaimed?: boolean;
  photoCount?: number;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
  type: 'email' | 'whatsapp';
};

export function SendModal({
  leadId,
  leadName,
  email,
  phone,
  mainCompetitor,
  missingService,
  seoGap,
  website,
  auditScore = 0,
  brokenLinksCount = 0,
  gmbRating = 0,
  reviewCount = 0,
  gmbClaimed = false,
  photoCount = 0,
  isOpen,
  onClose,
  onSent,
  type,
}: SendModalProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (isOpen) loadTemplates();
  }, [isOpen, type]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('io_pro_message_templates')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
      if (data?.length) {
        setSelectedTemplate(data[0].id);
        generatePreview(data[0].id, data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar plantillas');
    }
  };

  const generatePreview = (templateId: string, templatesData?: MessageTemplate[]) => {
    const tmpl = (templatesData || templates).find(t => t.id === templateId);
    if (!tmpl) return;

    const variables = {
      business_name: leadName,
      company_name: leadName,
      main_competitor: mainCompetitor || 'no especificado',
      missing_service: missingService || 'no especificado',
      seo_gap: seoGap || 'no especificado',
      website: website || 'no disponible',
      issue_count: brokenLinksCount.toString(),
      top_issue: seoGap || 'problemas SEO detectados',
      audit_score: auditScore.toString(),
      gmb_rating: gmbRating > 0 ? gmbRating.toString() : 'sin evaluar',
      review_count: reviewCount.toString(),
      gmb_claimed: gmbClaimed ? 'sí' : 'no',
      photo_count: photoCount.toString(),
      gmb_status: gmbClaimed ? `${gmbRating}/5 ⭐ (${reviewCount} reseñas)` : 'No reclamado en Google Maps',
    };

    let body = tmpl.body || '';
    Object.entries(variables).forEach(([key, value]) => {
      body = body?.replace(new RegExp(`{{${key}}}`, 'g'), value || '') || '';
    });

    setPreview(body);
  };

  const handleSend = async () => {
    if (!selectedTemplate) {
      toast.error('Selecciona una plantilla');
      return;
    }

    setLoading(true);
    try {
      const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
      const templateName = selectedTemplateObj?.name || '';

      const variables = {
        business_name: leadName,
        company_name: leadName,
        main_competitor: mainCompetitor || 'no especificado',
        missing_service: missingService || 'no especificado',
        seo_gap: seoGap || 'no especificado',
        website: website || 'no disponible',
        issue_count: brokenLinksCount.toString(),
        top_issue: seoGap || 'problemas SEO detectados',
        audit_score: auditScore.toString(),
        gmb_rating: gmbRating > 0 ? gmbRating.toString() : 'sin evaluar',
        review_count: reviewCount.toString(),
        gmb_claimed: gmbClaimed ? 'sí' : 'no',
        photo_count: photoCount.toString(),
        gmb_status: gmbClaimed ? `${gmbRating}/5 ⭐ (${reviewCount} reseñas)` : 'No reclamado en Google Maps',
      };

      const recipient = type === 'email' ? email : phone;
      const body = {
        leadId,
        [type === 'email' ? 'email' : 'phone']: recipient,
        templateId: selectedTemplate,
        templateName,
        variables,
      };

      if (type === 'email') {
        await api.sendEmail(body);
      } else {
        await api.sendWhatsApp(body);
      }

      toast.success(`${type === 'email' ? 'Email' : 'WhatsApp'} enviado`);
      onSent();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(`Error al enviar ${type}: ${error instanceof Error ? error.message : 'desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const template = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-2xl w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {type === 'email' ? <Mail size={18} /> : <MessageCircle size={18} />}
              {type === 'email' ? 'Enviar Email' : 'Enviar WhatsApp'}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Destinatario: <span className="text-zinc-200 font-medium">{leadName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-700 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase">Contacto</p>
          {type === 'email' ? (
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono text-sm">{email || 'No disponible'}</span>
              {email && (
                <button
                  onClick={() => navigator.clipboard.writeText(email)}
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  <Copy size={12} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono text-sm">{phone || 'No disponible'}</span>
              {phone && (
                <button
                  onClick={() => navigator.clipboard.writeText(phone)}
                  className="text-green-400 hover:text-green-300 text-xs"
                >
                  <Copy size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Plantilla</label>
          <select
            value={selectedTemplate}
            onChange={e => {
              setSelectedTemplate(e.target.value);
              generatePreview(e.target.value);
            }}
            className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded text-white"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {template && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase">Vista previa</p>
            {type === 'email' && template.subject && (
              <div className="bg-zinc-900 p-3 rounded border border-zinc-700">
                <p className="text-xs font-semibold text-zinc-400 mb-1">Asunto:</p>
                <p className="text-sm text-white">{preview.split('\n')[0] || template.subject}</p>
              </div>
            )}
            <div className="bg-zinc-900 p-3 rounded border border-zinc-700 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-zinc-400 mb-2">Contenido:</p>
              <p className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {preview || template.body || 'Sin contenido'}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={loading || !selectedTemplate}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
              type === 'email'
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50'
                : 'bg-green-600 hover:bg-green-700 disabled:bg-green-600/50'
            } disabled:opacity-50 text-white`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader size={16} className="animate-spin" />
                Enviando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">{type === 'email' ? <Mail size={14} /> : <MessageCircle size={14} />} Enviar</span>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
