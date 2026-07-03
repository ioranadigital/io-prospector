'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SECTORS } from '@/lib/sectors';
import { fixMojibake } from '@/lib/text';
import toast from 'react-hot-toast';
import {
  ChevronDown, ChevronRight, MapPin, Search, Layers, Tag, Clock, Building2, FolderOpen,
} from 'lucide-react';

type Session = {
  id: string;
  query: string | null;
  city: string | null;
  category: string | null;
  total_found: number | null;
  status: string | null;
  created_at: string;
};

// ── Normalización tolerante (pliega acentos, mojibake, espacios, emojis) ──
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// subcat normalizada -> { category (padre con emoji), subName (limpio) }
const SUBCAT_INFO = (() => {
  const m = new Map<string, { category: string; subName: string }>();
  SECTORS.forEach(c => c.subcategories.forEach(s => m.set(norm(s.name), { category: c.category, subName: s.name })));
  return m;
})();
const OTHER_CAT = 'Otros / personalizadas';

const CAT_COLORS = [
  'bg-blue-950/20 border-blue-800/40',
  'bg-green-950/20 border-green-800/40',
  'bg-purple-950/20 border-purple-800/40',
  'bg-amber-950/20 border-amber-800/40',
  'bg-cyan-950/20 border-cyan-800/40',
  'bg-pink-950/20 border-pink-800/40',
  'bg-emerald-950/20 border-emerald-800/40',
  'bg-rose-950/20 border-rose-800/40',
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function ProspeccionesHistoricoPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '7days' | '30days'>('all');
  const [expandedCat, setExpandedCat] = useState<Set<string>>(new Set());
  const [expandedSub, setExpandedSub] = useState<Set<string>>(new Set());

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('io_pro_search_sessions')
        .select('id, query, city, category, total_found, status, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (filter !== 'all') {
        const days = filter === '7days' ? 7 : 30;
        q = q.gte('created_at', new Date(Date.now() - days * 864e5).toISOString());
      }
      const { data, error } = await q;
      if (error) throw error;
      setSessions(data || []);
    } catch { toast.error('Error cargando histórico de prospecciones'); }
    finally { setLoading(false); }
  };

  // ── Agrupar: Categoría -> Subcategoría -> sesiones ──
  const resolve = (s: Session) => {
    const info = SUBCAT_INFO.get(norm(fixMojibake(s.category)));
    return {
      category: info?.category || OTHER_CAT,
      subName: info?.subName || (fixMojibake(s.category) || fixMojibake(s.query) || 'Sin clasificar'),
    };
  };

  const grouped = new Map<string, Map<string, Session[]>>();
  sessions.forEach(s => {
    const { category, subName } = resolve(s);
    if (!grouped.has(category)) grouped.set(category, new Map());
    const subs = grouped.get(category)!;
    if (!subs.has(subName)) subs.set(subName, []);
    subs.get(subName)!.push(s);
  });
  const catEntries = Array.from(grouped.entries())
    .sort((a, b) => {
      const ca = Array.from(a[1].values()).reduce((n, arr) => n + arr.length, 0);
      const cb = Array.from(b[1].values()).reduce((n, arr) => n + arr.length, 0);
      return cb - ca;
    });

  // KPIs
  const totalSessions = sessions.length;
  const totalLeads = sessions.reduce((n, s) => n + (s.total_found || 0), 0);
  const uniqueCats = catEntries.length;
  const uniqueSubs = new Set(sessions.map(s => resolve(s).subName)).size;
  const uniqueCities = new Set(sessions.map(s => norm(fixMojibake(s.city))).filter(Boolean)).size;

  if (loading) return <div className="text-zinc-500 text-center py-24">Cargando histórico...</div>;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FolderOpen size={22} className="text-white" /> Histórico de Prospecciones</h1>
          <p className="text-zinc-400 text-sm mt-1">Scrapings ya realizados, agrupados por sector — para no duplicar búsquedas</p>
        </div>
        <div className="flex gap-2">
          {(['all', '7days', '30days'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}>
              {f === 'all' ? 'Todas' : f === '7days' ? 'Últimos 7 días' : 'Últimos 30 días'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs (estilo Resultados, ancho completo) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Search, label: 'Prospecciones', value: totalSessions, color: 'text-white' },
          { icon: Layers, label: 'Categorías', value: uniqueCats, color: 'text-blue-400' },
          { icon: Tag, label: 'Subcategorías', value: uniqueSubs, color: 'text-purple-400' },
          { icon: MapPin, label: 'Ciudades', value: uniqueCities, color: 'text-cyan-400' },
          { icon: Building2, label: 'Leads encontrados', value: totalLeads, color: 'text-green-400' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5"><k.icon size={13} /> {k.label}</p>
            <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Categorías -> Subcategorías -> sesiones */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Sectores scrapeados</h2>
        <div className="space-y-3">
          {catEntries.map(([category, subs], idx) => {
            const isCatOpen = expandedCat.has(category);
            const catSessions = Array.from(subs.values()).reduce((n, arr) => n + arr.length, 0);
            const catLeads = Array.from(subs.values()).flat().reduce((n, s) => n + (s.total_found || 0), 0);
            return (
              <div key={category} className={`border rounded-xl overflow-hidden ${CAT_COLORS[idx % CAT_COLORS.length]}`}>
                {/* Cabecera de CATEGORÍA */}
                <div
                  onClick={() => setExpandedCat(p => { const n = new Set(p); n.has(category) ? n.delete(category) : n.add(category); return n; })}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isCatOpen ? <ChevronDown size={18} className="text-zinc-300" /> : <ChevronRight size={18} className="text-zinc-300" />}
                    <h3 className="font-bold text-base text-white">{category}</h3>
                  </div>
                  <div className="flex items-center gap-5 text-xs">
                    <span className="text-zinc-300"><span className="font-bold text-white">{subs.size}</span> subcategoría{subs.size !== 1 ? 's' : ''}</span>
                    <span className="text-zinc-300"><span className="font-bold text-white">{catSessions}</span> prospección{catSessions !== 1 ? 'es' : ''}</span>
                    <span className="text-green-400 font-semibold">{catLeads} leads</span>
                  </div>
                </div>

                {/* SUBCATEGORÍAS */}
                {isCatOpen && (
                  <div className="border-t border-white/10 divide-y divide-white/5 bg-black/20">
                    {Array.from(subs.entries()).sort((a, b) => b[1].length - a[1].length).map(([subName, list]) => {
                      const subKey = `${category}::${subName}`;
                      const isSubOpen = expandedSub.has(subKey);
                      const subLeads = list.reduce((n, s) => n + (s.total_found || 0), 0);
                      const cities = Array.from(new Set(list.map(s => fixMojibake(s.city)).filter(Boolean)));
                      return (
                        <div key={subKey}>
                          <div
                            onClick={() => setExpandedSub(p => { const n = new Set(p); n.has(subKey) ? n.delete(subKey) : n.add(subKey); return n; })}
                            className="px-6 py-3 flex items-center justify-between hover:bg-white/5 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-3 pl-6">
                              {isSubOpen ? <ChevronDown size={15} className="text-blue-400" /> : <ChevronRight size={15} className="text-blue-400" />}
                              <Tag size={13} className="text-purple-400" />
                              <span className="text-sm font-semibold text-zinc-100">{subName}</span>
                              <span className="text-xs text-zinc-500">· {cities.length} ciudad{cities.length !== 1 ? 'es' : ''}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-zinc-400">{list.length} prospección{list.length !== 1 ? 'es' : ''}</span>
                              <span className="text-green-400 font-semibold">{subLeads} leads</span>
                            </div>
                          </div>

                          {/* SESIONES (ciudad · fecha · resultados) */}
                          {isSubOpen && (
                            <div className="bg-black/30 divide-y divide-white/5">
                              {list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(s => (
                                <div key={s.id} className="px-6 py-2.5 flex items-center justify-between pl-[4.5rem]">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <MapPin size={13} className="text-cyan-400 flex-shrink-0" />
                                    <span className="text-sm text-zinc-200">{fixMojibake(s.city) || '—'}</span>
                                    <span className="text-xs text-zinc-600 truncate">· "{fixMojibake(s.query)}"</span>
                                  </div>
                                  <div className="flex items-center gap-5 text-xs flex-shrink-0">
                                    <span className="text-zinc-500 flex items-center gap-1"><Clock size={11} /> {fmtDate(s.created_at)}</span>
                                    <span className={`font-semibold ${s.status === 'completed' ? 'text-green-400' : s.status === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                                      {s.total_found || 0} leads
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {catEntries.length === 0 && (
            <p className="px-6 py-16 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-xl">
              Sin prospecciones en este período
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
