'use client';

import { useState } from 'react';
import { Search, Loader2, AlertTriangle, CheckCircle, ShoppingCart, FileText, Brain, Building2, MapPin, Grid3x3, Users, XCircle, Tag, LayoutGrid, Home, FolderOpen, Folder, ShoppingBag, PenLine, Newspaper, Phone, Info, Globe, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const SCHEMA_CATEGORIES = {
  TRANSACCIONAL: {
    icon: ShoppingCart,
    title: 'Comercio & Transacciones',
    color: 'from-blue-500 to-blue-600',
    schemas: [
      { type: 'Product', desc: 'Ficha de producto' },
      { type: 'ProductGroup', desc: 'Variantes' },
      { type: 'Offer', desc: 'Precios' },
      { type: 'AggregateOffer', desc: 'Multivendedor' },
    ],
  },
  CONTENIDO: {
    icon: FileText,
    title: 'Contenido & Artículos',
    color: 'from-purple-500 to-purple-600',
    schemas: [
      { type: 'Article', desc: 'Artículos genéricos' },
      { type: 'BlogPosting', desc: 'Blog' },
      { type: 'NewsArticle', desc: 'Noticias' },
      { type: 'TechArticle', desc: 'Documentación' },
    ],
  },
  IA_MAGNET: {
    icon: Brain,
    title: 'Imanes de IA',
    color: 'from-orange-500 to-orange-600',
    schemas: [
      { type: 'FAQPage', desc: 'Preguntas frecuentes' },
      { type: 'HowTo', desc: 'Tutoriales' },
      { type: 'Recipe', desc: 'Recetas' },
      { type: 'AggregateRating', desc: 'Ratings' },
    ],
  },
  ORGANIZACION: {
    icon: Building2,
    title: 'Datos Organizacionales',
    color: 'from-red-500 to-red-600',
    schemas: [
      { type: 'Organization', desc: 'Empresa' },
      { type: 'Corporation', desc: 'Corporación' },
      { type: 'EducationalOrganization', desc: 'Educativa' },
      { type: 'NGO', desc: 'Sin fines lucro' },
    ],
  },
  SEO_LOCAL: {
    icon: MapPin,
    title: 'SEO Local & Negocios',
    color: 'from-green-500 to-green-600',
    schemas: [
      { type: 'LocalBusiness', desc: 'Negocio local' },
      { type: 'Restaurant', desc: 'Restaurante' },
      { type: 'Store', desc: 'Tienda' },
      { type: 'ProfessionalService', desc: 'Servicios' },
    ],
  },
  MULTIMEDIA: {
    icon: Grid3x3,
    title: 'Multimedia',
    color: 'from-cyan-500 to-cyan-600',
    schemas: [
      { type: 'VideoObject', desc: 'Vídeos' },
      { type: 'ImageObject', desc: 'Imágenes' },
      { type: 'AudioObject', desc: 'Audio' },
      { type: 'MediaObject', desc: 'Multimedia' },
    ],
  },
  ESTRUCTURAL: {
    icon: Users,
    title: 'Estructura & Navegación',
    color: 'from-pink-500 to-pink-600',
    schemas: [
      { type: 'BreadcrumbList', desc: 'Migas de pan' },
      { type: 'WebSite', desc: 'Sitio web' },
      { type: 'Person', desc: 'Persona/autor' },
      { type: 'Event', desc: 'Eventos' },
    ],
  },
};

const PAGE_TYPE_CONFIG: Record<string, { label: string; badge: string; color: string; icon: LucideIcon; pageType: string }> = {
  home:       { label: 'Home',       badge: 'bg-cyan-900/50 text-cyan-300 border-cyan-700',       color: 'border-l-cyan-500',   icon: Home,        pageType: 'HOME_PAGE' },
  sección:    { label: 'Sección',    badge: 'bg-blue-900/50 text-blue-300 border-blue-700',       color: 'border-l-blue-500',   icon: FolderOpen,  pageType: 'SECTION_PAGE' },
  subsección: { label: 'Subsección', badge: 'bg-purple-900/50 text-purple-300 border-purple-700', color: 'border-l-purple-500', icon: Folder,      pageType: 'SUBSECTION_PAGE' },
  producto:   { label: 'Producto',   badge: 'bg-green-900/50 text-green-300 border-green-700',    color: 'border-l-green-500',  icon: ShoppingBag, pageType: 'PRODUCT_PAGE' },
  blog:       { label: 'Blog',       badge: 'bg-orange-900/50 text-orange-300 border-orange-700', color: 'border-l-orange-500', icon: PenLine,     pageType: 'BLOG_PAGE' },
  artículo:   { label: 'Artículo',   badge: 'bg-rose-900/50 text-rose-300 border-rose-700',       color: 'border-l-rose-500',   icon: Newspaper,   pageType: 'ARTICLE_PAGE' },
  contacto:   { label: 'Contacto',   badge: 'bg-yellow-900/50 text-yellow-300 border-yellow-700', color: 'border-l-yellow-500', icon: Phone,       pageType: 'CONTACT_PAGE' },
  about:      { label: 'About',      badge: 'bg-pink-900/50 text-pink-300 border-pink-700',       color: 'border-l-pink-500',   icon: Info,        pageType: 'ABOUT_PAGE' },
};

const PRIORITY_BADGE: Record<string, string> = {
  CRITICAL: 'bg-red-900/50 text-red-300 border border-red-700',
  HIGH:     'bg-orange-900/50 text-orange-300 border border-orange-700',
  MEDIUM:   'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
  LOW:      'bg-zinc-800 text-zinc-400 border border-zinc-600',
};

export default function SchemaAnalyzerProPage() {
  const [url, setUrl] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error('Ingresa una URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4006/api';

      // Si el usuario seleccionó tipo, lo mandamos para que el backend no auto-detecte
      const body: any = { url: url.trim() };
      if (selectedType) {
        const config = PAGE_TYPE_CONFIG[selectedType];
        body.manualPageType = config.pageType;
        body.manualTipologia = selectedType;
      }

      const response = await fetch(`${apiUrl}/schema-analyzer-pro/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      toast.success('Análisis completado');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url);
      toast.success('URL copiada');
    }
  };

  const bgColorMap: {[key: string]: string} = {
    TRANSACCIONAL: 'bg-blue-950/40 border-blue-800/30',
    CONTENIDO: 'bg-purple-950/40 border-purple-800/30',
    IA_MAGNET: 'bg-orange-950/40 border-orange-800/30',
    ORGANIZACION: 'bg-red-950/40 border-red-800/30',
    SEO_LOCAL: 'bg-green-950/40 border-green-800/30',
    MULTIMEDIA: 'bg-cyan-950/40 border-cyan-800/30',
    ESTRUCTURAL: 'bg-pink-950/40 border-pink-800/30',
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Schema.org Analyzer PRO</h1>
          <p className="text-gray-400">Análisis avanzado de 30+ entidades Schema.org</p>
        </div>

        {/* Selector de tipo de página */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-500 text-xs font-medium">Tipo de página:</span>
            {Object.entries(PAGE_TYPE_CONFIG).map(([key, config]) => {
              const isSelected = selectedType === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedType(isSelected ? null : key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? `${config.badge} ring-2 ring-offset-2 ring-offset-zinc-950 ring-current`
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <config.icon size={14} />
                  {config.label}
                </button>
              );
            })}
            {selectedType && (
              <button
                onClick={() => setSelectedType(null)}
                className="text-zinc-600 hover:text-zinc-400 text-xs ml-1"
              >
                × auto-detectar
              </button>
            )}
          </div>
          {!selectedType && (
            <p className="text-zinc-600 text-xs">Sin selección → se auto-detecta por URL y HTML</p>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://ejemplo.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 text-white"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            {loading ? 'Analizando...' : 'Analizar'}
          </button>
        </div>

        {/* Results - Full Width */}
        {result && (() => {
          const tipologia: string = result.audit?.tipologia_detectada || result.recommendations?.pageType?.toLowerCase()?.replace('_page', '') || 'genérica';
          const pageConfig = PAGE_TYPE_CONFIG[tipologia] || { label: tipologia, badge: 'bg-zinc-800 text-zinc-300 border-zinc-600', color: 'border-l-zinc-500', icon: Globe };

          // Schemas encontrados en la página
          const schemasFound: string[] = result.schemasFound || [];
          // Must-have para este tipo de página
          const mustHave: string[] = result.audit?.schema_review?.esquemas_must_have || [];
          // Schemas faltantes = must-have que NO están en schemasFound
          const missing: string[] = mustHave.filter((s: string) => !schemasFound.includes(s));
          // Schemas presentes del must-have
          const correct: string[] = mustHave.filter((s: string) => schemasFound.includes(s));
          // Schemas adicionales encontrados (no son must-have pero están)
          const extra: string[] = schemasFound.filter((s: string) => !mustHave.includes(s));
          // Recomendaciones (faltan pero no son must-have)
          const recommended: any[] = result.recommendations?.recommendations || [];

          const score = result.scores?.average || 0;
          const scoreColor = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400';

          return (
            <div className="space-y-5">

              {/* === HEADER: Tipo de Página + Score === */}
              <div className={`bg-zinc-800 border border-zinc-700 border-l-4 ${pageConfig.color} rounded-lg p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${pageConfig.badge}`}>
                        <pageConfig.icon size={14} />
                        Página detectada: <strong>{pageConfig.label}</strong>
                      </span>
                      <span className="text-zinc-500 text-xs">|</span>
                      <span className="text-zinc-400 text-sm truncate max-w-xs">{result.url}</span>
                      <button onClick={handleCopyUrl} className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-0.5 border border-zinc-700 rounded">
                        copiar
                      </button>
                    </div>
                    <div className="flex gap-4 text-sm text-zinc-400">
                      <span><strong className="text-green-400">{correct.length}</strong> schemas correctos</span>
                      <span><strong className="text-red-400">{missing.length}</strong> schemas faltantes</span>
                      {extra.length > 0 && <span><strong className="text-blue-400">{extra.length}</strong> adicionales</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-5xl font-bold ${scoreColor}`}>{score}</div>
                    <div className="text-zinc-500 text-xs mt-0.5">score</div>
                  </div>
                </div>
              </div>

              {/* === DOS COLUMNAS: Correctos | Faltantes === */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* COLUMNA IZQUIERDA: Schemas correctos */}
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
                  <div className="bg-green-950/40 border-b border-green-900/50 px-4 py-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <h3 className="text-green-300 font-semibold text-sm">
                      Schemas presentes {correct.length > 0 && `(${correct.length})`}
                    </h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {correct.length === 0 && (
                      <p className="text-zinc-500 text-xs p-2">Ningún schema obligatorio detectado</p>
                    )}
                    {correct.map((type: string) => {
                      const schema = result.schemas?.find((s: any) => s.type === type);
                      const schemaScore = schema?.score || 0;
                      const schemaScoreColor = schemaScore >= 70 ? 'text-green-400' : schemaScore >= 40 ? 'text-yellow-400' : 'text-red-400';
                      return (
                        <div key={type} className="flex items-center justify-between bg-green-950/20 border border-green-900/30 rounded p-2.5">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-500 shrink-0" />
                            <span className="text-white text-sm font-medium">{type}</span>
                          </div>
                          {schema && (
                            <span className={`text-xs font-bold ${schemaScoreColor}`}>{schemaScore}</span>
                          )}
                        </div>
                      );
                    })}
                    {extra.length > 0 && (
                      <>
                        <div className="border-t border-zinc-800 pt-2 mt-2">
                          <p className="text-zinc-500 text-xs mb-2 px-1">Adicionales (no obligatorios)</p>
                          {extra.map((type: string) => {
                            const schema = result.schemas?.find((s: any) => s.type === type);
                            const schemaScore = schema?.score || 0;
                            return (
                              <div key={type} className="flex items-center justify-between bg-blue-950/20 border border-blue-900/30 rounded p-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <Tag size={12} className="text-blue-400 shrink-0" />
                                  <span className="text-zinc-300 text-sm">{type}</span>
                                </div>
                                {schema && <span className="text-xs text-blue-400 font-bold">{schemaScore}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* COLUMNA DERECHA: Schemas faltantes */}
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
                  <div className="bg-red-950/40 border-b border-red-900/50 px-4 py-3 flex items-center gap-2">
                    <XCircle size={16} className="text-red-400" />
                    <h3 className="text-red-300 font-semibold text-sm">
                      Schemas faltantes {missing.length > 0 && `(${missing.length})`}
                    </h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {missing.length === 0 && recommended.length === 0 && (
                      <div className="flex items-center gap-2 p-3 text-green-300 text-sm">
                        <CheckCircle size={16} className="text-green-400" />
                        ¡Todo correcto para este tipo de página!
                      </div>
                    )}
                    {/* Must-have faltantes */}
                    {missing.map((type: string) => (
                      <div key={type} className="bg-red-950/20 border border-red-900/40 rounded p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle size={14} className="text-red-400 shrink-0" />
                            <span className="text-white text-sm font-medium">{type}</span>
                          </div>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-800">OBLIGATORIO</span>
                        </div>
                        <p className="text-red-300/70 text-xs mt-1 ml-5">Requerido para este tipo de página</p>
                      </div>
                    ))}
                    {/* Recomendaciones por prioridad */}
                    {recommended.length > 0 && (
                      <>
                        {(missing.length > 0) && <div className="border-t border-zinc-800 pt-2 mt-1"><p className="text-zinc-500 text-xs mb-2 px-1">Recomendados</p></div>}
                        {recommended.map((rec: any, idx: number) => (
                          <div key={idx} className="bg-zinc-800/60 border border-zinc-700 rounded p-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white text-sm font-medium">{rec.type}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_BADGE[rec.priority] || PRIORITY_BADGE.LOW}`}>{rec.priority}</span>
                            </div>
                            <p className="text-zinc-400 text-xs">{rec.reason}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* === SCHEMA DETAILS: propiedades presentes/faltantes === */}
              {result.schemas && result.schemas.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
                  <div className="border-b border-zinc-700 px-4 py-3 flex items-center gap-2">
                    <LayoutGrid size={16} className="text-zinc-400" />
                    <h3 className="text-zinc-200 font-semibold text-sm">Detalle de propiedades por schema</h3>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {result.schemas.map((schema: any, idx: number) => {
                      const missingProps: string[] = schema.validation?.missing || [];
                      const presentProps: string[] = schema.validation?.present || [];
                      const schScore = schema.score || 0;
                      const schScoreColor = schScore >= 70 ? 'text-green-400' : schScore >= 40 ? 'text-yellow-400' : 'text-red-400';
                      return (
                        <div key={idx} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">{schema.type}</span>
                            <span className={`text-lg font-bold ${schScoreColor}`}>{schScore}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {presentProps.map((p: string) => (
                              <span key={p} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs bg-green-950/40 text-green-300 border border-green-900/50">
                                <CheckCircle size={10} /> {p}
                              </span>
                            ))}
                            {missingProps.map((p: string) => (
                              <span key={p} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs bg-red-950/40 text-red-300 border border-red-900/50">
                                <XCircle size={10} /> {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {!result && !loading && !error && (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 text-center">
            <p className="text-blue-300 text-sm">
              Ingresa una URL para analizar sus esquemas Schema.org
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} className="text-red-400 mt-0.5" />
              <div>
                <h3 className="text-red-300 font-semibold">Error al analizar</h3>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Schema Reference - Always Below */}
        <div className="border-t border-zinc-700 pt-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BookOpen size={18} className="text-white" /> Entidades Schema.org Disponibles</h2>
          <div className="space-y-6">
            {Object.entries(SCHEMA_CATEGORIES).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <div key={key} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-r ${category.color} p-2 rounded-lg`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ml-11">
                    {category.schemas.map((schema) => (
                      <div
                        key={schema.type}
                        className={`${bgColorMap[key]} border rounded-lg p-3 hover:border-opacity-100 transition`}
                      >
                        <div className="font-semibold text-white text-sm">{schema.type}</div>
                        <div className="text-gray-400 text-xs mt-1">{schema.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
