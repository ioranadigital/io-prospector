// frontend/components/ui/KanbanColumn.tsx
'use client';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const COL_CONFIG: Record<string, { label: string; color: string }> = {
  new:        { label: 'Nuevo',      color: 'border-zinc-600' },
  contacted:  { label: 'Contactado', color: 'border-blue-500' },
  interested: { label: 'Interesado', color: 'border-amber-500' },
  reserved:   { label: 'Reservado',  color: 'border-violet-500' },
  sold:       { label: 'Vendido',    color: 'border-green-500' },
  upselling:  { label: 'Upselling',  color: 'border-emerald-400' },
  lost:       { label: 'Perdido',    color: 'border-red-600' },
};

export function KanbanColumn({ status, leads, onStatusChange }: {
  status: string; leads: any[]; onStatusChange: (id: string, status: string) => void;
}) {
  const cfg = COL_CONFIG[status] || { label: status, color: 'border-zinc-700' };

  return (
    <div className="flex flex-col min-h-[200px] rounded-xl bg-zinc-900/50 border border-zinc-800"
      onDragOver={e => e.preventDefault()}
      onDrop={e => { const id = e.dataTransfer.getData('leadId'); if (id) onStatusChange(id, status); }}>

      <div className={`px-4 py-3 border-b border-zinc-800 border-l-2 ${cfg.color} rounded-tl-xl`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-200">{cfg.label}</p>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{leads.length}</span>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-2">
        {leads.map(lead => (
          <div key={lead.id} draggable
            onDragStart={e => e.dataTransfer.setData('leadId', lead.id)}
            className="bg-zinc-800 border border-zinc-700/60 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors group">
            <p className="text-sm font-medium text-zinc-100 leading-snug">{lead.business_name}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{lead.city} · {lead.category}</p>
            {lead.audit_score != null && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${lead.audit_score >= 70 ? 'bg-green-500' : lead.audit_score >= 40 ? 'bg-amber-400' : 'bg-red-500'}`}
                    style={{ width: `${lead.audit_score}%` }} />
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{lead.audit_score}</span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {lead.phone && <a href={`tel:${lead.phone}`} className="p-1 rounded text-zinc-500 hover:text-green-400"><Phone size={12}/></a>}
              {lead.email && <a href={`mailto:${lead.email}`} className="p-1 rounded text-zinc-500 hover:text-blue-400"><Mail size={12}/></a>}
              {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" className="p-1 rounded text-zinc-500 hover:text-emerald-400"><MessageCircle size={12}/></a>}
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <div className="text-center py-8 text-zinc-700 text-xs border-2 border-dashed border-zinc-800 rounded-xl">
            Arrastra aquí
          </div>
        )}
      </div>
    </div>
  );
}
