'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle, XCircle, AlertTriangle, Info,
  ChevronDown, ChevronRight, ExternalLink,
  UserPlus, History, ArrowLeft, Calendar,
  FileText, Check, X, Circle, Lightbulb
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { AuditContactModal } from '@/components/audit/AuditContactModal';
import { ClientReportModal } from '@/components/audit/ClientReportModal';
import { generateClientReport } from '@/lib/audit-client-report';

type CheckStatus = 'pass' | 'warn' | 'fail' | 'info';

type AuditCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  value: string | number | boolean | null;
  detail: string;
  fix: string | null;
};

type AuditResult = {
  url: string;
  totalScore: number;
  duration: number;
  auditedAt: string;
  categories: Record<string, any>;
  checks: Record<string, { label: string; weight: number; checks: AuditCheck[] }>;
  summary: { pass: number; warn: number; fail: number; info: number; total: number };
  topIssues: AuditCheck[];
  performance: { ttfb: number | null; lcp: number | null; cls: number | null; fcp: number | null };
};

const STATUS_CONFIG: Record<CheckStatus, { icon: React.FC<any>; color: string; bg: string; label: string }> = {
  pass: { icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-900/20 border border-green-800',   label: 'OK' },
  warn: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/20 border border-yellow-800', label: 'Aviso' },
  fail: { icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-900/20 border border-red-800',       label: 'Error' },
  info: { icon: Info,          color: 'text-blue-400',   bg: 'bg-blue-900/20 border border-blue-800',     label: 'Info' },
};

const CATEGORY_STYLES: Record<string, { bg: string; border: string; textColor: string }> = {
  meta:        { bg: 'bg-blue-950/30',    border: 'border-blue-800/50',    textColor: 'text-blue-400' },
  headings:    { bg: 'bg-yellow-950/30',  border: 'border-yellow-800/50',  textColor: 'text-yellow-400' },
  images:      { bg: 'bg-purple-950/30',  border: 'border-purple-800/50',  textColor: 'text-purple-400' },
  links:       { bg: 'bg-cyan-950/30',    border: 'border-cyan-800/50',    textColor: 'text-cyan-400' },
  technical:   { bg: 'bg-red-950/30',     border: 'border-red-800/50',     textColor: 'text-red-400' },
  performance: { bg: 'bg-orange-950/30',  border: 'border-orange-800/50',  textColor: 'text-orange-400' },
  content:     { bg: 'bg-green-950/30',   border: 'border-green-800/50',   textColor: 'text-green-400' },
  a11y:        { bg: 'bg-cyan-950/30',    border: 'border-cyan-800/50',    textColor: 'text-cyan-400' },
  local:       { bg: 'bg-green-950/30',   border: 'border-green-800/50',   textColor: 'text-green-400' },
  mobile:      { bg: 'bg-yellow-950/30',  border: 'border-yellow-800/50',  textColor: 'text-yellow-400' },
  security:    { bg: 'bg-red-950/30',     border: 'border-red-800/50',     textColor: 'text-red-400' },
  schema:      { bg: 'bg-indigo-950/30',  border: 'border-indigo-800/50',  textColor: 'text-indigo-400' },
  crawl:       { bg: 'bg-rose-950/30',    border: 'border-rose-800/50',    textColor: 'text-rose-400' },
  compliance:  { bg: 'bg-emerald-950/30', border: 'border-emerald-800/50', textColor: 'text-emerald-400' },
  analytics:   { bg: 'bg-sky-950/30',     border: 'border-sky-800/50',     textColor: 'text-sky-400' },
};

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
  const label = score >= 80 ? 'Excelente' : score >= 50 ? 'Mejorable' : 'Crítico';
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
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
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-zinc-500">/100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function AuditResultadosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyId = searchParams.get('id');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [savingLead, setSavingLead] = useState(false);
  const [savingHistory, setSavingHistory] = useState(false);
  const [saved, setSaved] = useState<'lead' | 'history' | null>(null);
  const [contactModal, setContactModal] = useState<'email' | 'whatsapp' | null>(null);
  const [showClientReport, setShowClientReport] = useState(false);
  const [contactPreFill, setContactPreFill] = useState<{ body?: string; subject?: string } | null>(null);
  // Vista histórica (abierta desde el Histórico con ?id=)
  const [isHistorical, setIsHistorical] = useState(false);
  const [historicalDate, setHistoricalDate] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [noDetail, setNoDetail] = useState(false);
  const [historicalMeta, setHistoricalMeta] = useState<{ url: string; total_score: number; pass_count: number; warn_count: number; fail_count: number } | null>(null);

  useEffect(() => {
    if (historyId) {
      loadFromHistory(historyId);
      return;
    }
    const stored = localStorage.getItem('audit_result');
    if (stored) {
      try { setResult(JSON.parse(stored)); }
      catch { toast.error('Error al cargar resultado'); }
    }
  }, [historyId]);

  const loadFromHistory = async (id: string) => {
    setLoadingHistory(true);
    try {
      // 1) Metadatos básicos (columnas que siempre existen)
      const { data: meta, error: metaErr } = await supabase
        .from('io_pro_audit_logs')
        .select('id, url, total_score, pass_count, warn_count, fail_count, duration_ms, created_at')
        .eq('id', id)
        .single();
      if (metaErr || !meta) throw metaErr || new Error('No encontrada');
      setHistoricalDate(meta.created_at);
      setIsHistorical(true);
      setSaved('history'); // ya está en histórico, no mostrar prompt de guardado

      // 2) Detalle completo (puede no existir si la columna result_json no está migrada)
      const { data: full } = await supabase
        .from('io_pro_audit_logs')
        .select('result_json')
        .eq('id', id)
        .single();
      if (full?.result_json) {
        setResult(full.result_json as AuditResult);
      } else {
        // Sin detalle: mostramos un resumen con los metadatos disponibles
        setHistoricalMeta({
          url: meta.url,
          total_score: meta.total_score,
          pass_count: meta.pass_count,
          warn_count: meta.warn_count,
          fail_count: meta.fail_count,
        });
        setNoDetail(true);
      }
    } catch {
      toast.error('No se pudo cargar la auditoría del histórico');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Guarda en histórico. Devuelve true si guardó el detalle completo, false si solo metadatos.
  const saveToHistory = async (): Promise<boolean> => {
    if (!result) return false;
    const base = {
      url: result.url,
      total_score: result.totalScore,
      pass_count: result.summary.pass,
      warn_count: result.summary.warn,
      fail_count: result.summary.fail,
      duration_ms: result.duration,
    };
    // Intento con detalle completo
    const { error } = await supabase.from('io_pro_audit_logs').insert({ ...base, result_json: result });
    if (!error) return true;
    // Si la columna result_json no existe aún, guardamos al menos los metadatos
    const missingCol = error.code === '42703' || /result_json/i.test(error.message || '');
    if (missingCol) {
      const { error: retryErr } = await supabase.from('io_pro_audit_logs').insert(base);
      if (retryErr) throw retryErr;
      return false;
    }
    throw error;
  };

  const handleSaveHistory = async () => {
    if (!result || saved) return;
    setSavingHistory(true);
    try {
      const full = await saveToHistory();
      setSaved('history');
      toast.success(full
        ? 'Guardado en histórico'
        : 'Guardado (solo resumen). Ejecuta la migración result_json para guardar el detalle completo.');
    } catch {
      toast.error('Error al guardar en histórico');
    } finally {
      setSavingHistory(false);
    }
  };

  const handleSaveAsLead = async () => {
    if (!result || saved) return;
    setSavingLead(true);
    try {
      const domain = new URL(result.url.startsWith('http') ? result.url : `https://${result.url}`).hostname;
      // Guardar en leads
      const { error } = await supabase.from('io_pro_leads').insert({
        business_name: domain,
        website: result.url,
        audit_score: result.totalScore,
        source: 'audit',
        crm_status: 'new',
        status: 'active',
        notes: `Score SEO: ${result.totalScore}/100. Auditoría realizada el ${new Date(result.auditedAt || Date.now()).toLocaleDateString('es-ES')}`,
      });
      if (error) throw error;
      // Guardar también en histórico automáticamente
      await saveToHistory();
      setSaved('lead');
      toast.success('Lead guardado · también añadido al histórico');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar lead');
    } finally {
      setSavingLead(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  if (loadingHistory) return (
    <div className="text-zinc-500 text-center py-32">Cargando auditoría histórica...</div>
  );

  // Auditoría histórica sin detalle completo guardado (columna result_json ausente o nula)
  if (noDetail) return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <Calendar size={40} className="text-zinc-600" />
      <div>
        <p className="text-zinc-200 text-lg font-semibold">Solo hay resumen para esta auditoría</p>
        {historicalMeta && <p className="text-blue-400 text-sm font-mono mt-1">{historicalMeta.url}</p>}
        {historicalDate && <p className="text-zinc-500 text-sm mt-0.5">Realizada el {fmtDate(historicalDate)}</p>}
      </div>

      {/* Resumen disponible */}
      {historicalMeta && (
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4">
            <p className={`text-3xl font-bold ${historicalMeta.total_score >= 80 ? 'text-green-400' : historicalMeta.total_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{historicalMeta.total_score}</p>
            <p className="text-xs text-zinc-500">/100</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-green-900/20 border border-green-800/40 rounded-lg px-4 py-3"><p className="text-xl font-bold text-green-400">{historicalMeta.pass_count}</p><p className="text-xs text-zinc-400">Correctos</p></div>
            <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg px-4 py-3"><p className="text-xl font-bold text-yellow-400">{historicalMeta.warn_count}</p><p className="text-xs text-zinc-400">Avisos</p></div>
            <div className="bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-3"><p className="text-xl font-bold text-red-400">{historicalMeta.fail_count}</p><p className="text-xs text-zinc-400">Errores</p></div>
          </div>
        </div>
      )}

      <p className="text-zinc-600 text-sm max-w-lg">
        El detalle completo (categorías y checks) no está almacenado para esta auditoría.
        Para guardarlo en futuras auditorías, ejecuta la migración <code className="text-zinc-400">result_json</code> en Supabase y vuelve a guardar.
      </p>
      <button onClick={() => router.push('/audit-historico')}
        className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium flex items-center gap-2 transition">
        <ArrowLeft size={16} /> Volver al Histórico
      </button>
    </div>
  );

  if (!result) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p className="text-zinc-500 text-lg">No hay resultados de auditoría.</p>
      <button onClick={() => router.push('/auditoria')}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition">
        <ArrowLeft size={16} /> Ir a Auditoría
      </button>
    </div>
  );

  const criticalIssues = Object.values(result.checks)
    .flatMap(cat => cat.checks)
    .filter(c => c.status === 'fail')
    .slice(0, 8);

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(isHistorical ? '/audit-historico' : '/auditoria')}
          className="p-2 hover:bg-zinc-800 rounded-lg transition text-zinc-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isHistorical ? 'Auditoría histórica' : 'Resultado de Auditoría'}
          </h1>
          <a href={result.url} target="_blank" rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline flex items-center gap-1 mt-0.5">
            {result.url} <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* BANNER HISTÓRICO (vista de solo lectura desde el Histórico) */}
      {isHistorical && (
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-white">Resultado guardado en el histórico</p>
              <p className="text-xs text-zinc-400">
                Auditoría realizada el {historicalDate ? fmtDate(historicalDate) : '—'}
              </p>
            </div>
          </div>
          <button onClick={() => router.push('/audit-historico')}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition">
            Volver al Histórico
          </button>
        </div>
      )}

      {/* PROMPT DE GUARDADO (solo en auditorías nuevas, no en vista histórica) */}
      {isHistorical ? null : saved === null ? (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-1">¿Qué deseas hacer con este resultado?</p>
          <p className="text-xs text-zinc-500 mb-4">El resultado no se guardará automáticamente.</p>
          <div className="flex flex-wrap gap-3">
            {/* Solo histórico */}
            <button
              onClick={handleSaveHistory}
              disabled={savingHistory}
              className="flex items-start gap-3 px-5 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 hover:border-green-500 rounded-lg transition text-left group"
            >
              <History size={18} className="text-green-400 group-hover:text-green-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-300">{savingHistory ? 'Guardando...' : 'Guardar en Histórico'}</p>
                <p className="text-xs text-zinc-500">Solo registro. No crea lead.</p>
              </div>
            </button>

            {/* Guardar como Lead (también guarda en histórico) */}
            <button
              onClick={handleSaveAsLead}
              disabled={savingLead}
              className="flex items-start gap-3 px-5 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 hover:border-blue-500 rounded-lg transition text-left group"
            >
              <UserPlus size={18} className="text-blue-400 group-hover:text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-300">{savingLead ? 'Guardando...' : 'Guardar como Lead'}</p>
                <p className="text-xs text-zinc-500">Crea lead en CRM + guarda en histórico.</p>
              </div>
            </button>

            {/* Informe cliente */}
            <button
              onClick={() => setShowClientReport(true)}
              className="flex items-start gap-3 px-5 py-3 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-800/50 hover:border-purple-600 rounded-lg transition text-left group"
            >
              <FileText size={18} className="text-purple-400 group-hover:text-purple-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-300">Informe para el cliente</p>
                <p className="text-xs text-zinc-500">Versión simplificada · Email HTML + WhatsApp con IA.</p>
              </div>
            </button>

            {/* Descartar */}
            <button
              onClick={() => router.push('/auditoria')}
              className="flex items-start gap-3 px-5 py-3 bg-red-900/20 hover:bg-red-900/30 border border-red-800/50 hover:border-red-600 rounded-lg transition text-left group"
            >
              <ArrowLeft size={18} className="text-red-400 group-hover:text-red-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Descartar</p>
                <p className="text-xs text-red-400/60">Volver sin guardar.</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Estado ya guardado */
        <div className={`rounded-xl px-5 py-4 flex items-center justify-between border ${
          saved === 'lead'
            ? 'bg-blue-900/20 border-blue-800/50'
            : 'bg-zinc-800 border-zinc-700'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className={saved === 'lead' ? 'text-blue-400' : 'text-green-400'} />
            <div>
              <p className="text-sm font-semibold text-white">
                {saved === 'lead' ? 'Lead creado y guardado en histórico' : 'Guardado en histórico'}
              </p>
              <p className="text-xs text-zinc-500">
                {saved === 'lead' ? 'Disponible en CRM › Leads' : 'Disponible en Audit SEO › Histórico'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {saved === 'lead' && (
              <button onClick={() => router.push('/leads')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                Ver Lead
              </button>
            )}
            <button onClick={() => router.push('/audit-historico')}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition">
              Ver Histórico
            </button>
            <button onClick={() => router.push('/auditoria')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition">
              Nueva Auditoría
            </button>
          </div>
        </div>
      )}

      {/* Fila principal: Score + KPIs + Performance */}
      <div className="grid grid-cols-4 gap-4">

        {/* Score */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center">
          <ScoreCircle score={result.totalScore} />
          <p className="text-xs text-zinc-500 mt-3">{result.duration}ms</p>
        </div>

        {/* Checks resumen */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-center gap-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Resultados</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-zinc-300">Correctos</span>
              </div>
              <span className="text-xl font-bold text-green-400">{result.summary.pass}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" />
                <span className="text-sm text-zinc-300">Avisos</span>
              </div>
              <span className="text-xl font-bold text-yellow-400">{result.summary.warn}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-red-400" />
                <span className="text-sm text-zinc-300">Errores</span>
              </div>
              <span className="text-xl font-bold text-red-400">{result.summary.fail}</span>
            </div>
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-4">Core Web Vitals</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'TTFB', value: result.performance?.ttfb, unit: 'ms', good: 800 },
              { label: 'FCP',  value: result.performance?.fcp,  unit: 's',  good: 1.8 },
              { label: 'LCP',  value: result.performance?.lcp,  unit: 's',  good: 2.5 },
              { label: 'CLS',  value: result.performance?.cls,  unit: '',   good: 0.1 },
            ].map(({ label, value, unit, good }) => {
              const isGood = value !== null && value !== undefined && value <= good;
              const color = value == null ? 'text-zinc-600' : isGood ? 'text-green-400' : 'text-red-400';
              return (
                <div key={label} className="bg-zinc-800/50 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono font-semibold">{label}</span>
                  <span className={`text-lg font-bold ${color}`}>
                    {value != null ? `${value}${unit}` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Problemas críticos */}
      {criticalIssues.length > 0 && (
        <div className="bg-red-950/20 border border-red-800/40 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-800/30 flex items-center gap-3">
            <XCircle size={18} className="text-red-400" />
            <h2 className="font-bold text-red-300">Problemas Críticos ({criticalIssues.length})</h2>
          </div>
          <div className="divide-y divide-red-800/20">
            {criticalIssues.map(check => (
              <div key={check.id} className="px-6 py-3 flex items-start gap-3">
                <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{check.label}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{check.detail}</p>
                  {check.fix && <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><Lightbulb size={12} className="text-yellow-400 flex-shrink-0" /> {check.fix}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Análisis por categoría */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Análisis por Categoría</h2>
        <div className="space-y-3">
          {Object.entries(result.checks).map(([catId, { label, checks }]) => {
            const style = CATEGORY_STYLES[catId] || { bg: 'bg-zinc-950/30', border: 'border-zinc-800/50', textColor: 'text-zinc-400' };
            const isExpanded = expandedCategory === catId;
            const passCount = checks.filter(c => c.status === 'pass').length;
            const warnCount = checks.filter(c => c.status === 'warn').length;
            const failCount = checks.filter(c => c.status === 'fail').length;
            const scorePercent = checks.length > 0 ? Math.round((passCount / checks.length) * 100) : 0;

            return (
              <div key={catId} className={`border rounded-xl overflow-hidden ${style.bg} ${style.border}`}>
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : catId)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-4">
                    <Circle size={14} fill="currentColor" className={style.textColor} />
                    <div className="text-left">
                      <h3 className={`font-bold text-base ${style.textColor}`}>{label}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-green-400 flex items-center gap-0.5"><Check size={11} /> {passCount}</span>
                        <span className="text-xs text-yellow-400 flex items-center gap-0.5"><AlertTriangle size={11} /> {warnCount}</span>
                        <span className="text-xs text-red-400 flex items-center gap-0.5"><X size={11} /> {failCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Mini barra de progreso */}
                    <div className="w-24">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={style.textColor}>{scorePercent}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
                        <div
                          className={`h-full transition-all ${scorePercent >= 80 ? 'bg-green-500' : scorePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronDown size={18} className={style.textColor} />
                      : <ChevronRight size={18} className={style.textColor} />
                    }
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/10 divide-y divide-white/5">
                    {checks.map(check => {
                      const config = STATUS_CONFIG[check.status];
                      const Icon = config.icon;
                      return (
                        <div key={check.id} className="px-6 py-3 flex items-start gap-3 hover:bg-white/3 transition">
                          <Icon size={15} className={`${config.color} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-white">{check.label}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg}`}>{config.label}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">{check.detail}</p>
                            {check.fix && <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><Lightbulb size={12} className="text-yellow-400 flex-shrink-0" /> {check.fix}</p>}
                          </div>
                          {/* Valor real (title, h1, ratios, conteos...) a la derecha — todas las categorías */}
                          {check.value !== null && check.value !== undefined && check.value !== ''
                            && typeof check.value !== 'boolean' && (
                            <div className="flex-shrink-0 w-2/5 max-w-[40%] text-right">
                              <span
                                title={String(check.value)}
                                className="inline-block text-left text-xs text-zinc-200 font-mono bg-zinc-800/60 border border-zinc-700/50 rounded px-2 py-1 max-w-full break-words whitespace-pre-wrap align-top"
                              >
                                {String(check.value)}
                              </span>
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
        </div>
      </div>

      {/* Modal de contacto (Email / WhatsApp) */}
      {contactModal && (
        <AuditContactModal
          isOpen={true}
          mode={contactModal}
          onClose={() => { setContactModal(null); setContactPreFill(null); }}
          auditData={{
            url: result.url,
            score: result.totalScore,
            pass: result.summary.pass,
            warn: result.summary.warn,
            fail: result.summary.fail,
          }}
          prefillBody={contactPreFill?.body}
          prefillSubject={contactPreFill?.subject}
        />
      )}

      {/* Modal informe cliente */}
      {showClientReport && (
        <ClientReportModal
          isOpen={true}
          onClose={() => setShowClientReport(false)}
          report={generateClientReport(result)}
          onSendEmail={(body, subject) => {
            setShowClientReport(false);
            setContactPreFill({ body, subject });
            setContactModal('email');
          }}
          onSendWhatsApp={(body) => {
            setShowClientReport(false);
            setContactPreFill({ body });
            setContactModal('whatsapp');
          }}
        />
      )}
    </div>
  );
}

export default function AuditResultadosPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-center py-32">Cargando...</div>}>
      <AuditResultadosContent />
    </Suspense>
  );
}
