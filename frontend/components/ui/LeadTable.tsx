'use client';
import { useState } from 'react';
import { Trash2, Eye, Globe, Phone, Mail, MessageCircle, ChevronUp, ChevronDown, Palette } from 'lucide-react';
import { AuditPopup } from './AuditPopup';
import { ConfirmDialog } from './ConfirmDialog';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  new:         'bg-zinc-700 text-zinc-300',
  contacted:   'bg-blue-900/60 text-blue-300',
  interested:  'bg-amber-900/60 text-amber-300',
  reserved:    'bg-violet-900/60 text-violet-300',
  sold:        'bg-green-900/60 text-green-300',
  upselling:   'bg-emerald-900/60 text-emerald-300',
  lost:        'bg-red-900/60 text-red-300',
};

const PRIORITY_DOT: Record<string, string> = {
  web_design: 'bg-red-500',
  seo:        'bg-amber-400',
  normal:     'bg-zinc-600',
};

type Lead = {
  id: string;
  business_name: string;
  website_url?: string;
  email?: string;
  phone?: string;
  city?: string;
  category?: string;
  audit_score?: number;
  audit_data?: Record<string, boolean>;
  crm_status: string;
  priority: string;
  has_website: boolean;
};

export function LeadTable({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) {
  const [auditLead, setAuditLead]   = useState<Lead | null>(null);
  const [sortField, setSortField]   = useState<keyof Lead>('audit_score');
  const [sortAsc,   setSortAsc]     = useState(true);
  const [confirmDel, setConfirmDel] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const sorted = [...leads].sort((a, b) => {
    const va = a[sortField] ?? 0;
    const vb = b[sortField] ?? 0;
    return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  function toggleSort(field: keyof Lead) {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  }

  async function handleConfirmDelete() {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await api.deleteLead(confirmDel.id);
      toast.success('Lead eliminado');
      setConfirmDel(null);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  }

  async function handleGenerateDemo(lead: Lead) {
    const t = toast.loading('Generando demo...');
    try {
      const { url } = await api.generateDemo(lead.id) as { url: string };
      toast.dismiss(t);
      toast.success('Demo generada');
      window.open(url, '_blank');
    } catch (e: any) {
      toast.dismiss(t);
      toast.error(e.message);
    }
  }

  function SortIcon({ field }: { field: keyof Lead }) {
    if (sortField !== field) return <ChevronUp size={12} className="text-zinc-600" />;
    return sortAsc ? <ChevronUp size={12} className="text-brand-400" /> : <ChevronDown size={12} className="text-brand-400" />;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              {[
                { label: 'Negocio',    field: 'business_name' },
                { label: 'Score',      field: 'audit_score' },
                { label: 'Ciudad',     field: 'city' },
                { label: 'Estado',     field: 'crm_status' },
                { label: 'Prioridad',  field: 'priority' },
              ].map(({ label, field }) => (
                <th
                  key={field}
                  className="px-4 py-3 text-left font-medium text-zinc-400 cursor-pointer hover:text-zinc-200 select-none"
                  onClick={() => toggleSort(field as keyof Lead)}
                >
                  <span className="flex items-center gap-1.5">
                    {label} <SortIcon field={field as keyof Lead} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Contacto</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sorted.map(lead => (
              <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors group">
                {/* Negocio */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[lead.priority] || 'bg-zinc-600'}`} />
                    <div>
                      <p className="font-medium text-zinc-100 leading-none">{lead.business_name}</p>
                      {lead.website_url
                        ? <a href={lead.website_url} target="_blank" className="text-[11px] text-zinc-500 hover:text-brand-400 flex items-center gap-1 mt-0.5">
                            <Globe size={10} /> {new URL(lead.website_url).hostname}
                          </a>
                        : <span className="text-[11px] text-red-500">Sin web</span>
                      }
                    </div>
                  </div>
                </td>

                {/* Score */}
                <td className="px-4 py-3">
                  {lead.has_website ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            (lead.audit_score ?? 0) >= 70 ? 'bg-green-500' :
                            (lead.audit_score ?? 0) >= 40 ? 'bg-amber-400' : 'bg-red-500'
                          }`}
                          style={{ width: `${lead.audit_score ?? 0}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono font-semibold ${
                        (lead.audit_score ?? 0) >= 70 ? 'text-green-400' :
                        (lead.audit_score ?? 0) >= 40 ? 'text-amber-400' : 'text-red-400'
                      }`}>{lead.audit_score}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-600">—</span>
                  )}
                </td>

                {/* Ciudad */}
                <td className="px-4 py-3 text-zinc-400 text-xs">{lead.city || '—'}</td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[lead.crm_status] || 'bg-zinc-700 text-zinc-300'}`}>
                    {lead.crm_status}
                  </span>
                </td>

                {/* Prioridad */}
                <td className="px-4 py-3">
                  <span className={`text-xs ${
                    lead.priority === 'web_design' ? 'text-red-400' :
                    lead.priority === 'seo'        ? 'text-amber-400' : 'text-zinc-500'
                  }`}>
                    {lead.priority === 'web_design' ? 'Diseño web' :
                     lead.priority === 'seo'        ? 'SEO' : 'Normal'}
                  </span>
                </td>

                {/* Contacto rápido */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="p-1.5 rounded-md text-zinc-500 hover:text-green-400 hover:bg-green-400/10 transition-colors" title={lead.phone}>
                        <Phone size={13} />
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="p-1.5 rounded-md text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" title={lead.email}>
                        <Mail size={13} />
                      </a>
                    )}
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`}
                        target="_blank"
                        className="p-1.5 rounded-md text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                        title="WhatsApp"
                      >
                        <MessageCircle size={13} />
                      </a>
                    )}
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setAuditLead(lead)}
                      className="px-2.5 py-1.5 text-[11px] font-medium rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors flex items-center gap-1"
                    >
                      <Eye size={11} /> Análisis
                    </button>
                    <button
                      onClick={() => handleGenerateDemo(lead)}
                      className="px-2.5 py-1.5 text-[11px] font-medium rounded-md bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 transition-colors"
                    >
                      <Palette size={11} className="inline mr-1" />Demo
                    </button>
                    <button
                      onClick={() => setConfirmDel({ id: lead.id, name: lead.business_name })}
                      className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <p className="text-lg">No hay leads aún</p>
            <p className="text-sm mt-1">Inicia una prospección desde el módulo Prospector</p>
          </div>
        )}
      </div>

      {auditLead && <AuditPopup lead={auditLead} onClose={() => setAuditLead(null)} />}

      <ConfirmDialog
        open={confirmDel !== null}
        loading={deleting}
        title="Eliminar lead"
        message={`Se eliminará "${confirmDel?.name}". Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { if (!deleting) setConfirmDel(null); }}
      />
    </>
  );
}
