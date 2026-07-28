'use client';

import { useState, useEffect } from 'react';
import { supabase, type MessageTemplate } from '@/lib/supabase';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Loader, Mail, MessageCircle, Copy } from 'lucide-react';
import { resolveSector } from '@/lib/sector-lookup';

// Etiqueta de score alineada con la ya usada en /audit-resultados y
// /audit-historico, para que {{audit_label}} coincida con lo que el
// usuario ve en el resto de la app.
function getAuditLabel(score: number, hasWebsite: boolean): string {
  if (!hasWebsite) return 'sin evaluar';
  if (score >= 80) return 'Excelente';
  if (score >= 50) return 'Mejorable';
  return 'Crítico';
}

function getAuditDomain(website: string): string {
  if (!website) return 'no disponible';
  try {
    const url = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}

// top_issue_severity ('critical'|'warning'|'success'|'error') es lo único
// estable que devuelve la auditoría de performance — el texto de top_issue
// es libre, así que el impacto se deriva de la severidad, no del texto.
const TOP_ISSUE_IMPACT: Record<string, string> = {
  critical: 'Esto puede estar impidiendo que tu web aparezca en Google, perdiendo clientes potenciales cada día.',
  warning: 'Esto ralentiza tu web y perjudica tu posicionamiento, sobre todo en búsquedas desde el móvil.',
  success: 'No se han detectado problemas críticos en este apartado.',
  error: 'No hemos podido completar la auditoría de tu web — en sí mismo puede ser señal de un problema técnico.',
};
function getTopIssueImpact(severity?: string | null): string {
  return (severity && TOP_ISSUE_IMPACT[severity]) || 'no evaluado';
}

export type WhatsappTemplateContext = {
  leadName: string;
  city?: string;
  category?: string;
  mainCompetitor: string;
};

export type WhatsappTemplate = {
  sid: string | null; // null = pendiente de aprobación Meta, se excluye del selector
  name: string;
  body: string; // texto aprobado, con placeholders {{1}}..{{n}}
  buildVariables: (ctx: WhatsappTemplateContext) => Record<string, string>;
};

// Plantillas de WhatsApp aprobadas por Meta para primer contacto en frío.
// WhatsApp exige plantilla aprobada (texto fijo, variables cortas) para el
// primer mensaje a un lead que nunca ha escrito — un texto libre se rechaza
// siempre en esa situación (ver isFreeTextWindow más abajo para la excepción
// de las 24h posteriores a una respuesta real del lead). Cuando se apruebe
// una plantilla nueva en Twilio Content Editor, basta con añadirla aquí con
// su `sid` para que aparezca en el selector — no hace falta tocar nada más.
export const WHATSAPP_TEMPLATES: WhatsappTemplate[] = [
  {
    sid: 'HXf45c24e945a71837990de0a4aabbb5e5',
    name: '1. Sin web / sin ficha en Google',
    body: `Hola {{1}} 👋

¿Tienes tu negocio dado de alta en Google? Estuve buscando {{2}} en {{3}} y no te encontré por ningún lado. Hoy la mayoría de la gente busca ahí antes de llamar o visitar un negocio, por tanto Google le acaba mostrando a tus competidores como {{4}}, que se llevan clientes que deberían ser vuestros.

Somos una agencia de la Zona (Guadalajara) y ayudamos a pymes locales a crear un escaparate sencillo en internet (una web rápida y directa) y a posicionarlos en los mapas de Google para que el teléfono empiece a sonar.

Si quieres, te explico cómo solucionarlo rápido y gratis, sin pagar por la consulta 🚀.

Un saludo, Ricardo
www.ioranaseo.com`,
    buildVariables: (ctx) => ({
      '1': ctx.leadName,
      '2': ctx.category ? resolveSector(ctx.category).sector : 'tu sector',
      '3': ctx.city || 'tu zona',
      '4': ctx.mainCompetitor || 'la competencia',
    }),
  },
  {
    sid: 'HX5ccd63d96910b7a58382ec1b33c278f1',
    name: '2. Creamos tu web y ficha en Maps',
    body: `Hola, {{1}}👋

¿Tienes web y ficha en Google Maps para tu negocio?

Si la respuesta es no, tengo algo que puede interesarte: en www.ioranaseo.com (Guadalajara) te creamos la página web y te damos de alta en Maps en un solo paquete, para que dejes de depender solo del boca a boca.

¿Te interesa que te cuente cómo funciona? 🌐📍

Un saludo,
Ricardo`,
    buildVariables: (ctx) => ({ '1': ctx.leadName }),
  },
  // 3-5: añadir aquí cuando Meta las apruebe.
];

type SendModalProps = {
  leadId: string;
  leadName: string;
  email: string;
  phone: string;
  lastInboundAt?: string | null;
  city?: string;
  category?: string;
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
  topIssueSeverity?: string | null;
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
  lastInboundAt,
  city,
  category,
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
  topIssueSeverity,
  isOpen,
  onClose,
  onSent,
  type,
}: SendModalProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedWhatsappSid, setSelectedWhatsappSid] = useState('');
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  const availableWhatsappTemplates = WHATSAPP_TEMPLATES.filter(t => t.sid);

  // Meta permite texto libre sin plantilla durante 24h desde la última
  // respuesta real del lead — pasada esa ventana, vuelve a exigir plantilla.
  const isFreeTextWindow =
    type === 'whatsapp' && !!lastInboundAt && Date.now() - new Date(lastInboundAt).getTime() < 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (!isOpen) return;
    if (type === 'whatsapp') {
      if (isFreeTextWindow) {
        setFreeText('');
        setSelectedTemplate('');
        loadFollowupTemplates();
      } else if (availableWhatsappTemplates.length) {
        setSelectedWhatsappSid(availableWhatsappTemplates[0].sid!);
        setPreview(renderWhatsappPreview(availableWhatsappTemplates[0]));
      }
    } else {
      loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, type, isFreeTextWindow]);

  const renderWhatsappPreview = (tmpl: WhatsappTemplate) => {
    const vars = tmpl.buildVariables({ leadName, city, category, mainCompetitor });
    let body = tmpl.body;
    Object.entries(vars).forEach(([key, value]) => {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });
    return body;
  };

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

  // Plantillas de seguimiento (segundo/tercer contacto...) para arrancar el
  // texto libre de la ventana de 24h — nunca la categoría de primer contacto
  // en frío, esa vive solo en WHATSAPP_TEMPLATES arriba.
  const loadFollowupTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('io_pro_message_templates')
        .select('*')
        .eq('type', 'whatsapp')
        .eq('is_active', true)
        .neq('category', '1 PRIMER CONTACTO')
        .order('category', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const applyFollowupTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl) return;
    const variables = buildVariables();
    let body = tmpl.body || '';
    Object.entries(variables).forEach(([key, value]) => {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });
    setFreeText(body);
  };

  const templatesByCategory = templates.reduce<Record<string, MessageTemplate[]>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  const buildVariables = () => ({
    business_name: leadName,
    company_name: leadName,
    city: city || 'tu zona',
    sector: category ? resolveSector(category).sector : 'no especificado',
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
    audit_domain: getAuditDomain(website),
    audit_label: getAuditLabel(auditScore, !!website),
    top_issue_impact: getTopIssueImpact(topIssueSeverity),
  });

  const generatePreview = (templateId: string, templatesData?: MessageTemplate[]) => {
    const tmpl = (templatesData || templates).find(t => t.id === templateId);
    if (!tmpl) return;

    const variables = buildVariables();

    let body = tmpl.body || '';
    Object.entries(variables).forEach(([key, value]) => {
      body = body?.replace(new RegExp(`{{${key}}}`, 'g'), value || '') || '';
    });

    setPreview(body);
  };

  const handleSend = async () => {
    if (type === 'email' && !selectedTemplate) {
      toast.error('Selecciona una plantilla');
      return;
    }
    if (type === 'whatsapp' && !isFreeTextWindow && !selectedWhatsappSid) {
      toast.error('Selecciona una plantilla');
      return;
    }
    if (type === 'whatsapp' && isFreeTextWindow && !freeText.trim()) {
      toast.error('Escribe un mensaje');
      return;
    }

    setLoading(true);
    try {
      if (type === 'email') {
        const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
        const templateName = selectedTemplateObj?.name || '';
        await api.sendEmail({ leadId, email, templateId: selectedTemplate, templateName, variables: buildVariables() });
      } else if (isFreeTextWindow) {
        // Dentro de la ventana de 24h tras la última respuesta del lead, Meta
        // permite texto libre sin plantilla.
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId, phone, message: freeText }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error HTTP ${res.status}`);
        }
      } else {
        // Primer contacto en frío: va siempre por la plantilla aprobada por
        // Meta seleccionada — se envían sus variables cortas, no el párrafo
        // renderizado.
        const tmpl = availableWhatsappTemplates.find(t => t.sid === selectedWhatsappSid);
        if (!tmpl) throw new Error('Plantilla no encontrada');
        const variables = tmpl.buildVariables({ leadName, city, category, mainCompetitor });
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            phone,
            message: preview,
            contentTemplateSid: tmpl.sid,
            variables,
            templateName: tmpl.name,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Error HTTP ${res.status}`);
        }
      }

      toast.success(type === 'email' ? 'Email enviado' : 'Contactado por WhatsApp');
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

        {type === 'email' && (
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
        )}

        {type === 'whatsapp' && isFreeTextWindow && (
          <div className="space-y-3">
            <p className="text-xs text-emerald-400">
              El lead respondió por WhatsApp — modo texto libre disponible durante 24h desde su última respuesta.
            </p>
            {templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Plantilla de seguimiento (opcional)</label>
                <select
                  value={selectedTemplate}
                  onChange={e => applyFollowupTemplate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded text-white"
                >
                  <option value="">Texto libre (sin plantilla)</option>
                  {Object.entries(templatesByCategory).map(([cat, items]) => (
                    <optgroup key={cat} label={cat}>
                      {items.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Mensaje</label>
              <textarea
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                rows={6}
                placeholder="Escribe el mensaje..."
                className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded text-white text-sm"
              />
            </div>
          </div>
        )}

        {type === 'whatsapp' && !isFreeTextWindow && (
          <div>
            <label className="block text-sm font-medium mb-2">Plantilla (aprobada por Meta)</label>
            <select
              value={selectedWhatsappSid}
              onChange={e => {
                setSelectedWhatsappSid(e.target.value);
                const tmpl = availableWhatsappTemplates.find(t => t.sid === e.target.value);
                if (tmpl) setPreview(renderWhatsappPreview(tmpl));
              }}
              className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded text-white"
            >
              {availableWhatsappTemplates.map(t => (
                <option key={t.sid} value={t.sid!}>
                  {t.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-400 mt-2">
              Primer contacto — solo se rellenan las variables cortas; el resto del texto es fijo y aprobado por Meta.
            </p>
          </div>
        )}

        {((type === 'email' && template) || (type === 'whatsapp' && !isFreeTextWindow)) && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase">Vista previa</p>
            {type === 'email' && template?.subject && (
              <div className="bg-zinc-900 p-3 rounded border border-zinc-700">
                <p className="text-xs font-semibold text-zinc-400 mb-1">Asunto:</p>
                <p className="text-sm text-white">{preview.split('\n')[0] || template.subject}</p>
              </div>
            )}
            <div className="bg-zinc-900 p-3 rounded border border-zinc-700 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-zinc-400 mb-2">Contenido:</p>
              <p className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {preview || template?.body || 'Sin contenido'}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={
              loading ||
              (type === 'email' && !selectedTemplate) ||
              (type === 'whatsapp' && !isFreeTextWindow && !selectedWhatsappSid) ||
              (type === 'whatsapp' && isFreeTextWindow && !freeText.trim())
            }
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
