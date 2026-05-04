'use client';
import { useState, useEffect } from 'react';
import { Search, Loader2, Play, CheckCircle, AlertCircle, Download, Eye, Clock, Save, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { SECTORS } from '@/lib/sectors';
import { getComunidadesAutonomas, getProvincias, getMunicipios } from '@/lib/geographic-data';
import toast from 'react-hot-toast';
import { saveProspectionToSupabase } from '@/lib/prospections';
import { LeadsTable } from '@/components/LeadsTable';
import { EmailSendModal } from '@/components/EmailSendModal';
import { WhatsAppSendModal } from '@/components/WhatsAppSendModal';

export default function ProspectorPage() {
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('');
  const [form, setForm] = useState({ query: '', ccaa: '', provincia: '', municipio: '', category: '', pagesFrom: 2, pagesTo: 3 });
  const [loading, setLoading] = useState(false);
  const [prospectionId, setProspectionId] = useState<string | null>(null);
  const [prospectionStatus, setProspectionStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [savedProspections, setSavedProspections] = useState<Set<string>>(new Set());

  const selectedCategory = SECTORS.find(s => s.category === selectedCategoryGroup);

  // Cargar historial
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const h = await api.getProspectionHistory();
        setHistory(Array.isArray(h) ? h : []);

        // Verificar cuáles están guardadas en Supabase
        const { data: savedSessions } = await supabase
          .from('io_prosp_search_sessions')
          .select('id')
          .catch(() => ({ data: [] }));

        const savedIds = new Set(savedSessions?.map((s: any) => s.id) || []);
        setSavedProspections(savedIds);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    loadHistory();
  }, []);

  // Polling de estado cuando hay prospección en progreso
  useEffect(() => {
    if (!prospectionId) return;

    const interval = setInterval(async () => {
      try {
        const status = await api.getProspectionStatus(prospectionId);
        setProspectionStatus(status);

        if (status.status === 'completed') {
          setLoading(false);
          clearInterval(interval); // Detener polling cuando completa
          toast.success('✅ Prospección completada');
          // Cargar leads de esta prospección
          const leadsData = await api.getLeads({ session_id: prospectionId }).catch(() => []);
          setLeads(Array.isArray(leadsData) ? leadsData : []);
          // Recargar historial
          api.getProspectionHistory().then((h: any) => setHistory(Array.isArray(h) ? h : [])).catch(() => {});
        } else if (status.status === 'error') {
          setLoading(false);
          clearInterval(interval); // Detener polling cuando hay error
          toast.error(`❌ Error: ${status.error}`);
        }
      } catch (err) {
        console.error('Status polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [prospectionId]);

  async function handleSearch() {
    if (!form.query && !form.category) return toast.error('Selecciona una categoría o escribe una query');
    if (!form.municipio) return toast.error('Selecciona una comunidad, provincia y municipio');

    setLoading(true);
    try {
      const result = await api.startProspection({
        query: form.query || form.category,
        city: form.municipio,
        ccaa: form.ccaa,
        provincia: form.provincia,
        municipio: form.municipio,
        category: form.category || form.query,
        pagesFrom: form.pagesFrom,
        pagesTo: form.pagesTo,
      });

      setProspectionId(result.id);
      setProspectionStatus({ status: 'starting', progress: 0 });
      toast.success('🚀 Scraping iniciado...');
    } catch (e: any) {
      toast.error(e.message);
      setLoading(false);
    }
  }

  const handleOpenEmailModal = (selectedLeads: any[]) => {
    setSelectedLeads(selectedLeads);
    setEmailModalOpen(true);
  };

  const handleOpenWhatsAppModal = (selectedLeads: any[]) => {
    setSelectedLeads(selectedLeads);
    setWhatsappModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Recargar leads para reflejar cambios de estado
    if (prospectionId) {
      api.getLeads({ session_id: prospectionId }).then(l => setLeads(Array.isArray(l) ? l : [])).catch(() => {});
    }
  };

  const handleDeleteProspection = async (prospectionId: string, query: string, isSaved: boolean) => {
    if (!confirm(`¿Eliminar la prospección "${query}"?${isSaved ? ' Se borrarán también todos sus leads.' : ''} Esta acción NO se puede deshacer.`)) {
      return;
    }

    try {
      if (isSaved) {
        // Eliminar leads asociados
        await supabase.from('io_prosp_leads').delete().eq('session_id', prospectionId);
        // Eliminar prospección guardada
        await supabase.from('io_prosp_search_sessions').delete().eq('id', prospectionId);
        setSavedProspections(prev => {
          const next = new Set(prev);
          next.delete(prospectionId);
          return next;
        });
      }
      toast.success('✅ Prospección eliminada');
    } catch (error) {
      toast.error('Error al eliminar prospección');
      console.error(error);
    }
  };

  const handleSaveProspection = async () => {
    if (!prospectionStatus || prospectionStatus.status !== 'completed') {
      toast.error('Solo se pueden guardar prospecciones completadas');
      return;
    }

    try {
      await saveProspectionToSupabase({
        id: prospectionId!,
        query: form.query || form.category,
        city: form.municipio,
        category: form.category,
        pages_from: form.pagesFrom,
        pages_to: form.pagesTo,
        status: 'completed',
        total_found: prospectionStatus.result?.leadsCount || 0,
      });
      const newSet = new Set(savedProspections);
      newSet.add(prospectionId!);
      setSavedProspections(newSet);
      toast.success('✅ Prospección guardada en Histórico');
    } catch (error: any) {
      const errorMsg = error?.message || 'Error desconocido';
      toast.error(`Error: ${errorMsg}`);
      console.error('Save error:', error);
    }
  };

  const statusColors = {
    starting: 'text-blue-400',
    processing: 'text-blue-400',
    completed: 'text-green-400',
    error: 'text-red-400',
  };

  const statusIcons = {
    starting: <Loader2 size={16} className="animate-spin" />,
    processing: <Loader2 size={16} className="animate-spin" />,
    completed: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
  };

  return (
    <div className="space-y-8 fade-in max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white">🔍 Prospector</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Busca negocios en Google e identifica sus debilidades SEO automáticamente. Genera dashboards y campañas de email personalizadas.
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Categoría Principal</label>
            <select
              value={selectedCategoryGroup}
              onChange={e => {
                setSelectedCategoryGroup(e.target.value);
                setForm(f => ({ ...f, category: '', query: '' }));
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">Seleccionar categoría...</option>
              {SECTORS.map(sector => (
                <option key={sector.category} value={sector.category}>{sector.category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Subcategoría / Sector</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value, query: e.target.value }))}
              disabled={!selectedCategory}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar sector...</option>
              {selectedCategory?.subcategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Query personalizada (opcional)</label>
          <input
            type="text"
            placeholder="Ej: fontaneros urgente, reparación grifo, etc."
            value={form.query}
            onChange={e => setForm(f => ({ ...f, query: e.target.value }))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Comunidad Autónoma</label>
            <select
              value={form.ccaa}
              onChange={e => setForm(f => ({ ...f, ccaa: e.target.value, provincia: '', municipio: '' }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">Seleccionar CCAA...</option>
              {getComunidadesAutonomas().map(ccaa => (
                <option key={ccaa} value={ccaa}>{ccaa}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Provincia</label>
            <select
              value={form.provincia}
              onChange={e => setForm(f => ({ ...f, provincia: e.target.value, municipio: '' }))}
              disabled={!form.ccaa}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar provincia...</option>
              {form.ccaa && getProvincias(form.ccaa).map(provincia => (
                <option key={provincia} value={provincia}>{provincia}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">Municipio</label>
            <select
              value={form.municipio}
              onChange={e => setForm(f => ({ ...f, municipio: e.target.value }))}
              disabled={!form.provincia}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar municipio...</option>
              {form.provincia && getMunicipios(form.ccaa, form.provincia).map(municipio => (
                <option key={municipio} value={municipio}>{municipio}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Páginas de Google: {form.pagesFrom} → {form.pagesTo}
            <span className="normal-case font-normal text-zinc-600 ml-1">(siempre salta la pág. 1)</span>
          </label>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <p className="text-xs text-zinc-600 mb-1">Desde página</p>
              <input type="range" min="2" max="10" value={form.pagesFrom}
                onChange={e => setForm(f => ({ ...f, pagesFrom: Number(e.target.value) }))} className="w-full" />
              <p className="text-xs text-zinc-400 mt-1">Página {form.pagesFrom}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-600 mb-1">Hasta página</p>
              <input type="range" min="2" max="15" value={form.pagesTo}
                onChange={e => setForm(f => ({ ...f, pagesTo: Number(e.target.value) }))} className="w-full" />
              <p className="text-xs text-zinc-400 mt-1">Página {form.pagesTo}</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            ~{(form.pagesTo - form.pagesFrom + 1) * 10} resultados a analizar (⏱️ ~{(form.pagesTo - form.pagesFrom + 1) * 2}-3 minutos)
          </p>
        </div>

        <button onClick={handleSearch} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {loading ? `Buscando... ${prospectionStatus?.progress || 0}%` : 'Iniciar prospección'}
        </button>
      </div>

      {/* Estado de prospección en progreso */}
      {prospectionStatus && prospectionStatus.status !== 'completed' && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-blue-400" />
            <div>
              <p className="text-white font-semibold">Prospección en progreso...</p>
              <p className="text-zinc-400 text-sm">Query: <strong>{prospectionStatus?.params?.query}</strong> en <strong>{prospectionStatus?.params?.municipio || prospectionStatus?.params?.city}</strong></p>
            </div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300" style={{ width: `${prospectionStatus?.progress || 0}%` }}></div>
          </div>
          <p className="text-xs text-zinc-400">Progreso: {prospectionStatus?.progress || 0}%</p>
        </div>
      )}

      {/* Prospección completada */}
      {prospectionStatus && prospectionStatus.status === 'completed' && (
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-green-400" />
            <div>
              <p className="text-white font-semibold">✅ Prospección completada</p>
              <p className="text-zinc-400 text-sm">{prospectionStatus?.result?.leadsCount} leads encontrados y analizados</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={handleSaveProspection}
              className="flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Save size={16} /> Guardar
            </button>
            <a
              href={`${api.downloadFile(prospectionId!, 'csv')}`}
              download
              className="flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Download size={16} /> CSV
            </a>
            <a
              href={`http://localhost:4001/api/scraping/view/${prospectionId}/dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Eye size={16} /> Dashboard
            </a>
            <a
              href={`${api.downloadFile(prospectionId!, 'emails')}`}
              download
              className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Download size={16} /> Emails
            </a>
          </div>
        </div>
      )}

      {/* Error */}
      {prospectionStatus && prospectionStatus.status === 'error' && (
        <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <div>
              <p className="text-white font-semibold">❌ Error en la prospección</p>
              <p className="text-red-400 text-sm">{prospectionStatus?.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Leads */}
      {prospectionStatus?.status === 'completed' && leads.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">📊 Leads Encontrados</h2>
          <LeadsTable
            leads={leads}
            onEmailClick={handleOpenEmailModal}
            onWhatsAppClick={handleOpenWhatsAppModal}
            loading={false}
          />
        </div>
      )}

      {/* Historial */}
      {history.length > 0 && !prospectionStatus && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">📋 Historial Reciente</h2>
          <div className="space-y-2">
            {history.slice(0, 5).map((h: any) => (
              <div key={h.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                <div>
                  {h.status === 'completed' ? <CheckCircle size={13} className="text-green-400" /> : <Clock size={13} className="text-zinc-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 font-medium truncate">{h.params?.query} - {h.params?.municipio || h.params?.city}</p>
                  <p className="text-xs text-zinc-500">Pág. {h.params?.pagesFrom}–{h.params?.pagesTo}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-zinc-300">{h.result?.leadsCount || 0} leads</p>
                  <p className="text-xs text-zinc-600">{new Date(h.startedAt).toLocaleDateString('es')}</p>
                </div>
                {h.status === 'completed' && (
                  <div className="flex gap-1">
                    <button
                      onClick={async () => {
                        try {
                          await saveProspectionToSupabase({
                            id: h.id,
                            query: h.params?.query || h.params?.category,
                            city: h.params?.municipio,
                            category: h.params?.category,
                            pages_from: h.params?.pagesFrom,
                            pages_to: h.params?.pagesTo,
                            status: 'completed',
                            total_found: h.result?.leadsCount || 0,
                          });
                          const newSet = new Set(savedProspections);
                          newSet.add(h.id);
                          setSavedProspections(newSet);
                          toast.success('✅ Prospección guardada');
                        } catch (error: any) {
                          toast.error(`Error: ${error?.message || 'Error desconocido'}`);
                        }
                      }}
                      disabled={savedProspections.has(h.id)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        savedProspections.has(h.id)
                          ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                          : 'bg-green-900 hover:bg-green-800 text-green-200'
                      }`}
                      title={savedProspections.has(h.id) ? 'Ya guardada' : 'Guardar en Histórico'}
                    >
                      <Save size={12} />
                    </button>
                    <a
                      href={`${api.downloadFile(h.id, 'csv')}`}
                      download
                      className="text-xs px-2 py-1 bg-blue-900 hover:bg-blue-800 text-blue-200 rounded transition-colors"
                      title="Descargar CSV"
                    >
                      <Download size={12} />
                    </a>
                    <a
                      href={`http://localhost:4001/api/scraping/view/${h.id}/dashboard`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 bg-purple-900 hover:bg-purple-800 text-purple-200 rounded transition-colors"
                      title="Ver Dashboard"
                    >
                      <Eye size={12} />
                    </a>
                    <a
                      href={`${api.downloadFile(h.id, 'emails')}`}
                      download
                      className="text-xs px-2 py-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded transition-colors"
                      title="Descargar Emails"
                    >
                      <Download size={12} />
                    </a>
                    <button
                      onClick={() => handleDeleteProspection(h.id, h.params?.query || h.params?.category, savedProspections.has(h.id))}
                      className="text-xs px-2 py-1 bg-red-900 hover:bg-red-800 text-red-200 rounded transition-colors"
                      title={savedProspections.has(h.id) ? 'Eliminar (con leads)' : 'Eliminar'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modales */}
      <EmailSendModal
        leads={selectedLeads}
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
      <WhatsAppSendModal
        leads={selectedLeads}
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
