'use client';

import { useState, useEffect } from 'react';
import { supabase, type Lead } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { X, Save, Mail, MessageCircle, MapPin, Phone, Search, Map, Target, Trophy, Wrench, FileText, Pencil, AlertTriangle, CheckCircle, XCircle, Star } from 'lucide-react';

type LeadDetailModalProps = {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: () => void;
  onSendWhatsApp: () => void;
  onUpdate: () => void;
};

export function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onSendEmail,
  onSendWhatsApp,
  onUpdate,
}: LeadDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: lead.email || '',
    phone: lead.phone || '',
    main_competitor: lead.main_competitor || '',
    missing_service: lead.missing_service || '',
    seo_gap: lead.seo_gap || '',
    icebreaker: lead.icebreaker || '',
    notes: lead.notes || '',
  });

  useEffect(() => {
    setFormData({
      email: lead.email || '',
      phone: lead.phone || '',
      main_competitor: lead.main_competitor || '',
      missing_service: lead.missing_service || '',
      seo_gap: lead.seo_gap || '',
      icebreaker: lead.icebreaker || '',
      notes: lead.notes || '',
    });
    setEditing(false);
  }, [lead.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('io_pro_leads')
        .update({
          email: formData.email || null,
          phone: formData.phone || null,
          main_competitor: formData.main_competitor || null,
          missing_service: formData.missing_service || null,
          seo_gap: formData.seo_gap || null,
          icebreaker: formData.icebreaker || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (error) throw error;

      toast.success('Lead actualizado');
      setEditing(false);
      onUpdate();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">{lead.business_name || 'Sin nombre'}</h2>
            <p className="text-xs text-zinc-400 mt-1">ID: {lead.id.slice(0, 8)}...</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-700 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Info General */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase flex items-center gap-1.5"><MapPin size={14} /> Información General</h3>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-2 text-sm">
              <div>
                <span className="text-zinc-400">Sitio web:</span>{' '}
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noopener" className="text-blue-400 hover:underline">
                    {lead.website}
                  </a>
                ) : (
                  <span className="text-zinc-600">-</span>
                )}
              </div>
              <div>
                <span className="text-zinc-400">Ciudad:</span> <span className="text-white">{lead.city || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-400">Categoría:</span> <span className="text-white">{lead.category || '-'}</span>
              </div>
              <div>
                <span className="text-zinc-400">Agregado:</span> <span className="text-white">
                  {lead.created_at ? new Date(lead.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                </span>
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
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-zinc-700 disabled:bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed"
                  placeholder="agregar email..."
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><Phone size={12} /> Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-zinc-700 disabled:bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed"
                  placeholder="agregar teléfono..."
                />
              </div>
            </div>
          </section>

          {/* SEO Detectado */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase flex items-center gap-1.5"><Search size={14} /> SEO Detectado</h3>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Error Principal</label>
                <textarea
                  value={formData.seo_gap}
                  onChange={e => setFormData({ ...formData, seo_gap: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-zinc-700 disabled:bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed h-20"
                  placeholder="Describir el error principal..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-zinc-400">Score:</span>
                  <div className="text-white font-semibold">{lead.audit_score}/100</div>
                </div>
                <div>
                  <span className="text-zinc-400">Mobile:</span>
                  <div className="text-white">{lead.is_mobile_responsive ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}</div>
                </div>
                <div>
                  <span className="text-zinc-400">SSL:</span>
                  <div className="text-white">{lead.ssl_active ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Schema:</span>
                  <div className="text-white">{lead.has_schema ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Links rotos:</span>
                  <div className="text-white">{lead.broken_links_count || 0}</div>
                </div>
              </div>
            </div>
          </section>

          {/* GMB */}
          {(lead.gmb_rating || lead.review_count) && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase flex items-center gap-1.5"><Map size={14} /> Google Business</h3>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400 block mb-1">Rating</span>
                  <div className="text-white font-semibold flex items-center gap-1">{lead.gmb_rating || '-'} <Star size={14} className="text-yellow-400 fill-yellow-400" /></div>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-1">Reviews</span>
                  <div className="text-white">{lead.review_count || 0}</div>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-1">Claimed</span>
                  <div className="text-white">{lead.gmb_claimed ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}</div>
                </div>
              </div>
            </section>
          )}

          {/* Contexto Comercial */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase flex items-center gap-1.5"><Target size={14} /> Contexto Comercial</h3>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><Trophy size={12} /> Competidor Principal</label>
                <input
                  type="text"
                  value={formData.main_competitor}
                  onChange={e => setFormData({ ...formData, main_competitor: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-zinc-700 disabled:bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed"
                  placeholder="ej: Competencia Directa SL"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><Wrench size={12} /> Servicio Faltante</label>
                <input
                  type="text"
                  value={formData.missing_service}
                  onChange={e => setFormData({ ...formData, missing_service: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-zinc-700 disabled:bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed"
                  placeholder="ej: No tiene blog, sin SSL, etc"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><MessageCircle size={12} /> Icebreaker</label>
                <textarea
                  value={formData.icebreaker}
                  onChange={e => setFormData({ ...formData, icebreaker: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-zinc-700 disabled:bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed h-16"
                  placeholder="Personalized approach para este lead..."
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 flex items-center gap-1"><FileText size={12} /> Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-zinc-700 disabled:bg-zinc-800 border border-zinc-600 px-3 py-2 rounded text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed h-16"
                  placeholder="Notas internas sobre el lead..."
                />
              </div>
            </div>
          </section>

          {/* Acciones */}
          <div className="flex gap-2 pt-4 border-t border-zinc-700">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  <Pencil size={14} className="mr-1" /> Editar
                </button>
                <button
                  onClick={onSendEmail}
                  className="flex-1 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Mail size={16} />
                  Email
                </button>
                <button
                  onClick={onSendWhatsApp}
                  className="flex-1 px-4 py-2.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
