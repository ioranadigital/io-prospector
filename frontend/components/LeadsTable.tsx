'use client';
import { useState } from 'react';
import { BarChart3, Send, CheckSquare, Square } from 'lucide-react';
import { fixMojibake } from '@/lib/text';

interface Lead {
  id: string;
  business_name: string;
  city: string;
  email: string;
  phone: string;
  audit_score: number;
  crm_status: string;
  category?: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
  onSelectTier?: (lead: Lead) => void;
  loading?: boolean;
  selectable?: boolean;
  onSendToLeads?: (ids: string[]) => Promise<void> | void;
  sending?: boolean;
}

export function LeadsTable({ leads, onSelectLead, onSelectTier, loading, selectable, onSendToLeads, sending }: LeadsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const statusColors: Record<string, string> = {
    'contacted': 'bg-blue-900/30 text-blue-300',
    'interested': 'bg-green-900/30 text-green-300',
    'proposal_sent': 'bg-purple-900/30 text-purple-300',
    'client': 'bg-yellow-900/30 text-yellow-300',
    'rejected': 'bg-red-900/30 text-red-300'
  };

  const toggle = (id: string) => setSelected(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const allSelected = leads.length > 0 && selected.size === leads.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(leads.map(l => l.id)));

  const handleSend = async () => {
    if (selected.size === 0 || !onSendToLeads) return;
    await onSendToLeads(Array.from(selected));
    setSelected(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Cargando leads...</div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">No hay leads</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Barra de selección */}
      {selectable && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-zinc-800/60 border-b border-zinc-700 flex-wrap">
          <p className="text-sm text-zinc-300">
            {selected.size > 0
              ? <><span className="font-bold text-white">{selected.size}</span> seleccionado{selected.size !== 1 ? 's' : ''} de {leads.length}</>
              : <>Marca los clientes interesantes para enviarlos a <span className="text-blue-400 font-medium">Leads</span></>}
          </p>
          <button
            onClick={handleSend}
            disabled={selected.size === 0 || sending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Send size={15} /> {sending ? 'Enviando...' : `Enviar ${selected.size > 0 ? selected.size + ' ' : ''}a Leads`}
          </button>
        </div>
      )}

      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-zinc-800/95 border-b border-zinc-700">
          <tr>
            {selectable && (
              <th className="px-3 py-3 w-10 text-center">
                <button onClick={toggleAll} title="Seleccionar todo" className="text-zinc-400 hover:text-white">
                  {allSelected ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} />}
                </button>
              </th>
            )}
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">Negocio</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">Ciudad</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">Teléfono</th>
            <th className="px-4 py-3 text-center font-semibold text-zinc-300">Score</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300">Estado</th>
            <th className="px-4 py-3 text-center font-semibold text-zinc-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const isSel = selected.has(lead.id);
            return (
            <tr
              key={lead.id}
              className={`border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${isSel ? 'bg-blue-900/15' : ''}`}
            >
              {selectable && (
                <td className="px-3 py-3 text-center">
                  <button onClick={() => toggle(lead.id)} className="text-zinc-400 hover:text-white">
                    {isSel ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} />}
                  </button>
                </td>
              )}
              <td className="px-4 py-3">
                <button
                  onClick={() => onSelectLead?.(lead)}
                  className="text-white font-medium hover:text-blue-400 text-left"
                >
                  {fixMojibake(lead.business_name).substring(0, 35)}
                </button>
              </td>
              <td className="px-4 py-3 text-zinc-400">{fixMojibake(lead.city) || '—'}</td>
              <td className="px-4 py-3 text-zinc-400 truncate text-xs">
                {lead.email || '—'}
              </td>
              <td className="px-4 py-3 text-zinc-400 text-xs">{lead.phone || '—'}</td>
              <td className="px-4 py-3 text-center">
                <span className="text-yellow-400 font-bold">{lead.audit_score}</span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    statusColors[lead.crm_status] || 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {lead.crm_status || 'Sin estado'}
                </span>
              </td>
              <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                <button
                  onClick={() => onSelectLead?.(lead)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  title="Ver ficha"
                >
                  📋 Ficha
                </button>
                <button
                  onClick={() => onSelectTier?.(lead)}
                  className="p-1.5 hover:bg-purple-900/30 rounded-lg transition-colors"
                  title="Ver TIER"
                >
                  <BarChart3 size={18} className="text-purple-400" />
                </button>
              </td>
            </tr>
          );})}
        </tbody>
      </table>
    </div>
  );
}
