'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, ChevronDown, ChevronRight, AlertTriangle, X, Lock, Globe, FileText, Zap, Bot, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';


const CATEGORY_LABELS: Record<string, string> = {
  technical: 'SEO Técnico',
  crawl: 'Rastreabilidad',
  security: 'Seguridad',
  meta: 'Metadatos',
  headings: 'Encabezados',
  content: 'Contenido',
  images: 'Imágenes',
  links: 'Enlaces',
  performance: 'Rendimiento',
  mobile: 'Mobile',
  a11y: 'Accesibilidad',
  schema: 'Datos Estructurados',
  analytics: 'Analytics',
  local: 'SEO Local',
  compliance: 'Cumplimiento Legal',
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

const CATEGORY_STYLES: Record<string, { bg: string; border: string; textColor: string }> = {
  seo: { bg: 'bg-blue-950/30 border-blue-800/50', border: 'border-blue-700', textColor: 'text-blue-400' },
  headings: { bg: 'bg-yellow-950/30 border-yellow-800/50', border: 'border-yellow-700', textColor: 'text-yellow-400' },
  images: { bg: 'bg-purple-950/30 border-purple-800/50', border: 'border-purple-700', textColor: 'text-purple-400' },
  links: { bg: 'bg-cyan-950/30 border-cyan-800/50', border: 'border-cyan-700', textColor: 'text-cyan-400' },
  technical: { bg: 'bg-red-950/30 border-red-800/50', border: 'border-red-700', textColor: 'text-red-400' },
  performance: { bg: 'bg-orange-950/30 border-orange-800/50', border: 'border-orange-700', textColor: 'text-orange-400' },
  content: { bg: 'bg-green-950/30 border-green-800/50', border: 'border-green-700', textColor: 'text-green-400' },
  a11y: { bg: 'bg-cyan-950/30 border-cyan-800/50', border: 'border-cyan-700', textColor: 'text-cyan-400' },
  local: { bg: 'bg-green-950/30 border-green-800/50', border: 'border-green-700', textColor: 'text-green-400' },
  mobile: { bg: 'bg-yellow-950/30 border-yellow-800/50', border: 'border-yellow-700', textColor: 'text-yellow-400' },
  schema: { bg: 'bg-indigo-950/30 border-indigo-800/50', border: 'border-indigo-700', textColor: 'text-indigo-400' },
  crawl: { bg: 'bg-rose-950/30 border-rose-800/50', border: 'border-rose-700', textColor: 'text-rose-400' },
  compliance: { bg: 'bg-emerald-950/30 border-emerald-800/50', border: 'border-emerald-700', textColor: 'text-emerald-400' },
  analytics: { bg: 'bg-sky-950/30 border-sky-800/50', border: 'border-sky-700', textColor: 'text-sky-400' },
};

export default function AuditoriaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [url, setUrl] = useState(searchParams?.get('url') || '');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [allRules, setAllRules] = useState<any[]>([]);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const { data } = await supabase.from('io_pro_audit_rules').select('check_id, category, enabled').eq('enabled', true);
      setAllRules(data || []);
      // Por defecto, todas las categorías y reglas habilitadas
      if (data && data.length > 0) {
        const cats = new Set(data.map((r: any) => r.category));
        const rules = new Set(data.map((r: any) => r.check_id));
        setSelectedCategories(cats);
        setSelectedRules(rules);
      }
    } catch (err) {
      console.error('Error loading rules:', err);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
        // Eliminar todas las reglas de esa categoría
        setSelectedRules(prevRules => {
          const newRules = new Set(prevRules);
          allRules.filter(r => r.category === category).forEach(r => {
            newRules.delete(r.check_id);
          });
          return newRules;
        });
      } else {
        next.add(category);
        // Añadir todas las reglas habilitadas de esa categoría
        setSelectedRules(prevRules => {
          const newRules = new Set(prevRules);
          allRules.filter(r => r.category === category && r.enabled).forEach(r => {
            newRules.add(r.check_id);
          });
          return newRules;
        });
      }
      return next;
    });
  };

  const toggleRule = (checkId: string, category: string) => {
    setSelectedRules(prev => {
      const next = new Set(prev);
      next.has(checkId) ? next.delete(checkId) : next.add(checkId);
      return next;
    });
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return toast.error('Ingresa una URL');

    setLoading(true);
    try {
      const auditUrl = url.startsWith('http') ? url : `https://${url}`;
      const response = await api.auditUrl(auditUrl);
      // Guardar resultado en localStorage y redirigir a resultados
      localStorage.setItem('audit_result', JSON.stringify(response));
      toast.success('Auditoría completada');
      router.push('/audit-resultados');
    } catch (err: any) {
      // URL inaccesible u otro error → mostrar modal claro (no error técnico)
      setErrorModal(err?.message || 'No se pudo completar la auditoría.');
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(CATEGORY_LABELS);
  const groupedRules = allRules.reduce((acc: any, rule: any) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {});

  return (
    <div className="w-full space-y-4">

      {/* CONTENEDOR ÚNICO: Auditoría SEO + URL + Selecciona qué auditar */}
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">

        {/* Header + URL */}
        <div className="px-6 py-5 border-b border-zinc-800">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Search size={22} className="text-white" /> Auditoría SEO</h1>
          <p className="text-zinc-400 text-sm mt-1 mb-4">Analiza cualquier sitio web</p>
          <form onSubmit={handleAudit} className="w-full">
            <div className="w-full flex flex-row gap-2 items-center">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="example.com o https://example.com"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-5 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white rounded-lg font-medium flex items-center gap-2 transition whitespace-nowrap flex-shrink-0"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                {loading ? 'Auditando...' : 'Auditar'}
              </button>
            </div>
          </form>
        </div>

        {/* Selecciona qué auditar */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <Target size={20} className="text-blue-400" />
            <div>
              <h3 className="font-bold text-white text-lg">Selecciona qué auditar</h3>
              <p className="text-xs text-zinc-500">5 bloques temáticos · Configura tu auditoría</p>
            </div>
          </div>
        </div>
        <div className="w-full px-6 py-4 space-y-3">
              {BLOCKS.map(block => {
            const blockCategories = block.categories;
            const blockRulesCount = allRules.filter(r => blockCategories.includes(r.category)).length;
            const blockSelectedCount = allRules.filter(
              r => blockCategories.includes(r.category) && selectedRules.has(r.check_id)
            ).length;
            const isExpanded = expandedBlocks.has(block.id);

            return (
              <div
                key={block.id}
                className={`border rounded-xl overflow-hidden transition ${block.bgColor} border-white/10`}
              >
                {/* Block Header */}
                <div
                  className="w-full px-6 py-4 flex items-start justify-between hover:bg-white/5 transition cursor-pointer"
                  onClick={() => {
                    setExpandedBlocks(prev => {
                      const next = new Set(prev);
                      next.has(block.id) ? next.delete(block.id) : next.add(block.id);
                      return next;
                    });
                  }}
                >
                  <div className="flex items-start gap-4">
                    <block.icon size={28} className="text-white" />
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-white">{block.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{block.description}</p>
                      <p className="text-xs text-zinc-600 mt-2">
                        <span className="text-blue-400 font-semibold">{blockSelectedCount}/{blockRulesCount}</span> reglas seleccionadas
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      const allCatsInBlock = blockCategories;
                      const allSelected = allCatsInBlock.every(cat => selectedCategories.has(cat));

                      setSelectedCategories(prev => {
                        const next = new Set(prev);
                        allCatsInBlock.forEach(cat => {
                          allSelected ? next.delete(cat) : next.add(cat);
                        });
                        return next;
                      });

                      setSelectedRules(prev => {
                        const next = new Set(prev);
                        allRules.filter(r => allCatsInBlock.includes(r.category)).forEach(r => {
                          allSelected ? next.delete(r.check_id) : next.add(r.check_id);
                        });
                        return next;
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium whitespace-nowrap transition cursor-pointer"
                  >
                    {blockCategories.every(cat => selectedCategories.has(cat)) ? 'Desmarcar todo' : 'Marcar todo'}
                  </div>
                </div>

                {/* Block Content - Categorías */}
                {isExpanded && (
                  <div className="border-t border-white/10 px-6 py-4 space-y-3">
                    {blockCategories.map(cat => {
                      const catRules = groupedRules[cat] || [];
                      const catEnabled = selectedCategories.has(cat);
                      const selectedInCat = catRules.filter(r => selectedRules.has(r.check_id)).length;
                      const style = CATEGORY_STYLES[cat] || { bg: 'bg-zinc-950/30', border: 'border-zinc-800/50', textColor: 'text-zinc-400' };

                      return (
                        <div key={cat} className="space-y-2">
                          {/* Categoría checkbox */}
                          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition">
                            <input
                              type="checkbox"
                              checked={catEnabled}
                              onChange={() => toggleCategory(cat)}
                              className="w-5 h-5 rounded accent-blue-500 cursor-pointer flex-shrink-0"
                            />
                            <div className="flex-1">
                              <p className={`font-semibold text-sm ${style.textColor}`}>{CATEGORY_LABELS[cat]}</p>
                              <p className="text-xs text-zinc-400 mt-0.5">{CATEGORY_DESCRIPTIONS[cat] || ''}</p>
                              <p className="text-xs text-zinc-600 mt-1">{selectedInCat}/{catRules.length} reglas</p>
                            </div>
                          </label>

                          {/* Reglas de la categoría */}
                          {catEnabled && catRules.length > 0 && (
                            <div className="ml-8 flex gap-2 flex-wrap">
                              {catRules.map(rule => (
                                <label
                                  key={rule.check_id}
                                  className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition text-xs"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedRules.has(rule.check_id)}
                                    onChange={() => toggleRule(rule.check_id, cat)}
                                    className="w-4 h-4 rounded accent-blue-500 cursor-pointer flex-shrink-0"
                                  />
                                  <span className="text-zinc-300">{rule.check_id}</span>
                                </label>
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
            </div>
      </div>

      {/* Modal de error (URL inaccesible u otro) */}
      {errorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setErrorModal(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-900/30 rounded-lg flex-shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">No se pudo auditar la URL</h3>
                <p className="text-sm text-zinc-400 mt-1">{errorModal}</p>
                {url && <p className="text-xs text-zinc-600 mt-2 font-mono break-all">{url.startsWith('http') ? url : `https://${url}`}</p>}
              </div>
              <button onClick={() => setErrorModal(null)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setErrorModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
