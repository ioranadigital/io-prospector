'use client';
import { useState } from 'react';
import {
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  ShoppingCart,
  FileText,
  Brain,
  Building2,
  MapPin,
  Grid3x3,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ARCHITECTURE_INFO = {
  title: 'Motor de Análisis Schema.org Pro',
  version: '1.0.0',
  description: 'Sistema experto de extracción y análisis de 50+ entidades Schema.org con validación jerárquica',
  features: [
    { icon: '⚡', text: 'Extracción inteligente con @graph flatten automático' },
    { icon: '🔍', text: '30+ patrones de validación SEO/GEO' },
    { icon: '📊', text: 'Detección de riesgos E-E-A-T y NAP' },
    { icon: '🎯', text: 'Soporte completo de arquitectura jerárquica' },
  ],
};

const SCHEMA_CATEGORIES = {
  TRANSACCIONAL: {
    icon: ShoppingCart,
    title: 'Comercio & Transacciones',
    color: 'from-blue-500 to-blue-600',
    description: 'Estructuras para e-commerce, productos y ofertas',
    schemas: [
      { type: 'Product', desc: 'Ficha de producto individual' },
      { type: 'ProductGroup', desc: 'Variantes (colores, tallas, SKU)' },
      { type: 'Offer', desc: 'Estructura de precios y disponibilidad' },
      { type: 'AggregateOffer', desc: 'Agregación multivendedor' },
    ],
  },
  CONTENIDO: {
    icon: FileText,
    title: 'Contenido & Artículos',
    description: 'Estructuras para contenido editorial con validación E-E-A-T',
    color: 'from-purple-500 to-purple-600',
    schemas: [
      { type: 'Article', desc: 'Artículos genéricos' },
      { type: 'BlogPosting', desc: 'Entradas de blog - Valida autoría y frescura' },
      { type: 'NewsArticle', desc: 'Artículos de noticias - Para Google News' },
      { type: 'TechArticle', desc: 'Documentación técnica y guías' },
      { type: 'APIReference', desc: 'Documentación de APIs (SaaS)' },
      { type: 'MedicalWebPage', desc: 'Contenido médico certificado (YMYL)' },
    ],
  },
  IA_MAGNET: {
    icon: Brain,
    title: 'Imanes de IA & Featured Snippets',
    description: 'Dominan búsquedas conversacionales y snippets enriquecidos',
    color: 'from-orange-500 to-orange-600',
    schemas: [
      { type: 'FAQPage', desc: 'Preguntas frecuentes - Genera snippets' },
      { type: 'HowTo', desc: 'Tutoriales paso a paso' },
      { type: 'Recipe', desc: 'Recetas de cocina' },
      { type: 'Review', desc: 'Reseñas individuales' },
      { type: 'AggregateRating', desc: 'Ratings agregados - Muestra estrellas' },
      { type: 'QAPage', desc: 'Comunidades de Q&A' },
      { type: 'JobPosting', desc: 'Ofertas de empleo' },
      { type: 'Course', desc: 'Cursos y infoproductos' },
    ],
  },
  ORGANIZACION: {
    icon: Building2,
    title: 'Datos Organizacionales',
    description: 'Identidad corporativa e información de empresa',
    color: 'from-red-500 to-red-600',
    schemas: [
      { type: 'Organization', desc: 'Empresa genérica' },
      { type: 'Corporation', desc: 'Grandes corporaciones S.A./S.L.' },
      { type: 'EducationalOrganization', desc: 'Escuelas y universidades' },
      { type: 'NGO', desc: 'Organizaciones sin fines de lucro' },
    ],
  },
  SEO_LOCAL: {
    icon: MapPin,
    title: 'SEO Local & Negocios',
    description: 'Localización física, NAP y búsquedas geográficas',
    color: 'from-green-500 to-green-600',
    schemas: [
      { type: 'LocalBusiness', desc: 'Negocios con ubicación física' },
      { type: 'Restaurant', desc: 'Restaurantes y gastrodocumentos' },
      { type: 'Store', desc: 'Tiendas y retail' },
      { type: 'ProfessionalService', desc: 'Consultorías y servicios' },
      { type: 'MedicalBusiness', desc: 'Clínicas y servicios médicos (YMYL)' },
      { type: 'AutomotiveBusiness', desc: 'Talleres y concesionarios' },
      { type: 'HomeAndConstructionBusiness', desc: 'Reformas y construcción' },
    ],
  },
  MULTIMEDIA: {
    icon: Grid3x3,
    title: 'Indexación Multimedia',
    description: 'Optimización de imágenes, vídeos y audio',
    color: 'from-cyan-500 to-cyan-600',
    schemas: [
      { type: 'VideoObject', desc: 'Vídeos de YouTube/Vimeo/nativos' },
      { type: 'ImageObject', desc: 'Infografías e imágenes' },
      { type: 'AudioObject', desc: 'Podcasts y archivos de audio' },
      { type: 'MediaObject', desc: 'Multimedia genérico' },
    ],
  },
  ESTRUCTURAL: {
    icon: Users,
    title: 'Estructura & Navegación',
    description: 'Elementos base de infraestructura de rastreo',
    color: 'from-pink-500 to-pink-600',
    schemas: [
      { type: 'BreadcrumbList', desc: 'Migas de pan - Mejora navegación SERP' },
      { type: 'WebSite', desc: 'Datos del sitio + SearchAction interno' },
      { type: 'Person', desc: 'Datos de autores y expertos' },
      { type: 'Event', desc: 'Eventos y conferencias' },
    ],
  },
};

const SEVERITY_COLORS = {
  CRITICAL: {
    bg: 'bg-red-900/20',
    border: 'border-red-700',
    icon: '🚨',
    text: 'text-red-300',
  },
  HIGH: {
    bg: 'bg-orange-900/20',
    border: 'border-orange-700',
    icon: '⚠️',
    text: 'text-orange-300',
  },
  MEDIUM: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-700',
    icon: '💡',
    text: 'text-yellow-300',
  },
  LOW: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-700',
    icon: 'ℹ️',
    text: 'text-blue-300',
  },
};

