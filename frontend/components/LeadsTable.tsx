'use client';
import { useState } from 'react';
import { Mail, MessageCircle, Trash2, ChevronDown, Zap } from 'lucide-react';

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
  onEmailClick: (leads: Lead[]) => void;
  onWhatsAppClick: (leads: Lead[]) => void;
  loading?: boolean;
}

export function LeadsTable({ leads, onEmailClick, onWhatsAppClick, loading }: LeadsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === leads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map(l => l.id)));
    }
  };

  const selectedLeads = leads.filter(l => selected.has(l.id));
  const statusColors: Record<string, string> = {
    new: 'bg-blue-900/30 text-blue-300',
    contacted: 'bg-yellow-900/30 text-yellow-300',
    interested: 'bg-green-900/30 text-green-300',
    reserved: 'bg-purple-900/30 text-purple-300',
    sold: 'bg-emerald-900/30 text-emerald-300',
    lost: 'bg-red-900/30 text-red-300',
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-800 rounded-xl p-3">
          <span className="text-sm text-blue-300 font-semibold">{selected.size} seleccionados</span>
          <button
            onClick={() => onEmailClick(selectedLeads)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Mail size={16} /> Email masivo
          </button>
          <button
            onClick={() => onWhatsAppClick(selectedLeads)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <MessageCircle size={16} /> WhatsApp masivo
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto px-3 py-1.5 text-sm text-blue-300 hover:text-blue-200"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 border-b border-zinc-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-zinc-400 font-semibold">Negocio</th>
              <th className="px-4 py-3 text-left text-zinc-400 font-semibold">Ciudad</th>
              <th className="px-4 py-3 text-left text-zinc-400 font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-zinc-400 font-semibold">Teléfono</th>
              <th className="px-4 py-3 text-left text-zinc-400 font-semibold">Score</th>
              <th className="px-4 py-3 text-left text-zinc-400 font-semibold">Estado</th>
              <th className="px-4 py-3 text-center text-zinc-400 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className={`border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
                  selected.has(lead.id) ? 'bg-blue-900/20' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(lead.id)}
                    onChange={() => toggleSelect(lead.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === lead.id ? null : lead.id)
                    }
                    className="flex items-center gap-2 text-white font-medium hover:text-blue-400"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        expandedId === lead.id ? 'rotate-180' : ''
                      }`}
                    />
                    {lead.business_name.substring(0, 30)}
                  </button>
                </td>
                <td className="px-4 py-3 text-zinc-400">{lead.city}</td>
                <td className="px-4 py-3 text-zinc-400 truncate text-xs">
                  {lead.email || '—'}
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{lead.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-yellow-400 font-bold">{lead.audit_score}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      statusColors[lead.crm_status] || 'bg-gray-900/30 text-gray-300'
                    }`}
                  >
                    {lead.crm_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEmailClick([lead])}
                    className="p-1.5 hover:bg-blue-900 rounded-lg transition-colors"
                    title="Enviar email"
                  >
                    <Mail size={16} className="text-blue-400" />
                  </button>
                  <button
                    onClick={() => onWhatsAppClick([lead])}
                    className="p-1.5 hover:bg-green-900 rounded-lg transition-colors"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle size={16} className="text-green-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estado vacío */}
      {leads.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <Zap size={24} className="mx-auto mb-2 opacity-50" />
          <p>Sin leads aún. Inicia una prospección.</p>
        </div>
      )}
    </div>
  );
}
