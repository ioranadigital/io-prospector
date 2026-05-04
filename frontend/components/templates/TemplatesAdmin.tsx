'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, Plus, Eye } from 'lucide-react';

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

  const VARIABLE_DESCRIPTIONS = {
    business_name: 'Nombre de la empresa/negocio',
    company_name: 'Alias del nombre de la empresa',
    website: 'URL del sitio web',
    main_competitor: 'Competidor directo (datos manuales)',
    missing_service: 'Servicio que le falta (datos manuales)',
    seo_gap: 'Problema SEO principal (datos manuales + scraping)',
    audit_score: 'Puntuación de auditoría SEO (0-100)',
    issue_count: 'Cantidad de problemas SEO detectados',
    top_issue: 'Problema SEO más importante',
    gmb_rating: 'Puntuación en Google Maps (0-5 estrellas)',
    review_count: 'Número de reseñas en Google Maps',
    gmb_claimed: 'Si el perfil está reclamado (sí/no)',
    photo_count: 'Cantidad de fotos en Google Maps',
    gmb_status: 'Estado resumido: "4.5/5 ⭐ (23 reseñas)"',
  };

  const AVAILABLE_VARIABLES = {
    email: ['business_name', 'company_name', 'website', 'main_competitor', 'missing_service', 'seo_gap', 'audit_score', 'issue_count', 'top_issue', 'gmb_rating', 'review_count', 'gmb_claimed', 'photo_count', 'gmb_status'],
    whatsapp: ['business_name', 'company_name', 'website', 'main_competitor', 'missing_service', 'seo_gap', 'gmb_rating', 'review_count', 'gmb_status'],
  };

  const CATEGORIES = ['ANALISIS INICIAL', 'PROSPECCIÓN', 'SEGUIMIENTO', 'GENERAL'];

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
        .from('io_prosp_message_templates')
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
        ...editing,
        updated_at: new Date().toISOString(),
      };

      if (editing.id) {
        const { error } = await supabase
          .from('io_prosp_message_templates')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
        toast.success('Plantilla actualizada');
      } else {
        const { error } = await supabase
          .from('io_prosp_message_templates')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
        toast.success('Plantilla creada');
      }
      loadTemplates();
      setEditing(null);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar plantilla');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar plantilla?')) return;
    try {
      const { error } = await supabase
        .from('io_prosp_message_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
      loadTemplates();
      toast.success('Plantilla eliminada');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar');
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

      {showForm && (
        <div className="bg-zinc-800 border border-zinc-700 rounded p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {editing?.id ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                value={editing?.name || ''}
                onChange={e => setEditing({ ...editing!, name: e.target.value })}
                className="w-full bg-zinc-700 px-3 py-2 rounded text-white"
                placeholder="ej: Análisis SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select
                value={editing?.type || 'email'}
                onChange={e => setEditing({ ...editing!, type: e.target.value as 'email' | 'whatsapp' })}
                className="w-full bg-zinc-700 px-3 py-2 rounded text-white"
              >
                <option value="email">📧 Email</option>
                <option value="whatsapp">💬 WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <select
                value={editing?.category || 'GENERAL'}
                onChange={e => setEditing({ ...editing!, category: e.target.value })}
                className="w-full bg-zinc-700 px-3 py-2 rounded text-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {editing?.type === 'email' && (
            <div>
              <label className="block text-sm font-medium mb-2">Asunto Email</label>
              <input
                value={editing?.subject || ''}
                onChange={e => setEditing({ ...editing!, subject: e.target.value })}
                className="w-full bg-zinc-700 px-3 py-2 rounded text-white"
                placeholder="ej: {{business_name}} - Mejora tu SEO"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Cuerpo del Mensaje</label>
              <span className="text-xs text-zinc-400">Click en variables para insertar (hover para ver descripción):</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {AVAILABLE_VARIABLES[editing?.type || 'email'].map(v => (
                <div key={v} className="relative">
                  <button
                    onClick={() => {
                      const textarea = document.querySelector('textarea');
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = editing?.body || '';
                        setEditing({ ...editing!, body: text.substring(0, start) + `{{${v}}}` + text.substring(end) });
                      }
                    }}
                    onMouseEnter={() => setShowTooltip(v)}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="px-2 py-1 bg-zinc-700 hover:bg-blue-600 text-xs rounded text-blue-400 hover:text-white transition"
                    type="button"
                  >
                    {`{{${v}}}`}
                  </button>
                  {showTooltip === v && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 whitespace-nowrap z-50 pointer-events-none">
                      {VARIABLE_DESCRIPTIONS[v as keyof typeof VARIABLE_DESCRIPTIONS]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <textarea
              value={editing?.body || ''}
              onChange={e => setEditing({ ...editing!, body: e.target.value })}
              className="w-full bg-zinc-700 px-3 py-2 rounded text-white font-mono text-xs h-32"
              placeholder={editing?.type === 'email'
                ? "Hola {{business_name}},\n\nHemos detectado {{issue_count}} problemas SEO...\n\nProblema principal: {{top_issue}}"
                : "Hola {{business_name}}, hemos analizado tu web y encontramos {{seo_gap}}..."}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing?.is_active ?? true}
                onChange={e => setEditing({ ...editing!, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Activa</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
            >
              <Eye size={16} />
              {preview ? 'Ocultar' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {preview && editing && (
        <div className="bg-zinc-800 border border-zinc-700 rounded p-4 space-y-2">
          {editing.type === 'email' && editing.subject && (
            <div className="text-sm border-b border-zinc-700 pb-2">
              <span className="font-semibold">Asunto: </span>
              {editing.subject}
            </div>
          )}
          <div className="text-xs bg-zinc-700 p-3 rounded whitespace-pre-wrap">
            {editing.body}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Plantillas ({templates.filter(t => t.is_active).length} activas)</h3>

          {/* Pestañas de navegación tipo Chrome */}
          <div className="flex gap-2 border-b border-zinc-700 mb-6">
            {[
              { value: 'all', label: '📧 Todas', count: templates.length },
              { value: 'email', label: '📧 Email', count: templates.filter(t => t.type === 'email').length },
              { value: 'whatsapp', label: '💬 WhatsApp', count: templates.filter(t => t.type === 'whatsapp').length },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value as any)}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  filterType === tab.value
                    ? 'border-blue-500 text-blue-400 bg-zinc-800/50'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                }`}
              >
                {tab.label}
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
                    <h4 className="text-sm font-semibold text-zinc-300 uppercase mb-4 px-2 border-l-4 border-blue-500 pl-3">
                      📁 {category}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {categoryTemplates.map(template => (
                        <div
                          key={template.id}
                          className={`rounded-lg border-2 p-4 transition-all ${
                            template.is_active
                              ? 'bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10'
                              : 'bg-zinc-900 border-zinc-800 opacity-60'
                          }`}
                        >
                          {/* Encabezado del bloque */}
                          <div className="mb-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="font-semibold text-white flex-1 line-clamp-2">
                                {template.name}
                              </h5>
                              {!template.is_active && (
                                <span className="text-xs bg-zinc-600 text-zinc-300 px-2 py-1 rounded whitespace-nowrap">
                                  Inactiva
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-1 rounded font-medium ${
                                  template.type === 'email'
                                    ? 'bg-blue-600/30 text-blue-300'
                                    : 'bg-green-600/30 text-green-300'
                                }`}
                              >
                                {template.type === 'email' ? '📧 Email' : '💬 WhatsApp'}
                              </span>
                            </div>
                          </div>

                          {/* Contenido */}
                          <div className="mb-4 space-y-2">
                            {template.subject && (
                              <div className="text-xs">
                                <span className="text-zinc-500">Asunto:</span>
                                <p className="text-zinc-300 line-clamp-2 mt-1 font-mono text-[10px]">
                                  {template.subject}
                                </p>
                              </div>
                            )}
                            <div className="text-xs">
                              <span className="text-zinc-500">Cuerpo:</span>
                              <p className="text-zinc-400 line-clamp-3 mt-1 text-[11px] leading-relaxed">
                                {template.body}
                              </p>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex gap-2 pt-3 border-t border-zinc-700">
                            <button
                              onClick={() => {
                                setEditing(template);
                                setShowForm(true);
                              }}
                              className="flex-1 px-3 py-2 text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded transition"
                              title="Editar"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDelete(template.id)}
                              className="px-3 py-2 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition"
                              title="Eliminar"
                            >
                              🗑️
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
    </div>
  );
}