// Tipo para esquemas seleccionados
interface SelectedSchema {
  id: string;
  type: string;
  category: string;
}

export default function SchemaAnalyzerProPage() {
  const [url, setUrl] = useState('');
  const [selectedSchemas, setSelectedSchemas] = useState<SelectedSchema[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // MANEJADORES DE SELECCIÓN MÚLTIPLE
  // ═══════════════════════════════════════════════════════════════

  const handleSelectSchema = (type: string, category: string) => {
    // Verificar si ya existe ANTES de actualizar state
    const exists = selectedSchemas.some((s) => s.type === type);

    if (exists) {
      // Remover si ya existe (toggle)
      setSelectedSchemas((prev) => prev.filter((s) => s.type !== type));
      toast.success(`✗ ${type} removido`);
    } else {
      // Agregar nuevo
      const newSchema: SelectedSchema = {
        id: `${category}-${type}`,
        type,
        category,
      };
      setSelectedSchemas((prev) => [...prev, newSchema]);
      toast.success(`✓ ${type} agregado`);
    }
  };

  const handleRemoveSchema = (type: string) => {
    setSelectedSchemas((prev) => prev.filter((s) => s.type !== type));
    toast.success(`✗ ${type} removido del grafo`);
  };

  const handleClearAllSchemas = () => {
    setSelectedSchemas([]);
    toast.success('Configuración limpiada');
  };

  // ═══════════════════════════════════════════════════════════════
  // ANALIZAR CON MÚLTIPLES ESQUEMAS
  // ═══════════════════════════════════════════════════════════════

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
      const body: any = { url: url.trim() };

      // Si hay esquemas seleccionados, incluirlos en el payload
      if (selectedSchemas.length > 0) {
        body.expectedSchemas = selectedSchemas.map((s) => ({
          type: s.type,
          category: s.category,
        }));
        body.validationMode = 'MULTI_SCHEMA_CHECK';
      } else {
        body.validationMode = 'ANALYTICAL';
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
      toast.success('✅ Análisis completado');
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

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-500" size={32} />
            <div>
              <h1 className="text-4xl font-bold text-white">Motor de Análisis Schema.org Pro</h1>
              <p className="text-gray-400">
                Sistema experto de extracción y análisis de 50+ entidades Schema.org con validación jerárquica
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://ejemplo.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center gap-2 text-white transition"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            {loading ? 'Analizando...' : 'Analizar'}
          </button>
        </div>

        {/* NUEVA SECCIÓN: Configuración del Grafo Esperado */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-700/30 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={18} className="text-indigo-400" />
              <h3 className="text-white font-semibold">Configuración del Grafo Esperado</h3>
              {selectedSchemas.length > 0 && (
                <span className="ml-auto text-xs font-bold bg-indigo-600 px-2.5 py-1 rounded-full text-white">
                  {selectedSchemas.length} esquema{selectedSchemas.length !== 1 ? 's' : ''} seleccionado{selectedSchemas.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {selectedSchemas.length === 0 ? (
              // PLACEHOLDER: Cuando no hay esquemas seleccionados
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  Selecciona las entidades abajo para diseñar el grafo de esta URL
                </p>
              </div>
            ) : (
              // CONTENEDOR DE BADGES: Cuando hay esquemas seleccionados
              <div className="space-y-3">
                {/* Esquemas como mini-tarjetas/badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedSchemas.map((schema) => (
                    <div
                      key={schema.id}
                      className="bg-indigo-600/20 border border-indigo-500/50 rounded-lg px-3 py-2 flex items-center gap-2 group hover:border-indigo-400/75 transition"
                    >
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">{schema.type}</div>
                        <div className="text-indigo-300 text-xs">{schema.category}</div>
                      </div>
                      {/* Botón X para eliminar */}
                      <button
                        onClick={() => handleRemoveSchema(schema.type)}
                        className="ml-1 text-indigo-400 hover:text-indigo-200 hover:bg-indigo-600/40 rounded-full p-1 transition"
                        title={`Remover ${schema.type}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Botón para limpiar todo */}
                <div className="flex justify-end pt-2 border-t border-indigo-700/30">
                  <button
                    onClick={handleClearAllSchemas}
                    className="text-indigo-400 hover:text-indigo-200 text-xs px-3 py-1.5 hover:bg-indigo-600/20 rounded transition"
                  >
                    Limpiar configuración
                  </button>
                </div>
              </div>
            )}

            {/* Información contexto */}
            <p className="text-indigo-300 text-xs mt-3 pt-3 border-t border-indigo-700/30">
              💡 Los esquemas seleccionados se usarán para auditoría cruzada. El Score se penalizará si falta alguno.
            </p>
          </div>

          {/* Schema Selectors Grid - 5 Columnas */}
          <div className="space-y-3">
            <div>
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="text-blue-400">📋</span>
                Selecciona qué estructuras esperas auditar
              </h3>
              <p className="text-gray-400 text-xs mb-4">
                Haz clic en cualquier esquema para agregarlo. Los seleccionados aparecerán en el grafo esperado arriba.
              </p>
            </div>

            {/* Grid de 5 Columnas - Todos los Esquemas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {Object.entries(SCHEMA_CATEGORIES).flatMap(([categoryKey, category]: any) =>
                category.schemas.map((schema: any) => {
                  const isSelected = selectedSchemas.some((s) => s.type === schema.type);
                  return (
                    <button
                      key={schema.type}
                      onClick={() => handleSelectSchema(schema.type, categoryKey)}
                      className={`relative p-3 rounded-lg text-sm transition transform hover:scale-105 ${
                        isSelected
                          ? 'bg-blue-600 border-2 border-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30'
                          : 'bg-zinc-800 border border-zinc-700 text-gray-300 hover:border-blue-500 hover:bg-zinc-700/50'
                      }`}
                      title={schema.desc}
                    >
                      <div className="font-medium text-center">{schema.type}</div>
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Main Score */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Score General</h3>
                  <p className="text-gray-400 text-sm">Completitud de datos estructurados</p>
                </div>
                <div
                  className={`text-6xl font-bold ${
                    (result.scores?.average || 0) >= 80
                      ? 'text-green-400'
                      : (result.scores?.average || 0) >= 60
                      ? 'text-yellow-400'
                      : (result.scores?.average || 0) >= 40
                      ? 'text-orange-400'
                      : 'text-red-400'
                  }`}
                >
                  {result.scores?.average || 0}
                </div>
              </div>

              {/* URL */}
              <div className="mt-4 pt-4 border-t border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-400 text-sm">URL:</span>
                  <span className="text-blue-400 text-sm truncate">{result.url}</span>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={handleCopyUrl}
                    className="p-1 hover:bg-zinc-700 rounded transition"
                    title="Copiar URL"
                  >
                    <Copy size={16} className="text-gray-400" />
                  </button>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-zinc-700 rounded transition"
                    title="Abrir en nueva pestaña"
                  >
                    <ExternalLink size={16} className="text-gray-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            {result.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-400">
                    {result.summary?.totalSchemas || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Schemas totales</div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">
                    {result.summary?.validSchemas || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Válidos</div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-400">
                    {result.summary?.primaryType || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Tipo principal</div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div
                    className={`text-3xl font-bold ${
                      (result.alertsSummary?.critical || 0) > 0
                        ? 'text-red-400'
                        : 'text-green-400'
                    }`}
                  >
                    {result.alertsSummary?.critical || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Alertas críticas</div>
                </div>
              </div>
            )}

            {/* Schemas por Categoría */}
            {result.byCategory && result.byCategory && Object.keys(result.byCategory || {}).length > 0 && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Esquemas por Categoría</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(result.byCategory || {}).map(([category, schemas]: any) => (
                    <div
                      key={category}
                      className="bg-zinc-700/30 rounded-lg p-4 border border-zinc-600"
                    >
                      <div className="text-sm font-semibold text-white mb-2">
                        {category}
                      </div>
                      <div className="space-y-1">
                        {Array.isArray(schemas) && schemas.map((schema: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <div className="text-gray-300">{schema?.type || 'Unknown'}</div>
                            <div className="text-gray-500">
                              Score:{' '}
                              <span
                                className={
                                  (schema?.score || 0) >= 80
                                    ? 'text-green-300'
                                    : (schema?.score || 0) >= 60
                                    ? 'text-yellow-300'
                                    : 'text-red-300'
                                }
                              >
                                {schema?.score || 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs Generated */}
            {result.faqs && result.faqs.length > 0 && (
              <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">
                      ❓ FAQs Generadas por Tipo de Página
                    </h3>
                    <p className="text-indigo-300 text-xs mt-1">
                      Preguntas frecuentes optimizadas para <span className="font-semibold">{result.recommendations?.pageType?.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-400">
                      {result.faqs.length}
                    </div>
                    <div className="text-xs text-indigo-300">FAQs listas</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.faqs.map((faq: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-indigo-900/30 rounded-lg p-4 border border-indigo-700/30 hover:border-indigo-600/50 transition"
                    >
                      <details className="cursor-pointer">
                        <summary className="font-semibold text-indigo-300 hover:text-indigo-200 transition">
                          {idx + 1}. {faq.pregunta}
                        </summary>
                        <div className="mt-3 text-sm text-gray-300 leading-relaxed">
                          {faq.respuesta}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              const schemaJSON = JSON.stringify(
                                {
                                  '@context': 'https://schema.org',
                                  '@type': 'FAQPage',
                                  mainEntity: result.faqs.map((q: any) => ({
                                    '@type': 'Question',
                                    name: q.pregunta,
                                    acceptedAnswer: {
                                      '@type': 'Answer',
                                      text: q.respuesta,
                                    },
                                  })),
                                },
                                null,
                                2
                              );
                              navigator.clipboard.writeText(schemaJSON);
                              toast.success('Schema FAQPage copiado al portapapeles');
                            }}
                            className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-2 py-1 rounded transition"
                          >
                            Copiar Schema
                          </button>
                          <button
                            onClick={() => {
                              const markdownText = `## Preguntas Frecuentes\n\n${result.faqs
                                .map((q: any) => `**${q.pregunta}**\n\n${q.respuesta}`)
                                .join('\n\n')}`;
                              navigator.clipboard.writeText(markdownText);
                              toast.success('FAQs en Markdown copiadas');
                            }}
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition"
                          >
                            Copiar Markdown
                          </button>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-indigo-900/50 rounded border border-indigo-700/50">
                  <p className="text-xs text-indigo-300">
                    💡 <strong>Tip:</strong> Usa el botón "Copiar Schema" para obtener el JSON-LD validado que puedes agregar a tu página HTML.
                    O copia el Markdown para integrar estas FAQs directamente en tu contenido.
                  </p>
                </div>
              </div>
            )}

            {/* Audit Report */}
            {result.audit && (
              <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-700/50 rounded-lg p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  🔍 Motor de Auditoría Técnica/Semántica
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* FAQs Audit */}
                  <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/30">
                    <h4 className="text-emerald-300 font-semibold mb-2 flex items-center gap-2">
                      ❓ Auditoría de FAQs
                    </h4>
                    <p className="text-xs text-gray-300 mb-3">
                      <strong>Tipología:</strong> {result.audit.tipologia_detectada}
                    </p>
                    {result.audit.faqs_review.requiere_faqs ? (
                      <>
                        <p className="text-xs text-emerald-300 mb-3 font-semibold">
                          ✅ FAQs Requeridas: SÍ
                        </p>
                        <p className="text-xs text-gray-400 mb-3 bg-emerald-900/30 rounded p-2">
                          <strong>Enfoque Semántico:</strong> {result.audit.faqs_review.enfoque_semantico_obligatorio}
                        </p>
                        <div className="space-y-2">
                          {result.audit.faqs_review.faqs_required.map((faq: any, idx: number) => (
                            <div key={idx} className="bg-emerald-950/40 rounded p-2 text-xs">
                              <p className="text-emerald-300 font-semibold">
                                #{faq.numero} - {faq.intencion_pregunta}
                              </p>
                              <p className="text-gray-400 mt-1">
                                Keywords: {faq.keywords_del_cliente_a_incluir.join(', ')}
                              </p>
                              <p className="text-gray-500 mt-1">{faq.nivel_seo}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-amber-300">
                        ⛔ FAQs Excluidas - Tipología prohibida para esta página
                      </p>
                    )}
                  </div>

                  {/* Schema Audit */}
                  <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-700/30">
                    <h4 className="text-teal-300 font-semibold mb-2 flex items-center gap-2">
                      📋 Auditoría de Schemas
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Schemas Requeridos:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.audit.schema_review.esquemas_must_have.map((schema: string, idx: number) => (
                            <span key={idx} className="bg-teal-700 text-teal-100 text-xs px-2 py-1 rounded">
                              {schema}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Encontrados:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.audit.schema_review.esquemas_encontrados.map((schema: string, idx: number) => (
                            <span key={idx} className="bg-green-700 text-green-100 text-xs px-2 py-1 rounded">
                              ✓ {schema}
                            </span>
                          ))}
                        </div>
                      </div>
                      {result.audit.schema_review.esquemas_faltantes.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Faltantes (Crítico):</p>
                          <div className="flex flex-wrap gap-1">
                            {result.audit.schema_review.esquemas_faltantes.map((schema: string, idx: number) => (
                              <span key={idx} className="bg-red-700 text-red-100 text-xs px-2 py-1 rounded">
                                ⚠️ {schema}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <details className="mt-3 pt-3 border-t border-teal-700/30 cursor-pointer">
                        <summary className="text-xs text-teal-300 font-semibold">
                          Ver Plantilla JSON-LD
                        </summary>
                        <div className="mt-2 text-xs bg-teal-950/50 rounded p-2 font-mono overflow-auto max-h-48">
                          <pre>{JSON.stringify(result.audit.schema_review.schema_json_ld_template, null, 2)}</pre>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.recommendations?.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">
                      📋 Schemas Recomendados
                    </h3>
                    <p className="text-amber-300 text-xs mt-1">
                      Tipo de página: <span className="font-semibold">{result.recommendations.pageType?.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">
                      {result.recommendations.recommendations.length}
                    </div>
                    <div className="text-xs text-amber-300">faltantes</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.recommendations.recommendations.map((rec: any, idx: number) => {
                    const priorityColor = {
                      CRITICAL: 'bg-red-500/20 border-red-700 text-red-300',
                      HIGH: 'bg-orange-500/20 border-orange-700 text-orange-300',
                      MEDIUM: 'bg-yellow-500/20 border-yellow-700 text-yellow-300',
                      LOW: 'bg-blue-500/20 border-blue-700 text-blue-300',
                    }[rec.priority] || 'bg-gray-500/20 border-gray-700 text-gray-300';

                    return (
                      <div
                        key={idx}
                        className={`rounded-lg p-3 border ${priorityColor}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm">
                              {rec.type}
                            </h5>
                            <p className="text-xs mt-1 opacity-90">
                              {rec.reason}
                            </p>
                            {rec.fields && rec.fields.length > 0 && (
                              <div className="text-xs mt-2 opacity-75">
                                Campos: <span className="font-mono">{rec.fields.join(', ')}</span>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2`}>
                            {rec.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Alerts */}
            {result.alerts && result.alerts.length > 0 && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">
                  Alertas ({result.alertsSummary?.total || result.alerts.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {result.alerts.map((alert: any, idx: number) => {
                    const colors = SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS];
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg p-4 border ${colors.bg} ${colors.border}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl mt-0.5">{colors.icon}</span>
                          <div className="flex-1">
                            <div className={`font-semibold text-sm ${colors.text}`}>
                              [{alert.schemaType}] {alert.message}
                            </div>
                            <div className="text-gray-300 text-sm mt-1">
                              {alert.impact}
                            </div>
                            <div className="text-xs text-gray-400 mt-2 bg-zinc-900/50 rounded p-2">
                              💡 {alert.recommendation}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Alerts */}
            {result.alerts && result.alerts.length === 0 && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
                <CheckCircle size={32} className="mx-auto text-green-400 mb-3" />
                <h3 className="text-white font-semibold mb-1">¡Perfecto!</h3>
                <p className="text-green-300 text-sm">
                  Tu Schema.org está completamente optimizado
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="space-y-8">
            {/* Schema Categories */}
            <div className="space-y-8">
              {Object.entries(SCHEMA_CATEGORIES).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`bg-gradient-to-r ${category.color} p-2.5 rounded-lg flex-shrink-0`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-white">{category.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{category.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {category.schemas.map((schema) => (
                        <div
                          key={schema.type}
                          className="bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 rounded-lg p-3 transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:bg-zinc-800"
                        >
                          <h5 className="font-semibold text-white text-xs mb-1">
                            {schema.type}
                          </h5>
                          <p className="text-gray-400 text-[11px] leading-tight">
                            {schema.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 text-center">
              <p className="text-blue-300 text-sm">
                💡 Ingresa cualquier URL en la barra de búsqueda para analizar automáticamente todos los esquemas que contiene
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
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
      </div>
    </div>
  );
}
