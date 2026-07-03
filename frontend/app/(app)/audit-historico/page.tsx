'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  CheckCircle, AlertTriangle, XCircle,
  ChevronDown, ChevronRight, ExternalLink, Trash2,
  RotateCw, ArrowUpRight, ArrowDownRight, Minus, LineChart, BarChart2, Check, X,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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

// Círculo de score reutilizado del diseño de Resultados
function ScoreCircle({ score, size = 'lg' }: { score: number; size?: 'lg' | 'sm' }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
  const label = score >= 80 ? 'Excelente' : score >= 50 ? 'Mejorable' : 'Crítico';
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const box = size === 'lg' ? 'w-36 h-36' : 'w-20 h-20';
  const num = size === 'lg' ? 'text-3xl' : 'text-xl';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${box}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#27272a" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${num} font-bold text-white`}>{score}</span>
          {size === 'lg' && <span className="text-xs text-zinc-500">/100</span>}
        </div>
      </div>
      {size === 'lg' && <span className="text-sm font-semibold" style={{ color }}>{label}</span>}
    </div>
  );
}

const scoreColor = (s: number) => (s >= 80 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400');
const cardStyle = (s: number) =>
  s >= 80
    ? 'bg-green-950/20 border-green-800/40'
    : s >= 50
      ? 'bg-yellow-950/20 border-yellow-800/40'
      : 'bg-red-950/20 border-red-800/40';

// Delta de tendencia: compara la auditoría más reciente con la inmediatamente anterior
function TrendDelta({ logs }: { logs: AuditLog[] }) {
  const sorted = [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (sorted.length < 2) return null;
  const delta = (sorted[0].total_score || 0) - (sorted[1].total_score || 0);
  const cls = delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-zinc-500';
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${cls}`}
      title="Cambio respecto a la auditoría anterior">
      <Icon size={12} />{delta > 0 ? '+' : ''}{delta}
    </span>
  );
}

export default function AuditHistoricoPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '7days' | '30days'>('7days');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirmDel, setConfirmDel] = useState<
    | { type: 'log'; id: string; url: string }
    | { type: 'domain'; domain: string; logs: AuditLog[] }
    | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [reauditing, setReauditing] = useState<string | null>(null);

  const reAudit = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (reauditing) return;
    setReauditing(url);
    const t = toast.loading(`Re-auditando ${url}...`);
    try {
      const result: any = await api.auditUrl(url);
      // No se guarda automáticamente: se abre el resultado para guardado manual
      localStorage.setItem('audit_result', JSON.stringify(result));
      toast.success('Auditoría lista · revísala y guárdala en histórico', { id: t });
      window.open('/audit-resultados', '_blank');
    } catch (err: any) {
      toast.error(err?.message || 'Error al re-auditar', { id: t });
    } finally {
      setReauditing(null);
    }
  };

  const extractDomain = (url: string): string => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    } catch { return url; }
  };

  const groupByDomain = (auditLogs: AuditLog[]) => {
    const grouped = new Map<string, AuditLog[]>();
    auditLogs.forEach(log => {
      const domain = extractDomain(log.url);
      if (!grouped.has(domain)) grouped.set(domain, []);
      grouped.get(domain)!.push(log);
    });
    return grouped;
  };

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('io_pro_audit_logs')
        .select('id, url, total_score, pass_count, warn_count, fail_count, duration_ms, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (filter !== 'all') {
        const daysAgo = filter === '7days' ? 7 : 30;
        const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', since);
      }
      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch { toast.error('Error cargando histórico'); }
    finally { setLoading(false); }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      if (confirmDel.type === 'log') {
        const { error } = await supabase.from('io_pro_audit_logs').delete().eq('id', confirmDel.id);
        if (error) throw error;
        setLogs(p => p.filter(l => l.id !== confirmDel.id));
        toast.success('Auditoría eliminada');
      } else {
        const ids = confirmDel.logs.map(l => l.id);
        const { error } = await supabase.from('io_pro_audit_logs').delete().in('id', ids);
        if (error) throw error;
        setLogs(p => p.filter(l => !ids.includes(l.id)));
        toast.success(`${ids.length} auditoría${ids.length !== 1 ? 's' : ''} eliminada${ids.length !== 1 ? 's' : ''}`);
      }
      setConfirmDel(null);
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  // KPIs globales
  const totalAudits = logs.length;
  const avgScore = totalAudits > 0 ? Math.round(logs.reduce((s, l) => s + (l.total_score || 0), 0) / totalAudits) : 0;
  const totalPass = logs.reduce((s, l) => s + (l.pass_count || 0), 0);
  const totalWarn = logs.reduce((s, l) => s + (l.warn_count || 0), 0);
  const totalFail = logs.reduce((s, l) => s + (l.fail_count || 0), 0);
  const grouped = Array.from(groupByDomain(logs).entries()).sort((a, b) => b[1].length - a[1].length);
  const uniqueClients = grouped.length;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="text-zinc-500 text-center py-24">Cargando histórico...</div>;

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart2 size={22} className="text-white" /> Histórico de Auditorías</h1>
          <p className="text-zinc-400 text-sm mt-1">Resultados guardados, agrupados por cliente</p>
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

      {/* Fila principal: Score global (1/3) + Checks acumulados (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Score global — 1/3 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center">
          <ScoreCircle score={avgScore} />
          <p className="text-xs text-zinc-500 mt-3">Score promedio global</p>
          <p className="text-[11px] text-zinc-600 mt-1">
            {totalAudits} auditoría{totalAudits !== 1 ? 's' : ''} · {uniqueClients} cliente{uniqueClients !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Checks acumulados — 2/3 */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-4">Checks acumulados</p>
          <div className="grid grid-cols-3 gap-3 flex-1">
            {[
              { label: 'Correctos', value: totalPass, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20 border-green-800/40' },
              { label: 'Avisos',    value: totalWarn, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40' },
              { label: 'Errores',   value: totalFail, icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/40' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`rounded-lg border px-4 py-5 flex flex-col items-center justify-center gap-2 h-full ${bg}`}>
                <Icon size={22} className={color} />
                <span className={`text-3xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjetas por cliente (estilo categorías de Resultados, ancho completo) */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Clientes auditados</h2>
        <div className="space-y-3">
          {grouped.map(([domain, domainLogs]) => {
            const isExpanded = expanded.has(domain);
            const avg = Math.round(domainLogs.reduce((s, l) => s + (l.total_score || 0), 0) / domainLogs.length);
            const pass = domainLogs.reduce((s, l) => s + (l.pass_count || 0), 0);
            const warn = domainLogs.reduce((s, l) => s + (l.warn_count || 0), 0);
            const fail = domainLogs.reduce((s, l) => s + (l.fail_count || 0), 0);
            return (
              <div key={domain} className={`border rounded-xl overflow-hidden ${cardStyle(avg)}`}>
                <div
                  onClick={() => setExpanded(p => { const n = new Set(p); n.has(domain) ? n.delete(domain) : n.add(domain); return n; })}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <ScoreCircle score={avg} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white">{domain}</h3>
                        <TrendDelta logs={domainLogs} />
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{domainLogs.length} auditoría{domainLogs.length !== 1 ? 's' : ''}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-green-400 flex items-center gap-0.5"><Check size={11} /> {pass}</span>
                        <span className="text-xs text-yellow-400 flex items-center gap-0.5"><AlertTriangle size={11} /> {warn}</span>
                        <span className="text-xs text-red-400 flex items-center gap-0.5"><X size={11} /> {fail}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/audit-cliente?domain=${encodeURIComponent(domain)}`); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-blue-600/20 border border-zinc-700 hover:border-blue-600/50 text-zinc-300 hover:text-blue-300 rounded-lg text-xs font-medium transition"
                      title="Ver evolución comparativa del cliente">
                      <LineChart size={14} /> Ver evolución
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDel({ type: 'domain', domain, logs: domainLogs }); }}
                      className="p-2 hover:bg-red-900/30 rounded-lg transition" title="Eliminar cliente">
                      <Trash2 size={15} className="text-red-400" />
                    </button>
                    {isExpanded ? <ChevronDown size={18} className="text-zinc-400" /> : <ChevronRight size={18} className="text-zinc-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/10 divide-y divide-white/5">
                    {domainLogs
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map(log => (
                        <div
                          key={log.id}
                          onClick={() => window.open(`/audit-resultados?id=${log.id}`, '_blank')}
                          title="Ver detalle del análisis"
                          className="px-6 py-3 flex items-center justify-between hover:bg-white/5 transition cursor-pointer group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-zinc-200 font-mono text-xs truncate group-hover:text-blue-300 transition flex items-center gap-1.5">
                              {log.url}
                              <ExternalLink size={11} className="text-zinc-600 group-hover:text-blue-400 flex-shrink-0" />
                            </p>
                            <p className="text-zinc-500 text-xs mt-0.5">{fmtDate(log.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-5 ml-4 flex-shrink-0">
                            <span className={`font-bold text-sm ${scoreColor(log.total_score)}`}>{log.total_score}</span>
                            <div className="text-xs space-x-2">
                              <span className="text-green-400 inline-flex items-center gap-0.5"><Check size={11} /> {log.pass_count}</span>
                              <span className="text-yellow-400 inline-flex items-center gap-0.5"><AlertTriangle size={11} /> {log.warn_count}</span>
                              <span className="text-red-400 inline-flex items-center gap-0.5"><X size={11} /> {log.fail_count}</span>
                            </div>
                            <span className="text-zinc-600 text-xs">{log.duration_ms}ms</span>
                            <button
                              onClick={e => reAudit(log.url, e)}
                              disabled={reauditing === log.url}
                              className="p-1.5 hover:bg-blue-900/30 rounded transition disabled:opacity-50" title="Volver a auditar esta URL">
                              <RotateCw size={12} className={`text-blue-400 ${reauditing === log.url ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setConfirmDel({ type: 'log', id: log.id, url: log.url }); }}
                              className="p-1.5 hover:bg-red-900/30 rounded transition" title="Eliminar análisis">
                              <Trash2 size={12} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
          {grouped.length === 0 && (
            <p className="px-6 py-16 text-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-xl">
              Sin auditorías en este período
            </p>
          )}
        </div>
      </div>

      {/* Modal de confirmación de borrado */}
      <ConfirmDialog
        open={confirmDel !== null}
        loading={deleting}
        title={confirmDel?.type === 'domain' ? 'Eliminar cliente' : 'Eliminar análisis'}
        message={
          confirmDel?.type === 'domain'
            ? `Se eliminarán las ${confirmDel.logs.length} auditoría${confirmDel.logs.length !== 1 ? 's' : ''} de ${confirmDel.domain}. Esta acción no se puede deshacer.`
            : confirmDel?.type === 'log'
              ? `Se eliminará esta auditoría de ${confirmDel.url}. Esta acción no se puede deshacer.`
              : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => { if (!deleting) setConfirmDel(null); }}
      />
    </div>
  );
}
