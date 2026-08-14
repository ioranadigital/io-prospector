'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronRight, Lock, Globe, FileText, Zap, Bot, Circle, ClipboardList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Rule = {
  id: string;
  check_id: string;
  label: string;
  category: string;
  penalty: number;
  enabled: boolean;
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  technical: 'Indexación, renderizado, arquitectura de servidor.',
  crawl: 'Gestión del presupuesto de rastreo (crawl budget), sitemaps, robots.txt.',
  security: 'Protocolos HTTPS, cabeceras de seguridad, certificados.',
  meta: 'Títulos, meta descripciones, etiquetas open graph.',
  headings: 'Jerarquía de encabezados (H1-H6) y consistencia lógica.',
  content: 'Calidad del texto, thin content, canibalizaciones.',
  images: 'Textos alternativos (Alts), formatos modernos, compresión.',
  links: 'Perfil de enlaces internos, enlaces rotos, atributos nofollow/dofollow.',
  performance: 'Core Web Vitals, tiempos de carga, optimización de recursos.',
  mobile: 'Diseño adaptativo, usabilidad móvil, Mobile-First Indexing.',
  a11y: 'Contrastes de color, lectura para pantallas, usabilidad general.',
  schema: 'Marcado Schema.org (Artículos, FAQs, Organización, LocalBusiness).',
  analytics: 'Correcta implementación de GA4, píxeles y eventos de conversión.',
  local: 'Consistencia NAP (Nombre, Dirección, Teléfono), Google Business Profile.',
  compliance: 'Política de cookies, RGPD, aviso legal y términos de uso.',
};

const BLOCKS: { id: string; title: string; description: string; icon: LucideIcon; categories: string[]; bgColor: string; borderColor: string }[] = [
  {
    id: 'bloque-1',
    title: 'SEO Técnico y Rastreabilidad',
    description: 'La base del proyecto. Si los buscadores no pueden acceder, procesar o proteger el sitio, el resto del SEO no importa.',
    icon: Lock,
    categories: ['technical', 'crawl', 'security'],
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800/50',
  },
  {
    id: 'bloque-2',
    title: 'SEO Local y Legal',
    description: 'Optimización geográfica y cumplimiento normativo para negocios y pymes.',
    icon: Globe,
    categories: ['local', 'compliance'],
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800/50',
  },
  {
    id: 'bloque-3',
    title: 'Optimización On-Page y Contenido',
    description: 'El núcleo semántico. Fundamental tanto para SEO tradicional como para alimentar los motores de respuestas de IA.',
    icon: FileText,
    categories: ['meta', 'headings', 'content', 'images', 'links'],
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800/50',
  },
  {
    id: 'bloque-4',
    title: 'Rendimiento y Experiencia de Usuario',
    description: 'Factores de retención humana y señales técnicas que Google y los usuarios exigen por igual.',
    icon: Zap,
    categories: ['performance', 'mobile', 'a11y'],
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800/50',
  },
  {
    id: 'bloque-5',
    title: 'Datos Estructurados y Analítica',
    description: 'El idioma de las máquinas. Crítico para destacar, ya que los LLMs extraen información directamente de aquí.',
    icon: Bot,
    categories: ['schema', 'analytics'],
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800/50',
  },
];

