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
    bgColor: 'bg-red-950/30',
    borderColor: 'border-red-800/50',
  },
  {
    id: 'bloque-2',
    title: 'SEO Local y Legal',
    description: 'Optimización geográfica y cumplimiento normativo para negocios y pymes.',
    icon: Globe,
    categories: ['local', 'compliance'],
    bgColor: 'bg-green-950/30',
    borderColor: 'border-green-800/50',
  },
  {
    id: 'bloque-3',
    title: 'Optimización On-Page y Contenido',
    description: 'El núcleo semántico. Fundamental tanto para SEO tradicional como para alimentar los motores de respuestas de IA.',
    icon: FileText,
    categories: ['meta', 'headings', 'content', 'images', 'links'],
    bgColor: 'bg-blue-950/30',
    borderColor: 'border-blue-800/50',
  },
  {
    id: 'bloque-4',
    title: 'Rendimiento y Experiencia de Usuario',
    description: 'Factores de retención humana y señales técnicas que Google y los usuarios exigen por igual.',
    icon: Zap,
    categories: ['performance', 'mobile', 'a11y'],
    bgColor: 'bg-orange-950/30',
    borderColor: 'border-orange-800/50',
  },
  {
    id: 'bloque-5',
    title: 'Datos Estructurados y Analítica',
    description: 'El idioma de las máquinas. Crítico para destacar, ya que los LLMs extraen información directamente de aquí.',
    icon: Bot,
    categories: ['schema', 'analytics'],
    bgColor: 'bg-indigo-950/30',
    borderColor: 'border-indigo-800/50',
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
      bg: 'bg-blue-950/30 border-blue-800/50',
      border: 'border-blue-700',
      label: 'Metadatos (12 checks)'
    },
    headings: {
      bg: 'bg-yellow-950/30 border-yellow-800/50',
      border: 'border-yellow-700',
      label: 'Headings (6 checks)'
    },
    images: {
      bg: 'bg-purple-950/30 border-purple-800/50',
      border: 'border-purple-700',
      label: 'Imágenes (4 checks)'
    },
    links: {
      bg: 'bg-cyan-950/30 border-cyan-800/50',
      border: 'border-cyan-700',
      label: 'Enlaces (4 checks)'
    },
    technical: {
      bg: 'bg-red-950/30 border-red-800/50',
      border: 'border-red-700',
      label: 'SEO Técnico (8 checks)'
    },
    performance: {
      bg: 'bg-orange-950/30 border-orange-800/50',
      border: 'border-orange-700',
      label: 'Performance (7 checks)'
    },
    ux: {
      bg: 'bg-purple-950/30 border-purple-800/50',
      border: 'border-purple-700',
      label: 'UX (12 checks)'
    },
    security: {
      bg: 'bg-red-950/30 border-red-800/50',
      border: 'border-red-700',
      label: 'Seguridad (8 checks)'
    },
    a11y: {
      bg: 'bg-cyan-950/30 border-cyan-800/50',
      border: 'border-cyan-700',
      label: 'Accesibilidad (7 checks)'
    },
    local: {
      bg: 'bg-green-950/30 border-green-800/50',
      border: 'border-green-700',
      label: 'SEO Local (5 checks)'
    },
    mobile: {
      bg: 'bg-yellow-950/30 border-yellow-800/50',
      border: 'border-yellow-700',
      label: 'Mobile (4 checks)'
    },
    schema: {
      bg: 'bg-indigo-950/30 border-indigo-800/50',
      border: 'border-indigo-700',
      label: 'Datos Estructurados (6 checks)'
    },
    crawl: {
      bg: 'bg-rose-950/30 border-rose-800/50',
      border: 'border-rose-700',
      label: 'Crawlability (5 checks)'
    },
    compliance: {
      bg: 'bg-emerald-950/30 border-emerald-800/50',
      border: 'border-emerald-700',
      label: 'Compliance Legal (4 checks)'
    },
    analytics: {
      bg: 'bg-sky-950/30 border-sky-800/50',
      border: 'border-sky-700',
      label: 'Analytics Tracking (3 checks)'
    },
  };

  const TEXT_COLORS: Record<string, string> = {
    meta: 'text-blue-400',
    headings: 'text-yellow-400',
    images: 'text-purple-400',
    links: 'text-cyan-400',
    technical: 'text-red-400',
    performance: 'text-orange-400',
    content: 'text-green-400',
    a11y: 'text-cyan-400',
    local: 'text-green-400',
    mobile: 'text-yellow-400',
    security: 'text-red-400',
    schema: 'text-indigo-400',
    crawl: 'text-rose-400',
    compliance: 'text-emerald-400',
    analytics: 'text-sky-400',
  };

  const BADGE_COLORS: Record<string, string> = {
    meta: 'bg-blue-900/40 text-blue-300',
    headings: 'bg-yellow-900/40 text-yellow-300',
    images: 'bg-purple-900/40 text-purple-300',
    links: 'bg-cyan-900/40 text-cyan-300',
    technical: 'bg-red-900/40 text-red-300',
    performance: 'bg-orange-900/40 text-orange-300',
    content: 'bg-green-900/40 text-green-300',
    a11y: 'bg-cyan-900/40 text-cyan-300',
    local: 'bg-green-900/40 text-green-300',
    mobile: 'bg-yellow-900/40 text-yellow-300',
    security: 'bg-red-900/40 text-red-300',
    schema: 'bg-indigo-900/40 text-indigo-300',
    crawl: 'bg-rose-900/40 text-rose-300',
    compliance: 'bg-emerald-900/40 text-emerald-300',
    analytics: 'bg-sky-900/40 text-sky-300',
  };

  if (loading) return <div className="text-zinc-500 text-center py-24">Cargando reglas...</div>;

  return (
    <div className="w-full space-y-6 px-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><ClipboardList size={22} className="text-white" /> Reglas de Auditoría</h1>
        <p className="text-zinc-400 text-sm mt-1">Configura qué checks ejecutar y sus penalizaciones</p>
        <p className="text-zinc-500 text-xs mt-2">Total: {rules.length} reglas en 5 bloques temáticos</p>
      </div>

      {rules.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
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
                className={`border rounded-xl overflow-hidden transition ${block.bgColor} border-white/10`}
              >
                {/* Block Header */}
                <button
                  onClick={() => toggleBlockExpanded(block.id)}
                  className="w-full px-6 py-4 flex items-start justify-between hover:bg-white/5 transition"
                >
                  <div className="flex items-start gap-4">
                    <block.icon size={28} className="text-white" />
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-white">{block.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{block.description}</p>
                      <p className="text-xs text-zinc-600 mt-2">
                        <span className="text-blue-400 font-semibold">{blockRulesCount}</span> reglas
                      </p>
                    </div>
                  </div>
                  {isBlockExpanded ? (
                    <ChevronDown size={24} className="text-white flex-shrink-0" />
                  ) : (
                    <ChevronRight size={24} className="text-white flex-shrink-0" />
                  )}
                </button>

                {/* Block Content - Categorías */}
                {isBlockExpanded && (
                  <div className="border-t border-white/10 px-6 py-4 space-y-4">
                    {blockCategories.map(category => {
                      const catRules = grouped[category] || [];
                      const style = CATEGORY_STYLES[category] || {
                        bg: 'bg-zinc-950/30 border-zinc-800/50',
                        border: 'border-zinc-700',
                        label: category
                      };
                      const isCategoryExpanded = expandedCategories.has(category);
                      const categoryState = getCategoryCheckboxState(category);

                      return (
                        <div key={category} className={`border rounded-lg overflow-hidden transition ${style.bg} ${style.border}`}>
                          {/* Category Header */}
                          <button
                            onClick={() => toggleCategoryExpanded(category)}
                            className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Circle size={14} fill="currentColor" className={TEXT_COLORS[category] || 'text-zinc-400'} />
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
                                <h4 className={`font-semibold text-sm ${TEXT_COLORS[category] || 'text-zinc-400'}`}>{style.label}</h4>
                                <p className="text-xs text-zinc-400 mt-0.5">{CATEGORY_DESCRIPTIONS[category] || ''}</p>
                                <p className="text-xs text-zinc-600 mt-1">
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
                            <div className="border-t border-white/10 px-5 py-3">
                              <div className="grid grid-cols-5 gap-3">
                                {catRules.map(rule => (
                                  <div key={rule.id} className="flex flex-col gap-3 p-3 rounded bg-white/5 border border-white/10 hover:border-white/20 transition">
                                    {/* Checkbox y Label */}
                                    <div className="flex items-start gap-2">
                                      <input
                                        type="checkbox"
                                        checked={rule.enabled}
                                        onChange={e => saveRule(rule.id, { enabled: e.target.checked })}
                                        className="w-4 h-4 rounded cursor-pointer flex-shrink-0 mt-0.5 accent-blue-500"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-medium ${rule.enabled ? 'text-white' : 'text-zinc-500'}`}>
                                          {rule.label}
                                        </p>
                                        <p className="text-[10px] text-zinc-600 mt-0.5 font-mono break-all">{rule.check_id}</p>
                                      </div>
                                    </div>

                                    {/* Penalización */}
                                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 text-[11px]">
                                      <span className="text-zinc-500">Penalización:</span>
                                      <div className="flex items-center gap-0.5 ml-auto">
                                        <input
                                          type="number"
                                          value={rule.penalty}
                                          onChange={e => saveRule(rule.id, { penalty: Number(e.target.value) })}
                                          className="w-12 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-xs font-mono text-red-400 text-right focus:outline-none focus:border-red-500 transition"
                                        />
                                        <span className="text-zinc-600">pts</span>
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
