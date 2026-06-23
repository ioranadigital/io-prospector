'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, AlertCircle, Clock, Mail, MessageCircle } from 'lucide-react';

type Activity = {
  id: string;
  lead_id: string;
  type: 'email' | 'whatsapp';
  outcome: 'sent' | 'failed' | 'pending';
  created_at: string;
  metadata?: {
    template_name?: string;
    template_id?: string;
    direction?: string;
  };
};

export function ActivitiesTable({ leadId }: { leadId?: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');

  useEffect(() => {
    loadActivities();
  }, [leadId, filter, outcomeFilter]);

  const loadActivities = async () => {
    try {
      let query = supabase
        .from('io_pro_lead_activities')
        .select('*');

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      if (outcomeFilter !== 'all') {
        query = query.eq('outcome', outcomeFilter);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'sent':
        return <Check size={16} className="text-green-500" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-8">Cargando historial...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tipo</label>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded text-white"
          >
            <option value="all">Todos</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Estado</label>
          <select
            value={outcomeFilter}
            onChange={e => setOutcomeFilter(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded text-white"
          >
            <option value="all">Todos</option>
            <option value="sent">Enviado</option>
            <option value="failed">Error</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-zinc-800 rounded">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Plantilla</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              {!leadId && <th className="px-4 py-3 text-left">Lead ID</th>}
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={leadId ? 4 : 5} className="px-4 py-8 text-center text-zinc-400">
                  No hay actividades
                </td>
              </tr>
            ) : (
              activities.map(activity => (
                <tr key={activity.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      {activity.type === 'email'
                        ? <><Mail size={14} className="text-blue-400" /> Email</>
                        : <><MessageCircle size={14} className="text-green-400" /> WhatsApp</>
                      }
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {getOutcomeIcon(activity.outcome)}
                    <span className="capitalize">
                      {activity.outcome === 'sent' && 'Enviado'}
                      {activity.outcome === 'failed' && 'Error'}
                      {activity.outcome === 'pending' && 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-300">
                    {activity.metadata?.template_name || 'Sin plantilla'}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {formatDate(activity.created_at)}
                  </td>
                  {!leadId && (
                    <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                      {activity.lead_id.slice(0, 8)}...
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-zinc-400">
        Mostrando {activities.length} actividades
      </div>
    </div>
  );
}
