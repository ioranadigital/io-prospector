'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, Plus, Eye, Pencil, Mail, MessageCircle, FolderOpen, Copy, Settings, X, Check, Smile, Type } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const MAX_CHARS: Record<'email' | 'whatsapp', number> = { email: 1500, whatsapp: 1000 };

// Emojis habituales en mensajes de prospección/venta — la lista completa de
// unicode sería enorme e inútil aquí, esta cubre los casos reales de uso.
const EMOJI_PICKER_LIST = [
  '👋', '🙌', '👍', '🤝', '😊', '🙏', '💪', '✨',
  '🚀', '🔥', '⭐', '🌟', '🏆', '🎯', '📈', '📊',
  '💡', '✅', '❌', '⚠️', '🔍', '📍', '⏰', '📅',
  '📞', '📧', '💬', '📱', '💰', '🎉', '👏', '⚡',
];

// Formato estilo WhatsApp (*negrita*, _cursiva_, ~tachado~, ```monoespaciado```)
// — es la sintaxis que WhatsApp renderiza de verdad; en email se inserta igual
// mientras el envío sea texto plano/HTML simple, pero puede no mostrarse en negrita.
const MARKDOWN_FORMATS: { label: string; before: string; after: string; placeholder: string }[] = [
  { label: 'Negrita', before: '*', after: '*', placeholder: 'texto' },
  { label: 'Cursiva', before: '_', after: '_', placeholder: 'texto' },
  { label: 'Tachado', before: '~', after: '~', placeholder: 'texto' },
  { label: 'Monoespaciado', before: '```', after: '```', placeholder: 'texto' },
];

