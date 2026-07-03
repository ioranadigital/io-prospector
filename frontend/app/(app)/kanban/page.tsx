// frontend/app/kanban/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { KanbanColumn } from '@/components/ui/KanbanColumn';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUSES = ['new','contacted','interested','reserved','sold','upselling','lost'];

export default function KanbanPage() {
  const [kanban,  setKanban]  = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await api.getKanban() as any;
    setKanban(data); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleStatusChange(id: string, status: string) {
    try { await api.updateStatus(id, status); toast.success(`Movido a ${status}`); load(); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Kanban CRM</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Arrastra los leads entre columnas para actualizar su estado</p>
      </div>
      {loading
        ? <div className="flex items-center justify-center py-24 text-zinc-600">Cargando...</div>
        : <div className="grid gap-3 pb-4" style={{ gridTemplateColumns: `repeat(${STATUSES.length}, minmax(180px, 1fr))`, minWidth: '1100px', overflowX: 'auto' }}>
            {STATUSES.map(s => <KanbanColumn key={s} status={s} leads={kanban[s] || []} onStatusChange={handleStatusChange} />)}
          </div>
      }
    </div>
  );
}
