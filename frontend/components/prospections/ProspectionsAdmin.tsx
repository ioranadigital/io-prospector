'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Trash2, RefreshCw, MapPin, CheckCircle, Clock, XCircle, Lightbulb } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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
  const [confirmDel, setConfirmDel] = useState<{ id: string; query: string } | null>(null);

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

  const handleConfirmDelete = async () => {
    if (!confirmDel) return;
    const sessionId = confirmDel.id;
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

      toast.success('Prospección eliminada completamente');
      setConfirmDel(null);
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
                      {session.city && <span className="text-zinc-400 ml-2 inline-flex items-center gap-0.5"><MapPin size={11} /> {session.city}</span>}
                    </h4>
                    {session.category && (
                      <p className="text-xs text-zinc-500 mt-1">Categoría: {session.category}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(session.status)}`}>
                    {session.status === 'completed' && <span className="inline-flex items-center gap-1"><CheckCircle size={12} /> Completada</span>}
                    {session.status === 'in_progress' && <span className="inline-flex items-center gap-1"><Clock size={12} /> En progreso</span>}
                    {session.status === 'failed' && <span className="inline-flex items-center gap-1"><XCircle size={12} /> Error</span>}
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
                onClick={() => setConfirmDel({ id: session.id, query: session.query })}
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
        <p className="flex items-start gap-1.5">
          <Lightbulb size={13} className="text-zinc-400 flex-shrink-0 mt-0.5" /> <strong>Nota:</strong> Al eliminar una prospección se borran automáticamente todos los leads asociados. Esta acción no se puede deshacer.
        </p>
      </div>

      <ConfirmDialog
        open={confirmDel !== null}
        loading={deleting !== null}
        title="Eliminar prospección"
        message={`Se eliminará la prospección "${confirmDel?.query}" y todos sus leads. Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { if (deleting === null) setConfirmDel(null); }}
      />
    </div>
  );
}
