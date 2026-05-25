'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, RefreshCw } from 'lucide-react';

type SearchSession = {
  id: string;
  query: string;
  city: string;
  category: string | null;
  pages_from: number;
  pages_to: number;
  status: string;
  total_found: number;
  created_at: string;
  updated_at: string;
  leads_count?: number;
};

export function ProspectionsAdmin() {
  const [sessions, setSessions] = useState<SearchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('io_pro_search_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener conteo de leads por sesión
      const sessionsWithCounts = await Promise.all(
        (data || []).map(async (session) => {
          const { count } = await supabase
            .from('io_pro_leads')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          return {
            ...session,
            leads_count: count || 0,
          };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar prospecciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string, sessionQuery: string) => {
    if (!confirm(`¿Eliminar la prospección "${sessionQuery}"? Se borrarán también todos sus leads. Esta acción NO se puede deshacer.`)) {
      return;
    }

    setDeleting(sessionId);
    try {
      // Primero eliminar todos los leads asociados
      const { error: leadsError } = await supabase
        .from('io_pro_leads')
        .delete()
        .eq('session_id', sessionId);

      if (leadsError) throw leadsError;

      // Luego eliminar la sesión
      const { error: sessionError } = await supabase
        .from('io_pro_search_sessions')
        .delete()
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      toast.success('✅ Prospección eliminada completamente');
      loadSessions();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar prospección');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/20 text-green-400';
      case 'in_progress':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'failed':
        return 'bg-red-600/20 text-red-400';
      default:
        return 'bg-zinc-600/20 text-zinc-400';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando prospecciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Prospecciones Guardadas ({sessions.length})
        </h3>
        <button
          onClick={loadSessions}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 bg-zinc-800 border border-zinc-700 rounded-lg">
          <p className="text-zinc-400">No hay prospecciones guardadas</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 flex items-start justify-between hover:border-zinc-600 transition"
            >
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">
                      {session.query}
                      {session.city && <span className="text-zinc-400 ml-2">📍 {session.city}</span>}
                    </h4>
                    {session.category && (
                      <p className="text-xs text-zinc-500 mt-1">Categoría: {session.category}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(session.status)}`}>
                    {session.status === 'completed' && '✅ Completada'}
                    {session.status === 'in_progress' && '⏳ En progreso'}
                    {session.status === 'failed' && '❌ Error'}
                  </span>
                </div>

                {/* Info */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500">Leads encontrados:</span>
                    <p className="font-semibold text-white">{session.leads_count || session.total_found}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Páginas:</span>
                    <p className="font-semibold text-white">{session.pages_from} → {session.pages_to}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Fecha:</span>
                    <p className="font-semibold text-white">{formatDate(session.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Botón Eliminar */}
              <button
                onClick={() => handleDelete(session.id, session.query)}
                disabled={deleting === session.id}
                className="ml-4 p-2 bg-red-600/20 hover:bg-red-600/40 disabled:opacity-50 text-red-400 rounded transition"
                title="Eliminar prospección (se borran también todos sus leads)"
              >
                {deleting === session.id ? (
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-xs text-zinc-400">
        <p>
          💡 <strong>Nota:</strong> Al eliminar una prospección se borran automáticamente todos los leads asociados. Esta acción no se puede deshacer.
        </p>
      </div>
    </div>
  );
}