export default function AuditConfigPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['bloque-1'])); // bloque-1 expandido por defecto
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Agrupar por categoría (calcular una vez)
  const grouped = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  useEffect(() => { loadRules(); }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('io_pro_audit_rules').select('*').order('category').order('label');
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar reglas');
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async (id: string, updates: object) => {
    const { error } = await supabase.from('io_pro_audit_rules').update(updates).eq('id', id);
    if (error) return toast.error('Error al actualizar regla');
    setRules(r => r.map(rule => rule.id === id ? { ...rule, ...updates } : rule));
    toast.success('Regla actualizada');
  };

  const toggleCategoryRules = async (category: string, enabled: boolean) => {
    const categoryRules = grouped[category] || [];

    try {
      // Actualizar todas las reglas de la categoría
      for (const rule of categoryRules) {
        const { error } = await supabase.from('io_pro_audit_rules').update({ enabled }).eq('id', rule.id);
        if (error) throw error;
      }

      // Actualizar estado local
      setRules(r =>
        r.map(rule =>
          rule.category === category ? { ...rule, enabled } : rule
        )
      );

      toast.success(`${enabled ? 'Habilitadas' : 'Deshabilitadas'} todas las reglas de ${category}`);
    } catch (err) {
      toast.error('Error al actualizar categoría');
    }
  };

  const getCategoryCheckboxState = (category: string) => {
    const catRules = grouped[category] || [];
    if (catRules.length === 0) return { enabled: false, indeterminate: false };
    const enabledCount = catRules.filter(r => r.enabled).length;
    return { enabled: enabledCount === catRules.length, indeterminate: enabledCount > 0 && enabledCount < catRules.length };
  };

  const toggleBlockExpanded = (blockId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(blockId) ? next.delete(blockId) : next.add(blockId);
      return next;
    });
  };

  const toggleCategoryExpanded = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  // Colores por categoría (coherentes con auditoría)
  const CATEGORY_STYLES: Record<string, { bg: string; border: string; label: string }> = {
    meta: {
      bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50',
      border: 'border-blue-300 dark:border-blue-700',
      label: 'Metadatos (12 checks)'
    },
    headings: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/50',
      border: 'border-yellow-300 dark:border-yellow-700',
      label: 'Headings (6 checks)'
    },
    images: {
      bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50',
      border: 'border-purple-300 dark:border-purple-700',
      label: 'Imágenes (4 checks)'
    },
    links: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800/50',
      border: 'border-cyan-300 dark:border-cyan-700',
      label: 'Enlaces (4 checks)'
    },
    technical: {
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50',
      border: 'border-red-300 dark:border-red-700',
      label: 'SEO Técnico (8 checks)'
    },
    performance: {
      bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50',
      border: 'border-orange-300 dark:border-orange-700',
      label: 'Performance (7 checks)'
    },
    ux: {
      bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50',
      border: 'border-purple-300 dark:border-purple-700',
      label: 'UX (12 checks)'
    },
    security: {
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50',
      border: 'border-red-300 dark:border-red-700',
      label: 'Seguridad (8 checks)'
    },
    a11y: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800/50',
      border: 'border-cyan-300 dark:border-cyan-700',
      label: 'Accesibilidad (7 checks)'
    },
    local: {
      bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50',
      border: 'border-green-300 dark:border-green-700',
      label: 'SEO Local (5 checks)'
    },
    mobile: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/50',
      border: 'border-yellow-300 dark:border-yellow-700',
      label: 'Mobile (4 checks)'
    },
    schema: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50',
      border: 'border-indigo-300 dark:border-indigo-700',
      label: 'Datos Estructurados (6 checks)'
    },
    crawl: {
      bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50',
      border: 'border-rose-300 dark:border-rose-700',
      label: 'Crawlability (5 checks)'
    },
    compliance: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
      border: 'border-emerald-300 dark:border-emerald-700',
      label: 'Compliance Legal (4 checks)'
    },
    analytics: {
      bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50',
      border: 'border-sky-300 dark:border-sky-700',
      label: 'Analytics Tracking (3 checks)'
    },
  };

  const TEXT_COLORS: Record<string, string> = {
    meta: 'text-blue-700 dark:text-blue-400',
    headings: 'text-yellow-700 dark:text-yellow-400',
    images: 'text-purple-700 dark:text-purple-400',
    links: 'text-cyan-700 dark:text-cyan-400',
    technical: 'text-red-700 dark:text-red-400',
    performance: 'text-orange-700 dark:text-orange-400',
    content: 'text-green-700 dark:text-green-400',
    a11y: 'text-cyan-700 dark:text-cyan-400',
    local: 'text-green-700 dark:text-green-400',
    mobile: 'text-yellow-700 dark:text-yellow-400',
    security: 'text-red-700 dark:text-red-400',
    schema: 'text-indigo-700 dark:text-indigo-400',
    crawl: 'text-rose-700 dark:text-rose-400',
    compliance: 'text-emerald-700 dark:text-emerald-400',
    analytics: 'text-sky-700 dark:text-sky-400',
  };

  const BADGE_COLORS: Record<string, string> = {
    meta: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    headings: 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    images: 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    links: 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
    technical: 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    performance: 'bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    content: 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    a11y: 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
    local: 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    mobile: 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    security: 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    schema: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    crawl: 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    compliance: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    analytics: 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  };

  if (loading) return <div className="text-zinc-600 dark:text-zinc-500 text-center py-24">Cargando reglas...</div>;

  return (
    <div className="w-full space-y-6 px-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2"><ClipboardList size={22} className="text-zinc-900 dark:text-white" /> Reglas de Auditoría</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Configura qué checks ejecutar y sus penalizaciones</p>
        <p className="text-zinc-600 dark:text-zinc-500 text-xs mt-2">Total: {rules.length} reglas en 5 bloques temáticos</p>
      </div>

      {rules.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center text-zinc-600 dark:text-zinc-500">
          No hay reglas de auditoría configuradas
        </div>
      ) : (
        <div className="space-y-4">
          {BLOCKS.map(block => {
            const blockCategories = block.categories;
            const blockRulesCount = rules.filter(r => blockCategories.includes(r.category)).length;
            const isBlockExpanded = expanded.has(block.id);

            return (
              <div
                key={block.id}
                className={`border rounded-xl overflow-hidden transition ${block.bgColor} border-black/10 dark:border-white/10`}
              >
                {/* Block Header */}
                <button
                  onClick={() => toggleBlockExpanded(block.id)}
                  className="w-full px-6 py-4 flex items-start justify-between hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <div className="flex items-start gap-4">
                    <block.icon size={28} className="text-zinc-900 dark:text-white" />
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{block.title}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{block.description}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">
                        <span className="text-blue-700 dark:text-blue-400 font-semibold">{blockRulesCount}</span> reglas
                      </p>
                    </div>
                  </div>
                  {isBlockExpanded ? (
                    <ChevronDown size={24} className="text-zinc-900 dark:text-white flex-shrink-0" />
                  ) : (
                    <ChevronRight size={24} className="text-zinc-900 dark:text-white flex-shrink-0" />
                  )}
                </button>

                {/* Block Content - Categorías */}
                {isBlockExpanded && (
                  <div className="border-t border-black/10 dark:border-white/10 px-6 py-4 space-y-4">
                    {blockCategories.map(category => {
                      const catRules = grouped[category] || [];
                      const style = CATEGORY_STYLES[category] || {
                        bg: 'bg-white dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800/50',
                        border: 'border-zinc-300 dark:border-zinc-700',
                        label: category
                      };
                      const isCategoryExpanded = expandedCategories.has(category);
                      const categoryState = getCategoryCheckboxState(category);

                      return (
                        <div key={category} className={`border rounded-lg overflow-hidden transition ${style.bg} ${style.border}`}>
                          {/* Category Header */}
                          <button
                            onClick={() => toggleCategoryExpanded(category)}
                            className="w-full px-5 py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Circle size={14} fill="currentColor" className={TEXT_COLORS[category] || 'text-zinc-500 dark:text-zinc-400'} />
                              <input
                                type="checkbox"
                                checked={categoryState.enabled}
                                ref={el => {
                                  if (el) el.indeterminate = categoryState.indeterminate;
                                }}
                                onChange={e => toggleCategoryRules(category, e.target.checked)}
                                onClick={e => e.stopPropagation()}
                                className="w-5 h-5 rounded cursor-pointer flex-shrink-0 accent-blue-500"
                              />
                              <div className="text-left flex-1">
                                <h4 className={`font-semibold text-sm ${TEXT_COLORS[category] || 'text-zinc-500 dark:text-zinc-400'}`}>{style.label}</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{CATEGORY_DESCRIPTIONS[category] || ''}</p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
                                  {catRules.filter(r => r.enabled).length}/{catRules.length} activas
                                </p>
                              </div>
                            </div>
                            {isCategoryExpanded ? (
                              <ChevronDown size={18} className={TEXT_COLORS[category]} />
                            ) : (
                              <ChevronRight size={18} className={TEXT_COLORS[category]} />
                            )}
                          </button>

                          {/* Rules Grid - 5 columns */}
                          {isCategoryExpanded && (
                            <div className="border-t border-black/10 dark:border-white/10 px-5 py-3">
                              <div className="grid grid-cols-5 gap-3">
                                {catRules.map(rule => (
                                  <div key={rule.id} className="flex flex-col gap-3 p-3 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition">
                                    {/* Checkbox y Label */}
                                    <div className="flex items-start gap-2">
                                      <input
                                        type="checkbox"
                                        checked={rule.enabled}
                                        onChange={e => saveRule(rule.id, { enabled: e.target.checked })}
                                        className="w-4 h-4 rounded cursor-pointer flex-shrink-0 mt-0.5 accent-blue-500"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-medium ${rule.enabled ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-500'}`}>
                                          {rule.label}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-0.5 font-mono break-all">{rule.check_id}</p>
                                      </div>
                                    </div>

                                    {/* Penalización */}
                                    <div className="flex items-center gap-1.5 pt-2 border-t border-black/10 dark:border-white/10 text-[11px]">
                                      <span className="text-zinc-600 dark:text-zinc-500">Penalización:</span>
                                      <div className="flex items-center gap-0.5 ml-auto">
                                        <input
                                          type="number"
                                          value={rule.penalty}
                                          onChange={e => saveRule(rule.id, { penalty: Number(e.target.value) })}
                                          className="w-12 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs font-mono text-red-700 dark:text-red-400 text-right focus:outline-none focus:border-red-500 transition"
                                        />
                                        <span className="text-zinc-400 dark:text-zinc-600">pts</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
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
      )}
    </div>
  );
}
