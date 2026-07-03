'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ExternalLink, ArrowUpRight, ArrowDownRight, Minus, Clock, Link2, TrendingUp,
  Check, AlertTriangle, X,
} from 'lucide-react';

type AuditLog = {
  id: string;
  url: string;
  total_score: number;
  pass_count: number;
  warn_count: number;
  fail_count: number;
  duration_ms: number;
  created_at: string;
};

const scoreColor = (s: number) => (s >= 80 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400');
const strokeColor = (s: number) => (s >= 80 ? '#22c55e' : s >= 50 ? '#eab308' : '#ef4444');

const extractDomain = (url: string): string => {
  try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname; }
  catch { return url; }
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Mini gráfico de evolución (escala fija 0-100)
function Sparkline({ values, width = 260, height = 56 }: { values: number[]; width?: number; height?: number }) {
  const pad = 6;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const pts = values.map((v, i) => {
    const x = pad + (values.length === 1 ? w / 2 : (i / (values.length - 1)) * w);
    const y = pad + h - (Math.max(0, Math.min(100, v)) / 100) * h;
    return [x, y];
  });
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const trend = values.length >= 2 ? values[values.length - 1] - values[0] : 0;
  const color = trend > 0 ? '#22c55e' : trend < 0 ? '#ef4444' : '#a1a1aa';
  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* línea base 50 */}
      <line x1={pad} x2={width - pad} y1={pad + h - (50 / 100) * h} y2={pad + h - (50 / 100) * h}
        stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={strokeColor(values[i])} stroke="#18181b" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-zinc-600 text-xs">—</span>;
  const cls = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-zinc-500';
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={12} />{value > 0 ? '+' : ''}{value}
    </span>
  );
}

function AuditClienteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain') || '';
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (domain) loadData(); else setLoading(false); }, [domain]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('io_pro_audit_logs')
        .select('id, url, total_score, pass_count, warn_count, fail_count, duration_ms, created_at')
        .ilike('url', `%${domain}%`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      // Refinar: solo dominios EXACTOS
      setLogs((data || []).filter(l => extractDomain(l.url) === domain));
    } catch { toast.error('Error cargando evolución del cliente'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="text-zinc-500 text-center py-24">Cargando evolución...</div>;

  // Agrupar por URL idéntica (cada grupo ya viene ordenado cronológicamente asc)
  const byUrl = new Map<string, AuditLog[]>();
  logs.forEach(l => { if (!byUrl.has(l.url)) byUrl.set(l.url, []); byUrl.get(l.url)!.push(l); });
  const urlGroups = Array.from(byUrl.entries()).sort((a, b) => b[1].length - a[1].length);

  const totalAudits = logs.length;
  const latest = logs.length ? [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/audit-historico')}
          className="p-2 hover:bg-zinc-800 rounded-lg transition text-zinc-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Evolución · {domain || '—'}</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Comparativa de auditorías guardadas, por URL idéntica</p>
        </div>
      </div>

      {totalAudits === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-16 text-center text-zinc-500">
          No hay auditorías guardadas en el histórico para este cliente.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock size={13} /> Auditorías</p>
              <p className="text-3xl font-bold text-white">{totalAudits}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5"><Link2 size={13} /> URLs únicas</p>
              <p className="text-3xl font-bold text-yellow-400">{urlGroups.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp size={13} /> Score más reciente</p>
              <p className={`text-3xl font-bold ${latest ? scoreColor(latest.total_score) : 'text-white'}`}>{latest?.total_score ?? '—'}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Última auditoría</p>
              <p className="text-sm font-semibold text-zinc-300 mt-2">{latest ? fmtDate(latest.created_at) : '—'}</p>
            </div>
          </div>

          {/* Evolución por URL idéntica */}
          <div className="space-y-4">
            {urlGroups.map(([url, group]) => {
              const scores = group.map(g => g.total_score || 0);
              const first = scores[0];
              const last = scores[scores.length - 1];
              const totalDelta = group.length >= 2 ? last - first : null;
              return (
                <div key={url} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  {/* Cabecera de la URL */}
                  <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-400 hover:underline flex items-center gap-1.5 truncate">
                        {url} <ExternalLink size={12} className="flex-shrink-0" />
                      </a>
                      <p className="text-xs text-zinc-500 mt-0.5">{group.length} auditoría{group.length !== 1 ? 's' : ''} comparadas</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Sparkline values={scores} />
                      <div className="text-right">
                        <p className="text-xs text-zinc-500">primera → última</p>
                        <p className="flex items-center gap-2 justify-end">
                          <span className={`text-sm font-bold ${scoreColor(first)}`}>{first}</span>
                          <span className="text-zinc-600">→</span>
                          <span className={`text-sm font-bold ${scoreColor(last)}`}>{last}</span>
                          <Delta value={totalDelta} />
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tabla comparativa cronológica */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800/60">
                        <th className="text-left font-medium px-6 py-2.5">Fecha</th>
                        <th className="text-right font-medium px-3 py-2.5">Score</th>
                        <th className="text-right font-medium px-3 py-2.5">Δ</th>
                        <th className="text-right font-medium px-3 py-2.5">Checks</th>
                        <th className="text-right font-medium px-3 py-2.5">Duración</th>
                        <th className="text-right font-medium px-6 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {/* mostramos de más reciente a más antigua, pero el Δ se calcula vs la anterior cronológica */}
                      {[...group].reverse().map((log, idx, arr) => {
                        const prev = arr[idx + 1]; // la siguiente en el array invertido es la anterior cronológica
                        const delta = prev ? (log.total_score || 0) - (prev.total_score || 0) : null;
                        return (
                          <tr key={log.id} className="hover:bg-zinc-800/30 transition">
                            <td className="px-6 py-3 text-zinc-300">{fmtDate(log.created_at)}</td>
                            <td className={`px-3 py-3 text-right font-bold ${scoreColor(log.total_score)}`}>{log.total_score}</td>
                            <td className="px-3 py-3 text-right"><Delta value={delta} /></td>
                            <td className="px-3 py-3 text-right text-xs space-x-2 whitespace-nowrap">
                              <span className="text-green-400 inline-flex items-center gap-0.5"><Check size={12} />{log.pass_count}</span>
                              <span className="text-yellow-400 inline-flex items-center gap-0.5"><AlertTriangle size={12} />{log.warn_count}</span>
                              <span className="text-red-400 inline-flex items-center gap-0.5"><X size={12} />{log.fail_count}</span>
                            </td>
                            <td className="px-3 py-3 text-right text-zinc-600 text-xs">{log.duration_ms}ms</td>
                            <td className="px-6 py-3 text-right">
                              <button onClick={() => window.open(`/audit-resultados?id=${log.id}`, '_blank')}
                                className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1">
                                Ver <ExternalLink size={11} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function AuditClientePage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-center py-24">Cargando...</div>}>
      <AuditClienteContent />
    </Suspense>
  );
}
