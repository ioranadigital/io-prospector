// frontend/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Download, Eye, Calendar, MapPin, TrendingUp, RefreshCw, Trash2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { saveProspectionToSupabase } from '@/lib/prospections';

export default function DashboardPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await api.getProspectionHistory();
      const historyData = Array.isArray(data) ? data : [];

      // Verificar cuáles están guardadas en Supabase
      const { data: savedSessions } = await supabase
        .from('io_prosp_search_sessions')
        .select('id')
        .catch(() => ({ data: [] }));

      const savedIds = new Set(savedSessions?.map((s: any) => s.id) || []);

      // Marcar cuáles están guardadas
      const enrichedHistory = historyData.map((item: any) => ({
        ...item,
        result: {
          ...item.result,
          isSaved: savedIds.has(item.id),
        },
      }));

      setHistory(enrichedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    }
    setLoading(false);
  }

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? '✅' : status === 'error' ? '❌' : '⏳';
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-yellow-400';
  };

  const totalLeads = history.reduce((acc, h) => acc + (h.result?.leadsCount || 0), 0);
  const completedProspections = history.filter(h => h.status === 'completed').length;

  const handleSaveProspection = async (item: any) => {
    try {
      await saveProspectionToSupabase({
        id: item.id,
        query: item.params?.query || item.params?.category,
        city: item.params?.municipio || item.params?.city,
        category: item.params?.category,
        pages_from: item.params?.pagesFrom,
        pages_to: item.params?.pagesTo,
        status: 'completed',
        total_found: item.result?.leadsCount || 0,
      });
      toast.success('✅ Prospección guardada');
      loadHistory();
    } catch (error: any) {
      toast.error(`Error: ${error?.message || 'Error desconocido'}`);
      console.error(error);
    }
  };

  const handleDeleteProspection = async (prospectionId: string, query: string) => {
    if (!confirm(`¿Eliminar la prospección "${query}"? Se borrarán también todos sus leads. Esta acción NO se puede deshacer.`)) {
      return;
    }

    try {
      // Eliminar leads asociados
      await supabase.from('io_prosp_leads').delete().eq('session_id', prospectionId);
      // Eliminar prospección
      await supabase.from('io_prosp_search_sessions').delete().eq('id', prospectionId);
      toast.success('✅ Prospección eliminada');
      loadHistory();
    } catch (error) {
      toast.error('Error al eliminar prospección');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">📊 Histórico de Prospecciones</h1>
          <p className="text-zinc-400 text-sm mt-1">Todas las búsquedas realizadas en el sistema</p>
        </div>
        <button
          onClick={loadHistory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
            <TrendingUp size={14} />
            Prospecciones
          </div>
          <p className="text-2xl font-bold text-white">{history.length}</p>
          <p className="text-xs text-zinc-600 mt-1">{completedProspections} completadas</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
            <MapPin size={14} />
            Leads Totales
          </div>
          <p className="text-2xl font-bold text-white">{totalLeads}</p>
          <p className="text-xs text-zinc-600 mt-1">En todas las búsquedas</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
            <Calendar size={14} />
            Última búsqueda
          </div>
          <p className="text-2xl font-bold text-white">
            {history.length > 0
              ? new Date(history[0].startedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
              : '—'
            }
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            {history.length > 0
              ? new Date(history[0].startedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
              : 'Sin búsquedas aún'
            }
          </p>
        </div>
      </div>

      {/* Tabla de histórico */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-zinc-600">
            <RefreshCw size={16} className="animate-spin mr-2" /> Cargando histórico...
          </div>
        ) : history.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-zinc-600">
            <p>No hay prospecciones aún. <strong>¡Crea tu primera búsqueda en Prospector!</strong></p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-800 border-b border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Búsqueda</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Ciudad</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Leads</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {history.map((item: any) => (
                <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className={`px-6 py-3 text-sm font-semibold ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)} {item.status === 'completed' ? 'Completada' : item.status === 'error' ? 'Error' : 'En progreso'}
                  </td>
                  <td className="px-6 py-3 text-zinc-200 font-medium">
                    <span className="text-white">{item.params?.query || item.params?.category}</span>
                    <span className="text-zinc-500 text-xs ml-2">(Pág. {item.params?.pagesFrom}–{item.params?.pagesTo})</span>
                  </td>
                  <td className="px-6 py-3 text-zinc-300">{item.params?.city}</td>
                  <td className="px-6 py-3 text-zinc-300 font-semibold">{item.result?.leadsCount || 0}</td>
                  <td className="px-6 py-3 text-zinc-500 text-xs">
                    {new Date(item.startedAt).toLocaleDateString('es-ES')}
                    <div className="text-zinc-600">{new Date(item.startedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'completed' && (
                        <>
                          <button
                            onClick={() => handleSaveProspection(item)}
                            disabled={item.result?.isSaved}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                              item.result?.isSaved
                                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                : 'bg-green-900 hover:bg-green-800 text-green-200'
                            }`}
                            title={item.result?.isSaved ? 'Ya guardada' : 'Guardar en Histórico'}
                          >
                            <Save size={12} /> Guardar
                          </button>
                          <a
                            href={`http://localhost:4001/api/scraping/view/${item.id}/dashboard`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-900 hover:bg-purple-800 text-purple-200 rounded transition-colors"
                          >
                            <Eye size={12} /> Ver
                          </a>
                          <a
                            href={`http://localhost:4001/api/scraping/download/${item.id}/csv`}
                            download
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-900 hover:bg-blue-800 text-blue-200 rounded transition-colors"
                          >
                            <Download size={12} /> CSV
                          </a>
                          <button
                            onClick={() => handleDeleteProspection(item.id, item.params?.query || item.params?.category)}
                            disabled={!item.result?.isSaved}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                              item.result?.isSaved
                                ? 'bg-red-900 hover:bg-red-800 text-red-200'
                                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                            }`}
                            title={item.result?.isSaved ? 'Eliminar prospección y leads' : 'Solo se pueden eliminar prospecciones guardadas'}
                          >
                            <Trash2 size={12} /> Eliminar
                          </button>
                        </>
                      )}
                      {item.status === 'error' && (
                        <span className="text-xs text-red-400">{item.error || 'Error desconocido'}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
