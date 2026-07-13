'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SECTORS } from '@/lib/sectors';
import toast from 'react-hot-toast';
import {
  X, Plus, MapPin, Mail, Phone, Search, AlertTriangle, Map, Star,
  Target, Trophy, Wrench, MessageCircle, FileText, ChevronDown, ChevronRight,
} from 'lucide-react';

type AddLeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const EMPTY_FORM = {
  business_name: '',
  website: '',
  city: '',
  category: '',
  email: '',
  phone: '',
  audit_score: '',
  seo_gap: '',
  ssl_active: false,
  is_mobile_responsive: false,
  has_schema: false,
  broken_links_count: '',
  gmb_rating: '',
  review_count: '',
  gmb_claimed: false,
  photo_count: '',
  main_competitor: '',
  missing_service: '',
  icebreaker: '',
  notes: '',
};

// Añade leads que no vienen del scraping. Todos los campos de análisis se
// rellenan a mano aquí — el envío de email/WhatsApp sigue el flujo normal
// (SendModal/EmailSendModal) una vez creado el lead, no se toca en este modal.
export function AddLeadModal({ isOpen, onClose, onCreated }: AddLeadModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sectors, setSectors] = useState<any[]>(SECTORS);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('');
  const [showSeo, setShowSeo] = useState(false);
  const [showGmb, setShowGmb] = useState(false);

  const selectedCategory = sectors.find(s => s.category === selectedCategoryGroup);

  // Mismas categorías/sectores que Prospector (io_pro_categories + io_pro_sectors),
  // para que la categoría de un lead manual siempre case con la de prospección.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('io_pro_categories')
          .select(`id, name, sort_order, io_pro_sectors(id, name, sort_order)`)
          .order('sort_order');
        if (error) throw error;
        if (data && data.length > 0) {
          setSectors(data.map((cat: any) => ({
            category: cat.name,
            subcategories: (cat.io_pro_sectors || []).map((sector: any) => ({ name: sector.name })),
          })));
        }
      } catch (err) {
        console.warn('Could not load categories from Supabase, using defaults:', err);
        setSectors(SECTORS);
      }
    };
    loadCategories();
  }, []);

  if (!isOpen) return null;

  const set = (field: keyof typeof EMPTY_FORM, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleClose = () => {
    if (saving) return;
    setForm(EMPTY_FORM);
    setSelectedCategoryGroup('');
    setShowSeo(false);
    setShowGmb(false);
    onClose();
  };

  const toIntOrNull = (v: string) => (v.trim() === '' ? null : parseInt(v, 10));
  const toFloatOrNull = (v: string) => (v.trim() === '' ? null : parseFloat(v));

  const handleSubmit = async () => {
    if (!form.business_name.trim()) {
      toast.error('El nombre del negocio es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('io_pro_leads').insert({
        business_name: form.business_name.trim(),
        website: form.website.trim() || null,
        city: form.city.trim() || null,
        category: form.category.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        audit_score: toIntOrNull(form.audit_score) ?? 0,
        seo_gap: form.seo_gap.trim() || null,
        ssl_active: form.ssl_active,
        is_mobile_responsive: form.is_mobile_responsive,
        has_schema: form.has_schema,
        broken_links_count: toIntOrNull(form.broken_links_count),
        gmb_rating: toFloatOrNull(form.gmb_rating),
        review_count: toIntOrNull(form.review_count),
        gmb_claimed: form.gmb_claimed,
        photo_count: toIntOrNull(form.photo_count),
        main_competitor: form.main_competitor.trim() || null,
        missing_service: form.missing_service.trim() || null,
        icebreaker: form.icebreaker.trim() || null,
        notes: form.notes.trim() || null,
        session_id: null,
        source: 'manual',
        status: 'active',
        crm_status: 'new',
        priority: 'normal',
      });

      if (error) throw error;

      toast.success('Lead añadido');
      setForm(EMPTY_FORM);
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error al crear el lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-6 flex justify-between items-start z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Plus size={20} /> Añadir Lead Manual</h2>
            <p className="text-xs text-zinc-400 mt-1">No pasa por scraping ni auditoría automática — rellena tú los datos.</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-zinc-700 rounded">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info general */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase flex items-center gap-1.5"><MapPin size={14} /> Información General</h3>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nombre del negocio *</label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={e => set('business_name', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                  placeholder="ej: Óptica Palacios"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Sitio web</label>
                  <input
                    type="text"
                    value={form.website}
                    onChange={e => set('website', e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Categoría Principal</label>
                  <select
                    value={selectedCategoryGroup}
                    onChange={e => {
                      setSelectedCategoryGroup(e.target.value);
                      set('category', '');
                    }}
                    className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {sectors.map((sector: any) => (
                      <option key={sector.category} value={sector.category}>{sector.category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Subcategoría / Sector</label>
                  <select
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    disabled={!selectedCategory}
                    className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar sector...</option>
                    {selectedCategory?.subcategories.map((sub: any) => (
                      <option key={sub.name} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase flex items-center gap-1.5"><Phone size={14} /> Contacto</h3>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><Mail size={12} /> Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                  placeholder="necesario para poder enviarle email después"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><Phone size={12} /> Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                />
              </div>
            </div>
          </section>

          {/* SEO (manual) — colapsado por defecto */}
          <section className="space-y-3">
            <button
              type="button"
              onClick={() => setShowSeo(v => !v)}
              className="w-full text-sm font-semibold text-zinc-400 uppercase flex items-center gap-1.5 hover:text-zinc-200 transition"
            >
              {showSeo ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Search size={14} /> SEO (evaluación manual)
            </button>
            {showSeo && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Error Principal</label>
                  <textarea
                    value={form.seo_gap}
                    onChange={e => set('seo_gap', e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 h-16"
                    placeholder="ej: sin SSL, web no responsive..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Score (0-100)</label>
                    <input
                      type="number" min={0} max={100}
                      value={form.audit_score}
                      onChange={e => set('audit_score', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Links rotos</label>
                    <input
                      type="number" min={0}
                      value={form.broken_links_count}
                      onChange={e => set('broken_links_count', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-300 pt-1">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={form.ssl_active} onChange={e => set('ssl_active', e.target.checked)} /> SSL activo
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={form.is_mobile_responsive} onChange={e => set('is_mobile_responsive', e.target.checked)} /> Responsive
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={form.has_schema} onChange={e => set('has_schema', e.target.checked)} /> Schema/JSON-LD
                  </label>
                </div>
              </div>
            )}
          </section>

          {/* Google Business (manual) — colapsado por defecto */}
          <section className="space-y-3">
            <button
              type="button"
              onClick={() => setShowGmb(v => !v)}
              className="w-full text-sm font-semibold text-zinc-400 uppercase flex items-center gap-1.5 hover:text-zinc-200 transition"
            >
              {showGmb ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Map size={14} /> Google Business (evaluación manual)
            </button>
            {showGmb && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><Star size={12} /> Rating</label>
                    <input
                      type="number" min={0} max={5} step={0.1}
                      value={form.gmb_rating}
                      onChange={e => set('gmb_rating', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Reviews</label>
                    <input
                      type="number" min={0}
                      value={form.review_count}
                      onChange={e => set('review_count', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Fotos</label>
                    <input
                      type="number" min={0}
                      value={form.photo_count}
                      onChange={e => set('photo_count', e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <input type="checkbox" checked={form.gmb_claimed} onChange={e => set('gmb_claimed', e.target.checked)} /> Ficha de Google reclamada
                </label>
              </div>
            )}
          </section>

          {/* Contexto comercial */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase flex items-center gap-1.5"><Target size={14} /> Contexto Comercial</h3>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><Trophy size={12} /> Competidor Principal</label>
                <input
                  type="text"
                  value={form.main_competitor}
                  onChange={e => set('main_competitor', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                  placeholder="ej: Competencia Directa SL"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><Wrench size={12} /> Servicio Faltante</label>
                <input
                  type="text"
                  value={form.missing_service}
                  onChange={e => set('missing_service', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500"
                  placeholder="ej: No tiene blog, sin SSL, etc"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><MessageCircle size={12} /> Icebreaker</label>
                <textarea
                  value={form.icebreaker}
                  onChange={e => set('icebreaker', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 h-16"
                  placeholder="Enfoque personalizado para este lead..."
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><FileText size={12} /> Notas</label>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 h-16"
                  placeholder="Notas internas..."
                />
              </div>
            </div>
          </section>

          {/* Acciones */}
          <div className="flex gap-2 pt-4 border-t border-zinc-700">
            <button
              onClick={handleClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              {saving ? 'Guardando...' : 'Crear Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
