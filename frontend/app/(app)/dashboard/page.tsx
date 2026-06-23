// frontend/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import {
  RefreshCw, TrendingUp, CheckCircle, BarChart3, Mail, Search,
  Globe, ShieldCheck, Smartphone, Code2, MapPin, Link2, Phone,
  MessageCircle, Users, Activity, Gauge, Star, AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

type Tab = 'resumen' | 'seo' | 'prospecting' | 'leads';

const TABS: { id: Tab; label: string; icon: React.FC<any>; accent: string }[] = [
  { id: 'resumen',     label: 'Resumen',      icon: BarChart3, accent: 'blue' },
  { id: 'seo',         label: 'Análisis SEO', icon: Gauge,     accent: 'green' },
  { id: 'prospecting', label: 'Prospecting',  icon: Search,    accent: 'sky' },
  { id: 'leads',       label: 'Leads / CRM',  icon: Users,     accent: 'purple' },
];

// ── Componentes reutilizables ─────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'text-white' }:
  { icon: React.FC<any>; label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
        <Icon size={14} /> {label}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max, suffix, barClass, labelWidth = 'w-40' }:
  { label: string; value: number; max: number; suffix?: string; barClass: string; labelWidth?: string }) {
  const widthPct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`${labelWidth} text-xs font-semibold text-zinc-300 truncate`}>{label}</div>
      <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden">
        <div className={`${barClass} h-full transition-all duration-300`} style={{ width: `${widthPct}%` }} />
      </div>
      <span className="text-sm font-bold text-white w-16 text-right">
        {value}{suffix || ''}
      </span>
    </div>
  );
}

function SectionCard({ title, accent, children }:
  { title: string; accent: string; children: React.ReactNode }) {
  const borderColor: Record<string, string> = {
    blue: 'border-blue-500', green: 'border-green-500', sky: 'border-sky-500',
    purple: 'border-purple-500', pink: 'border-pink-500', amber: 'border-amber-500',
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className={`text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 border-l-4 ${borderColor[accent] || 'border-zinc-500'} pl-3`}>
        {title}
      </h2>
      {children}
    </div>
  );
}

