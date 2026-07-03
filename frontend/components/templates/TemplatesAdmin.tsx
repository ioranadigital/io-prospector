'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, Plus, Eye, Pencil, Mail, MessageCircle, FolderOpen } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Template = {
  id: string;
  name: string;
  type: 'email' | 'whatsapp';
  category: string;
  subject?: string;
  body: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export function TemplatesAdmin() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [filterType, setFilterType] = useState<'email' | 'whatsapp' | 'all'>('all');

  const [templateType, setTemplateType] = useState<'email' | 'whatsapp'>('email');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [confirmDelId, setConfirmDelId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const VARIABLE_DESCRIPTIONS: Record<string, string> = {
    // Datos del negocio (prospección)
    business_name:    'Nombre de la empresa/negocio',
    company_name:     'Alias del nombre de la empresa',
    website:          'URL del sitio web',
    main_competitor:  'Competidor directo (datos manuales)',
    missing_service:  'Servicio que le falta (datos manuales)',
    seo_gap:          'Problema SEO principal (datos manuales + scraping)',
    gmb_rating:       'Puntuación en Google Maps (0-5 estrellas)',
    review_count:     'Número de reseñas en Google Maps',
    gmb_claimed:      'Si el perfil está reclamado (sí/no)',
    photo_count:      'Cantidad de fotos en Google Maps',
    gmb_status:       'Estado resumido: "4.5/5 ⭐ (23 reseñas)"',
    // Datos de auditoría SEO
    audit_score:      'Puntuación SEO total (0-100)',
    audit_label:      'Etiqueta del score: "Excelente", "Mejorable", "Crítico"...',
    issue_count:      'Número total de errores críticos detectados',
    warn_count:       'Número de avisos detectados',
    pass_count:       'Número de checks correctos',
    top_issue:        'Título del problema SEO más crítico',
    top_issue_impact: 'Descripción del impacto del problema principal',
    audit_domain:     'Dominio auditado (ej: miempresa.com)',
    ttfb:             'Tiempo de respuesta del servidor (ms)',
    lcp:              'Largest Contentful Paint - tiempo de carga (s)',
    cls:              'Cumulative Layout Shift - estabilidad visual',
    fcp:              'First Contentful Paint - primera carga visible (s)',
  };

  const AVAILABLE_VARIABLES: Record<string, string[]> = {
    email: [
      // Negocio
      'business_name', 'company_name', 'website', 'main_competitor', 'missing_service', 'seo_gap',
      'gmb_rating', 'review_count', 'gmb_claimed', 'photo_count', 'gmb_status',
      // Auditoría
      'audit_domain', 'audit_score', 'audit_label', 'issue_count', 'warn_count', 'pass_count',
      'top_issue', 'top_issue_impact', 'ttfb', 'lcp', 'cls', 'fcp',
    ],
    whatsapp: [
      // Negocio
      'business_name', 'company_name', 'website', 'seo_gap', 'gmb_rating', 'review_count', 'gmb_status',
      // Auditoría
      'audit_domain', 'audit_score', 'audit_label', 'issue_count', 'top_issue', 'top_issue_impact',
    ],
  };

  const CATEGORIES = ['ANALISIS INICIAL', 'PROSPECCIÓN', 'SEGUIMIENTO', 'AUDITORÍA SEO', 'GENERAL'];

  const defaultTemplate: Partial<Template> = {
    name: '',
    type: 'email',
    category: 'GENERAL',
    subject: '',
    body: '',
    is_active: true,
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('io_pro_message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.body) {
      toast.error('Nombre y cuerpo son requeridos');
      return;
    }

    if (editing.type === 'email' && !editing?.subject) {
      toast.error('Asunto es requerido para emails');
      return;
    }

    try {
      const payload = {
        name: editing.name,
        type: editing.type,
        category: editing.category,
        subject: editing.subject || '',
        body: editing.body,
        is_active: editing.is_active ?? true,
        updated_at: new Date().toISOString(),
      };

      if (editing.id) {
        const { error } = await supabase
          .from('io_pro_message_templates')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
        toast.success('Plantilla actualizada');
      } else {
        const { error } = await supabase
          .from('io_pro_message_templates')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
        toast.success('Plantilla creada');
      }
      loadTemplates();
      setEditing(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error saving template:', error);
      const errorMsg = error?.message || error?.toString() || 'Error desconocido';
      toast.error(`Error: ${errorMsg}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('io_pro_message_templates')
        .delete()
        .eq('id', confirmDelId);
      if (error) throw error;
      loadTemplates();
      toast.success('Plantilla eliminada');
      setConfirmDelId(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando plantillas...</div>;
  }

  return (
    <div className="space-y-6">
      {!showForm && (
        <button
          onClick={() => {
            setEditing(defaultTemplate as Template);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
        >
          <Plus size={16} />
          Nueva Plantilla
        </button>
      )}

      {/* Panel lateral a pantalla completa para editar/crear */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay oscuro */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => { setShowForm(false); setEditing(null); }}
          />

          {/* Panel derecho - ocupa todo el ancho disponible */}
          <div className="flex-1 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full">

            {/* Header fijo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
              <h3 className="text-lg font-bold text-white">
                <span className="flex items-center gap-2">{editing?.id ? <><Pencil size={16} /> Editar Plantilla</> : <><Plus size={16} /> Nueva Plantilla</>}</span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(!preview)}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm transition"
                >
                  <Eye size={15} />
                  {preview ? 'Ocultar preview' : 'Preview'}
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Guardar
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditing(null); setPreview(false); }}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido: layout flex column para que el textarea crezca */}
            <div className="flex-1 flex flex-col px-6 py-5 gap-5 min-h-0">

              {/* Nombre, Tipo, Categoría */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Nombre</label>
                  <input
                    value={editing?.name || ''}
                    onChange={e => setEditing({ ...editing!, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="ej: Análisis SEO inicial"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Tipo</label>
                  <select
                    value={editing?.type || 'email'}
                    onChange={e => setEditing({ ...editing!, type: e.target.value as 'email' | 'whatsapp' })}
                    className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Categoría</label>
                  <select
                    value={editing?.category || 'GENERAL'}
                    onChange={e => setEditing({ ...editing!, category: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Asunto (solo email) */}
              {editing?.type === 'email' && (
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Asunto Email</label>
                  <input
                    value={editing?.subject || ''}
                    onChange={e => setEditing({ ...editing!, subject: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="ej: {{business_name}} - Mejora tu posicionamiento SEO"
                  />
                </div>
              )}

              {/* Variables disponibles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold">Variables disponibles</label>
                  <span className="text-xs text-zinc-600">Click para insertar · Hover para ver descripción</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_VARIABLES[editing?.type || 'email'].map(v => (
                    <div key={v} className="relative">
                      <button
                        onClick={() => {
                          const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = editing?.body || '';
                            const newBody = text.substring(0, start) + `{{${v}}}` + text.substring(end);
                            setEditing({ ...editing!, body: newBody });
                            setTimeout(() => {
                              textarea.focus();
                              const pos = start + v.length + 4;
                              textarea.setSelectionRange(pos, pos);
                            }, 0);
                          }
                        }}
                        onMouseEnter={() => setShowTooltip(v)}
                        onMouseLeave={() => setShowTooltip(null)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-blue-600 border border-zinc-700 hover:border-blue-500 text-xs rounded text-blue-400 hover:text-white transition"
                        type="button"
                      >
                        {`{{${v}}}`}
                      </button>
                      {showTooltip === v && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                          {VARIABLE_DESCRIPTIONS[v as keyof typeof VARIABLE_DESCRIPTIONS]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cuerpo + Preview en paralelo */}
              <div className="flex-1 flex gap-4 min-h-0">

                {/* Textarea - siempre visible */}
                <div className="flex flex-col min-h-0 flex-1">
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Cuerpo del Mensaje</label>
                  <textarea
                    id="template-body"
                    value={editing?.body || ''}
                    onChange={e => setEditing({ ...editing!, body: e.target.value })}
                    className="flex-1 w-full bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-none min-h-0"
                    placeholder={editing?.type === 'email'
                      ? "Hola {{business_name}},\n\nHemos detectado {{issue_count}} problemas SEO...\n\nProblema principal: {{top_issue}}\n\nUn saludo."
                      : "Hola {{business_name}} 👋\n\nHemos analizado tu web: {{seo_gap}}\n\nScore: {{audit_score}}/100 🚀"}
                  />
                </div>

                {/* Preview en paralelo - solo si activo */}
                {preview && (
                  <div className="flex flex-col min-h-0 flex-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Vista previa</p>
                    <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg p-4 overflow-y-auto">
                      {editing.type === 'email' && editing.subject && (
                        <div className="text-sm border-b border-zinc-700 pb-3 mb-3">
                          <span className="text-zinc-500 text-xs">Asunto: </span>
                          <span className="text-white font-medium">{editing.subject}</span>
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap text-zinc-300 leading-relaxed font-mono">
                        {editing.body || <span className="text-zinc-600 italic">El mensaje aparecerá aquí...</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Activa */}
              <label className="flex items-center gap-3 cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={editing?.is_active ?? true}
                  onChange={e => setEditing({ ...editing!, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-500"
                />
                <span className="text-sm text-zinc-300">Plantilla activa</span>
              </label>

            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Plantillas ({templates.filter(t => t.is_active).length} activas)</h3>

          {/* Pestañas de navegación tipo Chrome */}
          <div className="flex gap-2 border-b border-zinc-700 mb-6">
            {[
              { value: 'all', label: 'Todas', icon: null, count: templates.length },
              { value: 'email', label: 'Email', icon: <Mail size={13} />, count: templates.filter(t => t.type === 'email').length },
              { value: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={13} />, count: templates.filter(t => t.type === 'whatsapp').length },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value as any)}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 flex items-center gap-1.5 ${
                  filterType === tab.value
                    ? 'border-blue-500 text-blue-400 bg-zinc-800/50'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                }`}
              >
                {tab.icon}{tab.label}
                <span className="ml-2 text-xs bg-zinc-700 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {templates.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No hay plantillas creadas</p>
          ) : (
            <div className="space-y-8">
              {CATEGORIES.map(category => {
                const categoryTemplates = templates.filter(t => {
                  const typeMatch = filterType === 'all' || t.type === filterType;
                  return t.category === category && typeMatch;
                });

                if (categoryTemplates.length === 0) return null;

                return (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-zinc-300 uppercase mb-4 px-2 border-l-4 border-blue-500 pl-3 flex items-center gap-1.5">
                      <FolderOpen size={13} /> {category}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {categoryTemplates.map(template => (
                        <div
                          key={template.id}
                          className={`rounded-lg border px-3 py-2.5 flex items-center justify-between gap-2 transition-all ${
                            template.is_active
                              ? 'bg-zinc-800 border-zinc-700 hover:border-blue-500'
                              : 'bg-zinc-900 border-zinc-800 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                              template.type === 'email'
                                ? 'bg-blue-600/30 text-blue-300'
                                : 'bg-green-600/30 text-green-300'
                            }`}>
                              {template.type === 'email' ? <Mail size={11} /> : <MessageCircle size={11} />}
                            </span>
                            <p className="text-sm font-medium text-white truncate">{template.name}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => { setEditing(template); setShowForm(true); }}
                              className="p-1.5 hover:bg-blue-600/30 text-blue-400 rounded transition"
                              title="Editar"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              onClick={() => setConfirmDelId(template.id)}
                              className="p-1.5 hover:bg-red-600/30 text-red-400 rounded transition"
                              title="Eliminar"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelId !== null}
        loading={deleting}
        title="Eliminar plantilla"
        message="Se eliminará esta plantilla. Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => { if (!deleting) setConfirmDelId(null); }}
      />
    </div>
  );
}
