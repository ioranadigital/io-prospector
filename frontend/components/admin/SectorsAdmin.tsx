'use client';
import { useState, useEffect } from 'react';
import { Plus, X, ChevronRight, Globe, FolderOpen, ClipboardList, Check, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Category = { id: string; name: string; sort_order: number };
type Sector = { id: string; category_id: string; name: string; sort_order: number };
type Term = { id: string; sector_id: string; term: string };
type GlobalExclude = { id: string; term: string };
type SectorExclude = { id: string; sector_id: string; term: string };

export function SectorsAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [globalExcludes, setGlobalExcludes] = useState<GlobalExclude[]>([]);
  const [sectorExcludes, setSectorExcludes] = useState<SectorExclude[]>([]);
  const [loading, setLoading] = useState(true);

  const [addingCategory, setAddingCategory] = useState(false);
  const [addingSector, setAddingSector] = useState(false);
  const [addingTerm, setAddingTerm] = useState(false);
  const [addingGlobalExclude, setAddingGlobalExclude] = useState(false);
  const [addingSectorExclude, setAddingSectorExclude] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSectorName, setNewSectorName] = useState('');
  const [newTermName, setNewTermName] = useState('');
  const [newGlobalExclude, setNewGlobalExclude] = useState('');
  const [newSectorExclude, setNewSectorExclude] = useState('');

  const [confirmState, setConfirmState] = useState<{ title: string; message: string; action: () => Promise<void> } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const runConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      await confirmState.action();
      setConfirmState(null);
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadGlobalExcludes();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadSectors();
      setSelectedSectorId(null);
      setTerms([]);
      setSectorExcludes([]);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedSectorId) {
      loadTerms();
      loadSectorExcludes();
    }
  }, [selectedSectorId]);

  // ===== CATEGORÍAS =====
  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('io_pro_categories').select('*').order('sort_order');
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      toast.error('Error loading categories');
    }
    setLoading(false);
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const { data, error } = await supabase
        .from('io_pro_categories')
        .insert([{ name: newCategoryName.trim(), sort_order: (categories.length + 1) * 10 }])
        .select();
      if (error) throw error;
      setCategories([...categories, ...(data || [])]);
      setNewCategoryName('');
      setAddingCategory(false);
      toast.success('Category added');
    } catch (err: any) {
      toast.error('Error adding category');
    }
  };

  const deleteCategory = (id: string) => {
    setConfirmState({
      title: 'Eliminar categoría',
      message: 'Se eliminará esta categoría y todos sus datos. Esta acción no se puede deshacer.',
      action: async () => {
        const { error } = await supabase.from('io_pro_categories').delete().eq('id', id);
        if (error) throw error;
        setCategories(categories.filter(c => c.id !== id));
        if (selectedCategoryId === id) setSelectedCategoryId(null);
        toast.success('Categoría eliminada');
      },
    });
  };

  // ===== SECTORES =====
  const loadSectors = async () => {
    if (!selectedCategoryId) return;
    try {
      const { data, error } = await supabase
        .from('io_pro_sectors')
        .select('*')
        .eq('category_id', selectedCategoryId)
        .order('sort_order');
      if (error) throw error;
      setSectors(data || []);
    } catch (err: any) {
      toast.error('Error loading sectors');
    }
  };

  const addSector = async () => {
    if (!newSectorName.trim() || !selectedCategoryId) return;
    try {
      const { data, error } = await supabase
        .from('io_pro_sectors')
        .insert([{ category_id: selectedCategoryId, name: newSectorName.trim(), sort_order: (sectors.length + 1) * 10 }])
        .select();
      if (error) throw error;
      setSectors([...sectors, ...(data || [])]);
      setNewSectorName('');
      setAddingSector(false);
      toast.success('Sector added');
    } catch (err: any) {
      toast.error('Error adding sector');
    }
  };

  const deleteSector = (id: string) => {
    setConfirmState({
      title: 'Eliminar sector',
      message: 'Se eliminará este sector y todos sus datos. Esta acción no se puede deshacer.',
      action: async () => {
        const { error } = await supabase.from('io_pro_sectors').delete().eq('id', id);
        if (error) throw error;
        setSectors(sectors.filter(s => s.id !== id));
        if (selectedSectorId === id) setSelectedSectorId(null);
        toast.success('Sector eliminado');
      },
    });
  };

  // ===== TÉRMINOS INCLUIDOS =====
  const loadTerms = async () => {
    if (!selectedSectorId) return;
    try {
      const { data, error } = await supabase.from('io_pro_terms').select('*').eq('sector_id', selectedSectorId);
      if (error) throw error;
      setTerms(data || []);
    } catch (err: any) {
      toast.error('Error loading terms');
    }
  };

  const addTerm = async () => {
    if (!newTermName.trim() || !selectedSectorId) return;
    try {
      const { data, error } = await supabase
        .from('io_pro_terms')
        .insert([{ sector_id: selectedSectorId, term: newTermName.trim() }])
        .select();
      if (error) throw error;
      setTerms([...terms, ...(data || [])]);
      setNewTermName('');
      setAddingTerm(false);
      toast.success('Term added');
    } catch (err: any) {
      toast.error('Error adding term');
    }
  };

  const deleteTerm = async (id: string) => {
    try {
      await supabase.from('io_pro_terms').delete().eq('id', id);
      setTerms(terms.filter(t => t.id !== id));
      toast.success('Term deleted');
    } catch (err: any) {
      toast.error('Error deleting term');
    }
  };

  // ===== EXCLUSIONES GLOBALES =====
  const loadGlobalExcludes = async () => {
    try {
      const { data, error } = await supabase.from('io_pro_global_exclude_terms').select('*');
      if (error) throw error;
      setGlobalExcludes(data || []);
    } catch (err: any) {
      console.error('Error loading global excludes', err);
    }
  };

  const addGlobalExclude = async () => {
    if (!newGlobalExclude.trim()) return;
    try {
      const { data, error } = await supabase
        .from('io_pro_global_exclude_terms')
        .insert([{ term: newGlobalExclude.trim() }])
        .select();
      if (error) throw error;
      setGlobalExcludes([...globalExcludes, ...(data || [])]);
      setNewGlobalExclude('');
      setAddingGlobalExclude(false);
      toast.success('Global exclusion added');
    } catch (err: any) {
      toast.error('Error adding global exclusion');
    }
  };

  const deleteGlobalExclude = async (id: string) => {
    try {
      await supabase.from('io_pro_global_exclude_terms').delete().eq('id', id);
      setGlobalExcludes(globalExcludes.filter(e => e.id !== id));
      toast.success('Global exclusion deleted');
    } catch (err: any) {
      toast.error('Error deleting global exclusion');
    }
  };

  // ===== EXCLUSIONES POR SECTOR =====
  const loadSectorExcludes = async () => {
    if (!selectedSectorId) return;
    try {
      const { data, error } = await supabase
        .from('io_pro_sector_exclude_terms')
        .select('*')
        .eq('sector_id', selectedSectorId);
      if (error) throw error;
      setSectorExcludes(data || []);
    } catch (err: any) {
      toast.error('Error loading sector exclusions');
    }
  };

  const addSectorExclude = async () => {
    if (!newSectorExclude.trim() || !selectedSectorId) return;
    try {
      const { data, error } = await supabase
        .from('io_pro_sector_exclude_terms')
        .insert([{ sector_id: selectedSectorId, term: newSectorExclude.trim() }])
        .select();
      if (error) throw error;
      setSectorExcludes([...sectorExcludes, ...(data || [])]);
      setNewSectorExclude('');
      setAddingSectorExclude(false);
      toast.success('Sector exclusion added');
    } catch (err: any) {
      toast.error('Error adding sector exclusion');
    }
  };

  const deleteSectorExclude = async (id: string) => {
    try {
      await supabase.from('io_pro_sector_exclude_terms').delete().eq('id', id);
      setSectorExcludes(sectorExcludes.filter(e => e.id !== id));
      toast.success('Sector exclusion deleted');
    } catch (err: any) {
      toast.error('Error deleting sector exclusion');
    }
  };

  if (loading) return <div className="text-center py-8 text-zinc-400">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* SECCIÓN: EXCLUSIONES GLOBALES */}
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
        <div className="font-semibold text-red-300 mb-3 flex items-center gap-1.5"><Globe size={14} /> Exclusiones Globales (aplica a todas las categorías)</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {globalExcludes.map(exc => (
            <div key={exc.id} className="bg-red-800/40 border border-red-700 rounded px-3 py-1 flex items-center gap-2">
              <span className="text-sm text-red-200">-{exc.term}</span>
              <button onClick={() => deleteGlobalExclude(exc.id)} className="text-red-400 hover:text-red-300">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        {addingGlobalExclude ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={newGlobalExclude}
              onChange={e => setNewGlobalExclude(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addGlobalExclude()}
              placeholder="-término a excluir globalmente"
              className="flex-1 px-3 py-2 bg-zinc-700 text-zinc-200 text-base rounded border border-zinc-600 focus:outline-none"
            />
            <button onClick={addGlobalExclude} className="px-3 py-2 bg-red-700 text-red-200 rounded hover:bg-red-600">
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingGlobalExclude(true)}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            + Añadir exclusión global
          </button>
        )}
      </div>

      {/* SECCIÓN: GESTIÓN DE 4 COLUMNAS */}
      <div className="grid gap-6" style={{gridTemplateColumns: '400px 1fr 1fr 1fr'}}>
        {/* COLUMNA 1: CATEGORÍAS */}
        <div className="flex flex-col bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-700 font-semibold text-zinc-300 flex items-center gap-1.5"><FolderOpen size={14} /> Categorías</div>
          <div className="flex-1 overflow-y-auto p-2">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`p-3 mb-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                  selectedCategoryId === cat.id ? 'bg-blue-900 border border-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                <span className="text-sm text-zinc-200 flex-1">{cat.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); deleteCategory(cat.id); }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-zinc-700">
            {addingCategory ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addCategory()}
                  placeholder="Nueva categoría"
                  className="flex-1 px-3 py-2 bg-zinc-700 text-zinc-200 text-base rounded border border-zinc-600 focus:outline-none"
                />
                <button onClick={addCategory} className="text-green-400"><Check size={16} /></button>
              </div>
            ) : (
              <button onClick={() => setAddingCategory(true)} className="w-full text-blue-400 text-sm">
                + Nueva Categoría
              </button>
            )}
          </div>
        </div>

        {/* COLUMNA 2: SUBCATEGORÍA (muestra SECTORES) */}
        <div className="flex flex-col bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-700 font-semibold text-zinc-300 flex items-center gap-1.5"><ClipboardList size={14} /> Subcategoría</div>
          <div className="flex-1 overflow-y-auto p-2">
            {sectors.map(sec => (
              <div
                key={sec.id}
                className={`p-3 mb-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                  selectedSectorId === sec.id ? 'bg-blue-900 border border-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
                onClick={() => setSelectedSectorId(sec.id)}
              >
                <span className="text-sm text-zinc-200 flex-1">{sec.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); deleteSector(sec.id); }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-zinc-700">
            {addingSector ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newSectorName}
                  onChange={e => setNewSectorName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addSector()}
                  placeholder="Nuevo sector"
                  className="flex-1 px-3 py-2 bg-zinc-700 text-zinc-200 text-base rounded border border-zinc-600 focus:outline-none"
                />
                <button onClick={addSector} className="text-green-400"><Check size={16} /></button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSector(true)}
                disabled={!selectedCategoryId}
                className="w-full text-blue-400 text-sm disabled:text-zinc-600"
              >
                + Nuevo Sector
              </button>
            )}
          </div>
        </div>

        {/* COLUMNA 3: TÉRMINOS */}
        <div className="flex flex-col bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-700 font-semibold text-zinc-300 flex items-center gap-1.5"><Check size={14} className="text-green-400" /> Términos</div>
          <div className="flex-1 overflow-y-auto p-2">
            {terms.map(term => (
              <div key={term.id} className="p-3 mb-2 rounded-lg bg-green-800/30 border border-green-700/50 flex items-center justify-between">
                <span className="text-sm text-green-200">{term.term}</span>
                <button onClick={() => deleteTerm(term.id)} className="text-red-400 hover:text-red-300">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-zinc-700">
            {addingTerm ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newTermName}
                  onChange={e => setNewTermName(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addTerm()}
                  placeholder="Nuevo término"
                  className="flex-1 px-3 py-2 bg-zinc-700 text-zinc-200 text-base rounded border border-zinc-600 focus:outline-none"
                />
                <button onClick={addTerm} className="text-green-400"><Check size={16} /></button>
              </div>
            ) : (
              <button
                onClick={() => setAddingTerm(true)}
                disabled={!selectedSectorId}
                className="w-full text-green-400 text-sm disabled:text-zinc-600"
              >
                + Añadir Término
              </button>
            )}
          </div>
        </div>

        {/* COLUMNA 4: TÉRMINOS EXCLUIDOS */}
        <div className="flex flex-col bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-700 font-semibold text-zinc-300 flex items-center gap-1.5"><XCircle size={14} className="text-red-400" /> Excluir (-)</div>
          <div className="flex-1 overflow-y-auto p-2">
            {sectorExcludes.map(exc => (
              <div key={exc.id} className="p-3 mb-2 rounded-lg bg-red-800/30 border border-red-700/50 flex items-center justify-between">
                <span className="text-sm text-red-200">-{exc.term}</span>
                <button onClick={() => deleteSectorExclude(exc.id)} className="text-red-400 hover:text-red-300">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-zinc-700">
            {addingSectorExclude ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newSectorExclude}
                  onChange={e => setNewSectorExclude(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addSectorExclude()}
                  placeholder="-término a excluir"
                  className="flex-1 px-3 py-2 bg-zinc-700 text-zinc-200 text-base rounded border border-zinc-600 focus:outline-none"
                />
                <button onClick={addSectorExclude} className="text-red-400"><Check size={16} /></button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSectorExclude(true)}
                disabled={!selectedSectorId}
                className="w-full text-red-400 text-sm disabled:text-zinc-600"
              >
                + Excluir Término
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmState !== null}
        loading={confirmLoading}
        title={confirmState?.title || ''}
        message={confirmState?.message || ''}
        onConfirm={runConfirm}
        onCancel={() => { if (!confirmLoading) setConfirmState(null); }}
      />
    </div>
  );
}