const CRM_LABELS: Record<string, string> = {
  new: 'Nuevo', contacted: 'Contactado', interested: 'Interesado',
  reserved: 'Reservado', sold: 'Vendido', upselling: 'Upselling', lost: 'Perdido',
};
const CRM_COLORS: Record<string, string> = {
  new: 'bg-blue-500', contacted: 'bg-yellow-400', interested: 'bg-green-500',
  reserved: 'bg-purple-500', sold: 'bg-emerald-500', upselling: 'bg-pink-500', lost: 'bg-red-500',
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('resumen');

  async function loadAnalytics() {
    setLoading(true);
    try {
      const analytics = await api.getAnalyticsSummary();
      setData(analytics);
    } catch (error: any) {
      toast.error(`Error: ${error?.message}`);
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => { loadAnalytics(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-400">
        <RefreshCw size={20} className="animate-spin mr-2" /> Cargando análisis...
      </div>
    );
  }
  if (!data) {
    return <div className="flex items-center justify-center h-96 text-zinc-400">No hay datos disponibles</div>;
  }

  const crmTotal = Object.values(data.crm as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
  const emailsTotal = (data.activity?.total_emails || 0) + (data.activity?.total_whatsapp || 0);

  return (
    <div className="w-full space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2"><BarChart3 size={22} className="text-white" /> Dashboard de Análisis</h1>
          <p className="text-zinc-400 text-sm mt-1">Control analítico de SEO, prospecting y leads</p>
        </div>
        <button onClick={loadAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Tabs (ancho completo) */}
      <div className="flex w-full gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ════════ RESUMEN ════════ */}
      {tab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={Users} label="Total Leads" value={data.leads?.total || 0} sub="En el sistema" />
            <StatCard icon={Gauge} label="Score SEO medio" value={data.seo?.avg_audit_score || 0} sub={`${data.seo?.scored_leads || 0} con score`} color="text-green-400" />
            <StatCard icon={Search} label="Prospecciones" value={data.prospections?.total_sessions || 0} sub={`${data.prospections?.total_leads_found || 0} leads encontrados`} color="text-sky-400" />
            <StatCard icon={CheckCircle} label="Auditorías" value={data.audits?.total_audits || 0} sub="Guardadas en histórico" color="text-emerald-400" />
            <StatCard icon={Mail} label="Contactos" value={emailsTotal} sub={`${data.activity?.recent_7d || 0} últimos 7 días`} color="text-purple-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Funnel CRM" accent="blue">
              <div className="space-y-3">
                {Object.entries(CRM_LABELS).map(([key, label]) => {
                  const count = data.crm[key] || 0;
                  const p = crmTotal > 0 ? Math.round((count / crmTotal) * 100) : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-24 text-xs font-semibold text-zinc-300">{label}</div>
                      <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden">
                        <div className={`${CRM_COLORS[key]} h-full transition-all duration-300`} style={{ width: `${p}%` }} />
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-sm font-bold text-white">{count}</span>
                        <span className="text-xs text-zinc-500 ml-1">({p}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Distribución de Score SEO" accent="green">
              <ScoreDistribution dist={data.seo?.score_distribution} />
            </SectionCard>
          </div>
        </div>
      )}

      {/* ════════ ANÁLISIS SEO ════════ */}
      {tab === 'seo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={Gauge} label="Score medio" value={data.seo?.avg_audit_score || 0} sub="/ 100" color="text-green-400" />
            <StatCard icon={BarChart3} label="Leads con score" value={data.seo?.scored_leads || 0} sub={`de ${data.seo?.total_leads || 0} totales`} />
            <StatCard icon={CheckCircle} label="Auditorías" value={data.audits?.total_audits || 0} sub="Guardadas" color="text-emerald-400" />
            <StatCard icon={Link2} label="Enlaces rotos" value={data.seo?.avg_broken_links || 0} sub="Media por lead" color="text-red-400" />
            <StatCard icon={Star} label="Rating GMB" value={data.seo?.avg_gmb_rating || 0} sub="Media" color="text-amber-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Distribución de Score" accent="green">
              <ScoreDistribution dist={data.seo?.score_distribution} />
            </SectionCard>

            <SectionCard title="Checks Técnicos" accent="green">
              <div className="space-y-3">
                {[
                  { icon: Globe, label: 'Tiene Sitio Web', value: data.seo?.pct_has_website || 0, bar: 'bg-blue-500' },
                  { icon: ShieldCheck, label: 'SSL Activo', value: data.seo?.pct_ssl || 0, bar: 'bg-green-500' },
                  { icon: Smartphone, label: 'Mobile Responsive', value: data.seo?.pct_mobile || 0, bar: 'bg-purple-500' },
                  { icon: Code2, label: 'Schema Markup', value: data.seo?.pct_schema || 0, bar: 'bg-amber-500' },
                  { icon: MapPin, label: 'GMB Reclamado', value: data.seo?.pct_gmb_claimed || 0, bar: 'bg-pink-500' },
                ].map(r => (
                  <BarRow key={r.label} label={r.label} value={r.value} max={100} suffix="%" barClass={r.bar} labelWidth="w-40" />
                ))}
              </div>
            </SectionCard>
          </div>

          {data.audits?.total_audits > 0 && (
            <SectionCard title="Auditorías guardadas (checks acumulados)" accent="green">
              <div className="grid grid-cols-3 gap-4">
                <MiniStat label="Correctos" value={data.audits.total_pass} color="text-green-400" />
                <MiniStat label="Avisos" value={data.audits.total_warn} color="text-yellow-400" />
                <MiniStat label="Errores" value={data.audits.total_fail} color="text-red-400" />
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {/* ════════ PROSPECTING ════════ */}
      {tab === 'prospecting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={Search} label="Sesiones de prospección" value={data.prospections?.total_sessions || 0} sub="Totales" color="text-sky-400" />
            <StatCard icon={TrendingUp} label="Leads encontrados" value={data.prospections?.total_leads_found || 0} sub="Acumulados" />
            <StatCard icon={Activity} label="Media por sesión" value={data.prospections?.avg_per_session || 0} sub="Leads / búsqueda" color="text-cyan-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Top Categorías" accent="sky">
              <TopList items={data.prospections?.top_categories} nameKey="category" barClass="bg-purple-500" empty="Sin datos" />
            </SectionCard>
            <SectionCard title="Top Ciudades" accent="sky">
              <TopList items={data.prospections?.top_cities} nameKey="city" barClass="bg-cyan-500" empty="Sin datos" />
            </SectionCard>
          </div>
        </div>
      )}

      {/* ════════ LEADS / CRM ════════ */}
      {tab === 'leads' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Leads" value={data.leads?.total || 0} sub="En el CRM" color="text-purple-400" />
            <StatCard icon={Mail} label="Con email" value={`${data.leads?.contactability?.pct_email || 0}%`} sub={`${data.leads?.contactability?.with_email || 0} leads`} />
            <StatCard icon={Phone} label="Con teléfono" value={`${data.leads?.contactability?.pct_phone || 0}%`} sub={`${data.leads?.contactability?.with_phone || 0} leads`} />
            <StatCard icon={Globe} label="Con sitio web" value={`${data.leads?.contactability?.pct_website || 0}%`} sub={`${data.leads?.contactability?.with_website || 0} leads`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Funnel CRM" accent="purple">
              <div className="space-y-3">
                {Object.entries(CRM_LABELS).map(([key, label]) => {
                  const count = data.crm[key] || 0;
                  const p = crmTotal > 0 ? Math.round((count / crmTotal) * 100) : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-24 text-xs font-semibold text-zinc-300">{label}</div>
                      <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden">
                        <div className={`${CRM_COLORS[key]} h-full transition-all duration-300`} style={{ width: `${p}%` }} />
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-sm font-bold text-white">{count}</span>
                        <span className="text-xs text-zinc-500 ml-1">({p}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Reparto por Prioridad" accent="purple">
              <PriorityList priority={data.leads?.priority} />
            </SectionCard>
          </div>

          <SectionCard title="Actividad de Contacto" accent="pink">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniStat icon={Mail} label="Emails enviados" value={data.activity?.total_emails || 0} color="text-blue-400" />
              <MiniStat icon={MessageCircle} label="WhatsApps enviados" value={data.activity?.total_whatsapp || 0} color="text-green-400" />
              <MiniStat icon={Phone} label="Llamadas" value={data.activity?.total_calls || 0} color="text-amber-400" />
              <MiniStat icon={Activity} label="Últimos 7 días" value={data.activity?.recent_7d || 0} color="text-purple-400" />
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

// ── Sub-bloques ───────────────────────────────────────────
function ScoreDistribution({ dist }: { dist?: { excelente: number; mejorable: number; critico: number } }) {
  const d = dist || { excelente: 0, mejorable: 0, critico: 0 };
  const total = d.excelente + d.mejorable + d.critico;
  const rows = [
    { label: 'Excelente (80-100)', value: d.excelente, bar: 'bg-green-500' },
    { label: 'Mejorable (50-79)', value: d.mejorable, bar: 'bg-yellow-500' },
    { label: 'Crítico (0-49)', value: d.critico, bar: 'bg-red-500' },
  ];
  if (total === 0) return <p className="text-xs text-zinc-600">Sin leads con puntuación todavía</p>;
  return (
    <div className="space-y-3">
      {rows.map(r => (
        <BarRow key={r.label} label={r.label} value={r.value} max={total} barClass={r.bar} labelWidth="w-40" />
      ))}
    </div>
  );
}

function TopList({ items, nameKey, barClass, empty }:
  { items?: any[]; nameKey: string; barClass: string; empty: string }) {
  const list = items || [];
  if (list.length === 0) return <p className="text-xs text-zinc-600">{empty}</p>;
  const max = Math.max(...list.map(i => i.count));
  return (
    <div className="space-y-3">
      {list.map((item, idx) => (
        <BarRow key={idx} label={item[nameKey] || 'Sin definir'} value={item.count} max={max} barClass={barClass} labelWidth="flex-1 max-w-[12rem]" />
      ))}
    </div>
  );
}

function PriorityList({ priority }: { priority?: Record<string, number> }) {
  const p = priority || {};
  const entries = Object.entries(p);
  if (entries.length === 0) return <p className="text-xs text-zinc-600">Sin datos</p>;
  const max = Math.max(...entries.map(([, v]) => v));
  const labels: Record<string, string> = {
    web_design: 'Diseño web', seo: 'SEO', normal: 'Normal',
    medium: 'Media', high: 'Alta', low: 'Baja', 'sin definir': 'Sin definir',
  };
  const colors: Record<string, string> = {
    web_design: 'bg-red-500', seo: 'bg-amber-400', high: 'bg-red-500', medium: 'bg-blue-500', low: 'bg-zinc-500',
  };
  return (
    <div className="space-y-3">
      {entries.sort(([, a], [, b]) => b - a).map(([key, count]) => (
        <BarRow key={key} label={labels[key] || key} value={count} max={max} barClass={colors[key] || 'bg-purple-500'} labelWidth="w-32" />
      ))}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }:
  { icon?: React.FC<any>; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
      <div className="text-xs font-semibold text-zinc-400 uppercase mb-2 flex items-center gap-1.5">
        {Icon && <Icon size={13} />} {label}
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

