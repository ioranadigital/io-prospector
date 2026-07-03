'use client';

import React, { useEffect, useState } from 'react';
import { supabase, type Lead } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { BarChart3, CheckCircle2, Circle, Trash2, CheckCircle, XCircle, Clock, Mail, MessageCircle, Star, Copy, ClipboardList } from 'lucide-react';
import { SendModal } from './SendModal';
import { LeadDetailModal } from './LeadDetailModal';
import { TierSummaryModal } from './TierSummaryModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { fixMojibake } from '@/lib/text';

type SendModalState = {
  isOpen: boolean;
  leadId: string | null;
  type: 'email' | 'whatsapp';
};

type LeadActivity = {
  id: string;
  lead_id: string;
  type: string;
  outcome: string;
  created_at: string;
  metadata?: {
    template_name?: string;
  };
};

export function LeadsTable({ refreshTrigger, filterCategory, onSelectLead, source = 'all' }: { refreshTrigger: number; filterCategory: string | null; onSelectLead?: (lead: Lead) => void; source?: 'all' | 'prospector' | 'audit' }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sendModal, setSendModal] = useState<SendModalState>({ isOpen: false, leadId: null, type: 'email' });
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [tierLead, setTierLead] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tooltipLead, setTooltipLead] = useState<string | null>(null);
  const [confirmDelOpen, setConfirmDelOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [refreshTrigger]);

  useEffect(() => {
    // Filtrar por origen usando la columna 'source' (prospector | audit). Auditoría = todo lo que no es prospector.
    let list = allLeads;
    if (source === 'prospector') list = list.filter(l => (l as any).source === 'prospector');
    else if (source === 'audit') list = list.filter(l => (l as any).source !== 'prospector');
    if (filterCategory !== null) list = list.filter(lead => lead.category === filterCategory);
    setLeads(list);
    setSelected(new Set()); // Limpiar selección
  }, [filterCategory, allLeads, source]);

  const loadLeads = async () => {
    try {
      const [{ data: leadsData, error: leadsError }, { data: activitiesData, error: activitiesError }] = await Promise.all([
        supabase
          .from('io_pro_leads')
          .select('*')
          // Excluir candidatos del scraping (solo se ven tras promoverse a Leads)
          .or('status.is.null,status.neq.candidate')
          .order('created_at', { ascending: false }),
        supabase
          .from('io_pro_lead_activities')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (leadsError) throw leadsError;
      if (activitiesError) throw activitiesError;

      setAllLeads(leadsData || []);
      setLeads(leadsData || []);
      setActivities(activitiesData || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar leads');
    } finally {
      setLoading(false);
    }
  };

  const getLastActivity = (leadId: string) => {
    return activities
      .filter(a => a.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const getActivityStatus = (activity: LeadActivity | undefined) => {
    if (!activity) return {
      statusIcon: null as React.ReactNode,
      iconDesc: 'Sin contacto',
      text: 'Sin contacto',
      color: 'text-zinc-500',
      typeIcon: null as React.ReactNode,
      typeDesc: 'No se ha establecido contacto',
      template: '',
      timeStr: '',
    };

    const typeIcon = activity.type === 'email' ? <Mail size={12} /> : <MessageCircle size={12} />;
    const typeDesc = activity.type === 'email' ? 'Email enviado' : 'WhatsApp enviado';
    const template = activity.metadata?.template_name || 'Contacto';
    const date = new Date(activity.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeStr = '';
    if (diffMins < 1) timeStr = 'Hace momentos';
    else if (diffMins < 60) timeStr = `Hace ${diffMins}m`;
    else if (diffHours < 24) timeStr = `Hace ${diffHours}h`;
    else timeStr = `Hace ${diffDays}d`;

    let statusIcon: React.ReactNode = null;
    let statusDesc = '';
    let statusColor = '';

    if (activity.outcome === 'sent') {
      statusIcon = <CheckCircle size={12} className="text-green-400" />;
      statusDesc = 'Enviado correctamente';
      statusColor = 'text-green-400';
    } else if (activity.outcome === 'failed') {
      statusIcon = <XCircle size={12} className="text-red-400" />;
      statusDesc = 'Error al enviar';
      statusColor = 'text-red-400';
    } else {
      statusIcon = <Clock size={12} className="text-yellow-400" />;
      statusDesc = 'Pendiente de envío';
      statusColor = 'text-yellow-400';
    }

    return {
      statusIcon,
      iconDesc: statusDesc,
      typeIcon,
      typeDesc,
      template,
      timeStr,
      color: statusColor,
    };
  };

  const updateField = async (id: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('io_pro_leads')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setLeads(leads.map(l => (l.id === id ? { ...l, [field]: value } : l)));
      toast.success('Actualizado');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar');
    }
  };

  const handleStartEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue || '');
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    await updateField(editingCell.id, editingCell.field, editValue);
    setEditingCell(null);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === leads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map(l => l.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selected.size === 0) return;
    setConfirmDelOpen(true);
  };

  const handleConfirmDeleteSelected = async () => {
    setDeleting(true);
    try {
      const idsToDelete = Array.from(selected);
      const { error } = await supabase
        .from('io_pro_leads')
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;

      setLeads(leads.filter(l => !selected.has(l.id)));
      toast.success(`${idsToDelete.length} lead(s) eliminado(s)`);
      setSelected(new Set());
      setConfirmDelOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar leads');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando leads...</div>;
  }

  const uniqueCount = leads.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          <span className="inline-flex items-center gap-1.5"><BarChart3 size={14} /> {uniqueCount} leads únicos | {selected.size} seleccionados</span>
        </div>
        {selected.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded flex items-center gap-2 transition"
          >
            <Trash2 size={14} />
            Eliminar {selected.size}
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-zinc-800 rounded">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 border-b border-zinc-800 sticky top-0">
            <tr>
              <th className="px-3 py-3 text-left w-8">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 hover:bg-zinc-700 rounded"
                >
                  {selected.size === leads.length ? (
                    <CheckCircle2 size={16} className="text-blue-500" />
                  ) : (
                    <Circle size={16} />
                  )}
                </button>
              </th>
              <th className="px-3 py-3 text-left font-semibold">Negocio</th>
              <th className="px-3 py-3 text-left font-semibold"><Mail size={13} className="inline mr-1" />Email</th>
              <th className="px-3 py-3 text-left font-semibold"><MessageCircle size={13} className="inline mr-1" />Teléfono</th>
              <th className="px-3 py-3 text-left font-semibold">Rating SEO</th>
              <th className="px-3 py-3 text-left font-semibold"><Star size={13} className="inline mr-1 text-yellow-400" />Rating GMB</th>
              <th className="px-3 py-3 text-left font-semibold">TIER 1</th>
              <th className="px-3 py-3 text-left font-semibold">Estado</th>
              <th className="px-3 py-3 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => {
              const lastActivity = getLastActivity(lead.id);
              const status = getActivityStatus(lastActivity);

              return (
                <tr
                  key={lead.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/50 transition cursor-pointer"
                  onClick={() => onSelectLead?.(lead)}
                >
                  <td className="px-3 py-3">
                    <button
                      onClick={() => toggleSelect(lead.id)}
                      className="p-1 hover:bg-zinc-700 rounded"
                    >
                      {selected.has(lead.id) ? (
                        <CheckCircle2 size={16} className="text-blue-500" />
                      ) : (
                        <Circle size={16} />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-3 font-semibold text-white max-w-sm">
                    <div className="truncate">{fixMojibake(lead.business_name) || 'Sin nombre'}</div>
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener" className="text-xs text-blue-400 hover:underline truncate block">
                        {lead.website}
                      </a>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {lead.email ? (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 truncate">{lead.email}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(lead.email || '')}
                          className="text-blue-400 hover:text-blue-300"
                          title="Copiar email"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-500">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {lead.phone ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 truncate">{lead.phone}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(lead.phone || '')}
                          className="text-green-400 hover:text-green-300"
                          title="Copiar teléfono"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-500">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <span className="font-semibold text-blue-400" title="Puntuación de Auditoría SEO">
                      {lead.audit_score}/100
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm">
                    {lead.gmb_rating ? (
                      <span className="font-semibold text-yellow-400" title="Google My Business Rating">
                        <span className="inline-flex items-center gap-1">{lead.gmb_rating.toFixed(1)} <Star size={12} className="text-yellow-400 fill-yellow-400" /></span>
                      </span>
                    ) : (
                      <span className="text-zinc-500" title="Sin datos de Google Maps">
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div className="flex gap-1">
                      {!lead.email && <span className="px-1 py-0.5 bg-red-900/40 text-red-300 rounded text-xs inline-flex items-center gap-0.5"><Mail size={10} /></span>}
                      {!lead.phone && <span className="px-1 py-0.5 bg-red-900/40 text-red-300 rounded text-xs inline-flex items-center gap-0.5"><MessageCircle size={10} /></span>}
                      {lead.email && lead.phone ? (
                        <span className="px-1 py-0.5 bg-green-900/40 text-green-300 rounded text-xs inline-flex items-center gap-0.5"><CheckCircle size={10} /></span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs relative">
                    <div
                      className={`${status.color} space-y-1 cursor-help`}
                      onMouseEnter={() => setTooltipLead(lead.id)}
                      onMouseLeave={() => setTooltipLead(null)}
                    >
                      <div className="font-medium group relative">
                        <span title={status.iconDesc} className="inline-flex">{status.statusIcon}</span>
                        <span title={status.typeDesc} className="inline-flex">{status.typeIcon}</span>
                        {tooltipLead === lead.id && (
                          <div className="absolute left-0 bottom-full mb-2 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 whitespace-nowrap text-xs text-zinc-200 z-40 pointer-events-none">
                            {status.iconDesc}
                          </div>
                        )}
                      </div>
                      <div className="text-zinc-400" title={`Plantilla: ${status.template}`}>
                        {status.template}
                      </div>
                      <div className="text-zinc-500" title={`Hace ${status.timeStr}`}>
                        {status.timeStr}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailLead(lead);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
                      title="Ver ficha completa"
                    >
                      <ClipboardList size={12} className="inline mr-1" /> Ficha
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTierLead(lead);
                      }}
                      className="p-1.5 hover:bg-purple-900/30 rounded-lg transition-colors"
                      title="Ver TIER"
                    >
                      <BarChart3 size={16} className="text-purple-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailLead && (
        <LeadDetailModal
          lead={detailLead}
          isOpen={!!detailLead}
          onClose={() => setDetailLead(null)}
          onSendEmail={() => {
            setSendModal({ isOpen: true, leadId: detailLead.id, type: 'email' });
          }}
          onSendWhatsApp={() => {
            setSendModal({ isOpen: true, leadId: detailLead.id, type: 'whatsapp' });
          }}
          onUpdate={loadLeads}
        />
      )}

      {tierLead && (
        <TierSummaryModal
          lead={tierLead}
          isOpen={!!tierLead}
          onClose={() => setTierLead(null)}
        />
      )}

      {sendModal.leadId && (
        <SendModal
          isOpen={sendModal.isOpen}
          type={sendModal.type}
          leadId={sendModal.leadId}
          leadName={leads.find(l => l.id === sendModal.leadId)?.business_name || ''}
          email={leads.find(l => l.id === sendModal.leadId)?.email || ''}
          phone={leads.find(l => l.id === sendModal.leadId)?.phone || ''}
          mainCompetitor={leads.find(l => l.id === sendModal.leadId)?.main_competitor || ''}
          missingService={leads.find(l => l.id === sendModal.leadId)?.missing_service || ''}
          seoGap={leads.find(l => l.id === sendModal.leadId)?.seo_gap || ''}
          website={leads.find(l => l.id === sendModal.leadId)?.website || ''}
          auditScore={leads.find(l => l.id === sendModal.leadId)?.audit_score || 0}
          brokenLinksCount={leads.find(l => l.id === sendModal.leadId)?.broken_links_count || 0}
          gmbRating={leads.find(l => l.id === sendModal.leadId)?.gmb_rating || 0}
          reviewCount={leads.find(l => l.id === sendModal.leadId)?.review_count || 0}
          gmbClaimed={leads.find(l => l.id === sendModal.leadId)?.gmb_claimed || false}
          photoCount={leads.find(l => l.id === sendModal.leadId)?.photo_count || 0}
          onClose={() => setSendModal({ ...sendModal, isOpen: false })}
          onSent={() => loadLeads()}
        />
      )}

      <ConfirmDialog
        open={confirmDelOpen}
        loading={deleting}
        title="Eliminar leads"
        message={`Se eliminarán ${selected.size} lead(s). Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDeleteSelected}
        onCancel={() => { if (!deleting) setConfirmDelOpen(false); }}
      />
    </div>
  );
}
