'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Plus, Trash2, Settings, FolderOpen, Ban } from 'lucide-react';
import { SectorsAdmin } from '@/components/admin/SectorsAdmin';

type GlobalExclude = { id?: string; term: string };

export default function ConfigPage() {
  const [globalExcludes, setGlobalExcludes] = useState<GlobalExclude[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExclude, setNewExclude] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('io_pro_global_exclude_terms').select('*');
      setGlobalExcludes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addGlobalExclude = async () => {
    const term = newExclude.trim().toLowerCase();
    if (!term) return;
    const { data, error } = await supabase
      .from('io_pro_global_exclude_terms')
      .insert({ term })
      .select()
      .single();
    if (error) return toast.error('Error al añadir');
    setGlobalExcludes(prev => [...prev, data]);
    setNewExclude('');
    toast.success(`"${term}" añadido`);
  };

  const removeGlobalExclude = async (id: string, term: string) => {
    const { error } = await supabase.from('io_pro_global_exclude_terms').delete().eq('id', id);
    if (error) return toast.error('Error al eliminar');
    setGlobalExcludes(prev => prev.filter(e => e.id !== id));
    toast.success(`"${term}" eliminado`);
  };

  if (loading) return <div className="text-zinc-500 text-center py-24">Cargando configuración...</div>;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings size={22} className="text-white" /> Configuración</h1>
        <p className="text-zinc-400 text-sm mt-1">Categorías de sectores y exclusiones globales de prospección</p>
      </div>

      {/* Categorías / Sectores */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><FolderOpen size={18} /> Categorías</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <SectorsAdmin />
        </div>
      </div>

      {/* Exclusiones Globales */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Ban size={18} /> Exclusiones</h2>
          <p className="text-xs text-zinc-500">
            Términos que se excluyen de <strong className="text-zinc-300">todas</strong> las búsquedas de prospección.
          </p>
        </div>
          <div className="flex gap-3">
            <input
              value={newExclude}
              onChange={e => setNewExclude(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGlobalExclude()}
              placeholder="Añadir término a excluir..."
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <button onClick={addGlobalExclude}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <Plus size={14} /> Añadir
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {globalExcludes.length === 0 ? (
              <p className="px-5 py-8 text-center text-zinc-500 text-sm">Sin exclusiones globales</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {globalExcludes.map((ex, i) => (
                  <div key={ex.id || i} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-zinc-300 font-mono">-{ex.term}</span>
                    <button
                      onClick={() => ex.id && removeGlobalExclude(ex.id, ex.term)}
                      className="p-1.5 hover:bg-red-900/30 rounded transition"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
