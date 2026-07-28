'use client';

import { useEffect, useState } from 'react';
import { supabase, type Lead, type LeadActivity } from '@/lib/supabase';
import { ChevronRight, ChevronDown, Mail, MessageCircle, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Hace momentos';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `Hace ${diffDays}d`;
}

export function ActivitiesTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: leadsData, error: leadsError }, { data: activitiesData, error: activitiesError }] = await Promise.all([
        supabase
          .from('io_pro_leads')
          .select('*')
          // Excluir candidatos del scraping (solo se ven tras promoverse a Leads),
          // mismo criterio que LeadsTable.tsx.
          .or('status.is.null,status.neq.candidate')
          .order('business_name', { ascending: true }),
        supabase.from('io_pro_lead_activities').select('*').order('created_at', { ascending: false }),
      ]);

      if (leadsError) throw leadsError;
      if (activitiesError) throw activitiesError;

      setLeads(leadsData || []);
      setActivities(activitiesData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (leadId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const activitiesByLead = activities.reduce<Record<string, LeadActivity[]>>((acc, a) => {
    (acc[a.lead_id] ||= []).push(a);
    return acc;
  }, {});

  const filteredLeads = leads.filter(l =>
    !search || (l.business_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const rows = filteredLeads
    .map(lead => {
      const leadActivities = (activitiesByLead[lead.id] || []).filter(
        a => typeFilter === 'all' || a.type === typeFilter
      );
      const last = leadActivities[0];
      return { lead, activities: leadActivities, last };
    })
    .sort((a, b) => {
      const aPending = a.last?.direction === 'inbound';
      const bPending = b.last?.direction === 'inbound';
      if (aPending !== bPending) return aPending ? -1 : 1;
      if (a.last && b.last) return new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime();
      if (a.last) return -1;
      if (b.last) return 1;
      return (a.lead.business_name || '').localeCompare(b.lead.business_name || '');
    });

  if (loading) {
    return <div className="text-center py-8">Cargando historial...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">Buscar cliente</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nombre del negocio..."
              className="w-full bg-zinc-800 border border-zinc-700 pl-8 pr-3 py-2 rounded text-white text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tipo</label>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded text-white text-sm"
          >
            <option value="all">Todos</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      <div className="border border-zinc-800 rounded divide-y divide-zinc-800">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-zinc-400 text-sm">No hay clientes</div>
        ) : (
          rows.map(({ lead, activities: leadActivities, last }) => {
            const isOpen = expanded.has(lead.id);
            const hasPendingReply = last?.direction === 'inbound';
            return (
              <div key={lead.id} className={hasPendingReply ? 'bg-amber-950/20' : ''}>
                <button
                  onClick={() => toggle(lead.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition"
                >
                  {isOpen ? <ChevronDown size={14} className="text-zinc-500 flex-shrink-0" /> : <ChevronRight size={14} className="text-zinc-500 flex-shrink-0" />}
                  <span className="text-sm font-medium text-white flex-1 truncate">{lead.business_name || 'Sin nombre'}</span>
                  {hasPendingReply && (
                    <span className="text-xs text-amber-400 flex items-center gap-1 flex-shrink-0">
                      <ArrowDownLeft size={12} /> Respondió
                    </span>
                  )}
                  <span className="text-xs text-zinc-500 flex-shrink-0">
                    {leadActivities.length} {leadActivities.length === 1 ? 'envío' : 'envíos'}
                  </span>
                  {last && (
                    <span className="text-xs text-zinc-500 flex-shrink-0 w-16 text-right">{timeAgo(last.created_at)}</span>
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 pl-11">
                    {leadActivities.length === 0 ? (
                      <p className="text-xs text-zinc-500">Sin contacto registrado todavía.</p>
                    ) : (
                      <ul className="space-y-2">
                        {leadActivities.map(activity => {
                          const isInbound = activity.direction === 'inbound';
                          const label = isInbound
                            ? (activity.metadata?.body || activity.body || 'Respuesta recibida')
                            : (activity.metadata?.template_name || activity.body || 'Contacto');
                          return (
                            <li key={activity.id} className="flex items-start gap-2 text-sm">
                              {isInbound ? (
                                <ArrowDownLeft size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <ArrowUpRight size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                              )}
                              {activity.type === 'email' ? (
                                <Mail size={12} className="text-zinc-500 flex-shrink-0 mt-1" />
                              ) : (
                                <MessageCircle size={12} className="text-zinc-500 flex-shrink-0 mt-1" />
                              )}
                              <span className="text-zinc-200 truncate flex-1">{label}</span>
                              <span className="text-xs text-zinc-500 flex-shrink-0">{timeAgo(activity.created_at)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="text-xs text-zinc-400">
        Mostrando {rows.length} clientes
      </div>
    </div>
  );
}