// Orden numérico por el prefijo del nombre ("1 PRIMER CONTACTO", "1_Sin Web...",
// "2 SEGUNDO CONTACTO"...) en vez de alfabético — con orden alfabético "10 X"
// se cuela antes que "2 Y". Sin número al inicio, va al final y se ordena
// alfabéticamente entre sí.
function naturalCompare(a: string, b: string): number {
  const leadingNumber = (s: string) => {
    const m = s.trim().match(/^(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  };
  const na = leadingNumber(a);
  const nb = leadingNumber(b);
  if (na !== null && nb !== null && na !== nb) return na - nb;
  if (na !== null && nb === null) return -1;
  if (na === null && nb !== null) return 1;
  return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
}

type TemplateCategory = { id: string; name: string };

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
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [confirmDelCategoryId, setConfirmDelCategoryId] = useState<string | null>(null);

  const VARIABLE_DESCRIPTIONS: Record<string, string> = {
    // Datos del negocio (prospección)
    business_name:    'Nombre de la empresa/negocio',
    company_name:     'Alias del nombre de la empresa',
    website:          'URL del sitio web',
    city:             'Ciudad/localidad del negocio',
    sector:           'Sector/rubro amplio del negocio (ej: Servicios para el Hogar)',
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
      'business_name', 'company_name', 'website', 'city', 'sector', 'main_competitor', 'missing_service', 'seo_gap',
      'gmb_rating', 'review_count', 'gmb_claimed', 'photo_count', 'gmb_status',
      // Auditoría
      'audit_domain', 'audit_score', 'audit_label', 'issue_count', 'warn_count', 'pass_count',
      'top_issue', 'top_issue_impact', 'ttfb', 'lcp', 'cls', 'fcp',
    ],
    whatsapp: [
      // Negocio
      'business_name', 'company_name', 'website', 'city', 'sector', 'main_competitor', 'missing_service',
      'seo_gap', 'gmb_rating', 'review_count', 'gmb_status',
      // Auditoría
      'audit_domain', 'audit_score', 'audit_label', 'issue_count', 'top_issue', 'top_issue_impact',
    ],
  };

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
    loadCategories();
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

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('io_pro_template_categories')
        .select('*');
      if (error) throw error;
      setCategories((data || []).slice().sort((a, b) => naturalCompare(a.name, b.name)));
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar categorías');
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Ya existe una categoría con ese nombre');
      return;
    }
    try {
      const { error } = await supabase.from('io_pro_template_categories').insert({ name });
      if (error) throw error;
      setNewCategoryName('');
      loadCategories();
      toast.success('Categoría creada');
    } catch (error) {
      console.error(error);
      toast.error('Error al crear categoría');
    }
  };

  const handleRenameCategory = async (cat: TemplateCategory) => {
    const name = editingCategoryName.trim();
    if (!name || name === cat.name) {
      setEditingCategoryId(null);
      return;
    }
    try {
      const { error } = await supabase.from('io_pro_template_categories').update({ name }).eq('id', cat.id);
      if (error) throw error;
      // Las plantillas guardan el nombre de categoría como texto libre, así que
      // hay que actualizarlas para que sigan apuntando a la categoría renombrada.
      const { error: cascadeError } = await supabase
        .from('io_pro_message_templates')
        .update({ category: name })
        .eq('category', cat.name);
      if (cascadeError) throw cascadeError;
      setEditingCategoryId(null);
      loadCategories();
      loadTemplates();
      toast.success('Categoría renombrada');
    } catch (error) {
      console.error(error);
      toast.error('Error al renombrar categoría');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!confirmDelCategoryId) return;
    const cat = categories.find(c => c.id === confirmDelCategoryId);
    if (!cat) return;
    const inUse = templates.filter(t => t.category === cat.name).length;
    if (inUse > 0) {
      toast.error(`No se puede borrar: ${inUse} plantilla(s) usan esta categoría`);
      setConfirmDelCategoryId(null);
      return;
    }
    try {
      const { error } = await supabase.from('io_pro_template_categories').delete().eq('id', cat.id);
      if (error) throw error;
      loadCategories();
      toast.success('Categoría eliminada');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar categoría');
    } finally {
      setConfirmDelCategoryId(null);
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const { id, created_at, updated_at, ...rest } = template;
      const payload = {
        ...rest,
        name: `${template.name} (copia)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('io_pro_message_templates').insert([payload]);
      if (error) throw error;
      loadTemplates();
      toast.success('Plantilla duplicada');
    } catch (error) {
      console.error(error);
      toast.error('Error al duplicar plantilla');
    }
  };

  // Inserta texto en la posición del cursor del textarea del cuerpo (usado
  // por el picker de emojis).
  const insertAtCursor = (insertText: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editing?.body || '';
    const newBody = text.substring(0, start) + insertText + text.substring(end);
    setEditing({ ...editing!, body: newBody });
    setTimeout(() => {
      textarea.focus();
      const pos = start + insertText.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  // Envuelve el texto seleccionado con los marcadores de formato (o inserta
  // un placeholder si no hay selección) — usado por el menú de formato .md.
  const wrapSelection = (before: string, after: string, placeholder: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editing?.body || '';
    const selected = text.substring(start, end) || placeholder;
    const newBody = text.substring(0, start) + before + selected + after + text.substring(end);
    setEditing({ ...editing!, body: newBody });
    setTimeout(() => {
      textarea.focus();
      const selStart = start + before.length;
      const selEnd = selStart + selected.length;
      textarea.setSelectionRange(selStart, selEnd);
    }, 0);
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold">Categoría</label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryManager(true)}
                      className="text-zinc-500 hover:text-blue-400 transition"
                      title="Gestionar categorías"
                    >
                      <Settings size={13} />
                    </button>
                  </div>
                  <select
                    value={editing?.category || 'GENERAL'}
                    onChange={e => setEditing({ ...editing!, category: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider font-semibold">Cuerpo del Mensaje</label>
                    <div className="flex items-center gap-1.5">
                      {/* Emojis — desplegable, no ocupa espacio hasta que se abre */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setShowEmojiMenu(v => !v); setShowFormatMenu(false); }}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition"
                          title="Insertar emoji"
                        >
                          <Smile size={14} />
                        </button>
                        {showEmojiMenu && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowEmojiMenu(false)} />
                            <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-2 grid grid-cols-8 gap-0.5">
                              {EMOJI_PICKER_LIST.map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => { insertAtCursor(emoji); setShowEmojiMenu(false); }}
                                  className="text-base hover:bg-zinc-700 rounded p-1 transition"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Formato .md — desplegable, mismo criterio */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setShowFormatMenu(v => !v); setShowEmojiMenu(false); }}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition"
                          title="Formato de texto"
                        >
                          <Type size={14} />
                        </button>
                        {showFormatMenu && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowFormatMenu(false)} />
                            <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-1.5">
                              {MARKDOWN_FORMATS.map(f => (
                                <button
                                  key={f.label}
                                  type="button"
                                  onClick={() => { wrapSelection(f.before, f.after, f.placeholder); setShowFormatMenu(false); }}
                                  className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-zinc-700 rounded text-sm text-zinc-200 transition"
                                >
                                  <span>{f.label}</span>
                                  <span className="text-xs text-zinc-500 font-mono">{f.before}{f.placeholder}{f.after}</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <textarea
                    id="template-body"
                    value={editing?.body || ''}
                    onChange={e => setEditing({ ...editing!, body: e.target.value })}
                    className="flex-1 w-full bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-none min-h-0"
                    placeholder={editing?.type === 'email'
                      ? "Hola {{business_name}},\n\nHemos detectado {{issue_count}} problemas SEO...\n\nProblema principal: {{top_issue}}\n\nUn saludo."
                      : "Hola {{business_name}} 👋\n\nHemos analizado tu web: {{seo_gap}}\n\nScore: {{audit_score}}/100 🚀"}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${
                      (editing?.body?.length || 0) > MAX_CHARS[editing?.type || 'email']
                        ? 'text-red-400 font-semibold'
                        : 'text-zinc-500'
                    }`}>
                      {(editing?.body?.length || 0)} / {MAX_CHARS[editing?.type || 'email']}
                    </span>
                  </div>
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
              {categories.map(({ name: category }) => {
                const categoryTemplates = templates
                  .filter(t => {
                    const typeMatch = filterType === 'all' || t.type === filterType;
                    return t.category === category && typeMatch;
                  })
                  .sort((a, b) => naturalCompare(a.name, b.name));

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
                              onClick={() => handleDuplicate(template)}
                              className="p-1.5 hover:bg-zinc-600/30 text-zinc-400 hover:text-white rounded transition"
                              title="Duplicar"
                            >
                              <Copy size={13} />
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

      {/* Gestión de categorías */}
      {showCategoryManager && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings size={15} /> Gestionar categorías
              </h3>
              <button
                onClick={() => { setShowCategoryManager(false); setEditingCategoryId(null); }}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-2 max-h-80 overflow-y-auto">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                  {editingCategoryId === cat.id ? (
                    <>
                      <input
                        value={editingCategoryName}
                        onChange={e => setEditingCategoryName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenameCategory(cat); if (e.key === 'Escape') setEditingCategoryId(null); }}
                        autoFocus
                        className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                      <button onClick={() => handleRenameCategory(cat)} className="p-1 text-green-400 hover:bg-green-600/20 rounded transition" title="Guardar">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingCategoryId(null)} className="p-1 text-zinc-400 hover:bg-zinc-700 rounded transition" title="Cancelar">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-white truncate">{cat.name}</span>
                      <span className="text-xs text-zinc-500 flex-shrink-0">
                        {templates.filter(t => t.category === cat.name).length} plantilla(s)
                      </span>
                      <button
                        onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }}
                        className="p-1 text-blue-400 hover:bg-blue-600/20 rounded transition flex-shrink-0"
                        title="Renombrar"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDelCategoryId(cat.id)}
                        className="p-1 text-red-400 hover:bg-red-600/20 rounded transition flex-shrink-0"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No hay categorías todavía</p>
              )}
            </div>

            <div className="px-5 py-4 border-t border-zinc-800 flex gap-2">
              <input
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }}
                placeholder="Nueva categoría..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
              >
                <Plus size={14} /> Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelCategoryId !== null}
        title="Eliminar categoría"
        message="Se eliminará esta categoría. Solo se puede borrar si ninguna plantilla la está usando."
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => setConfirmDelCategoryId(null)}
      />
    </div>
  );
}
