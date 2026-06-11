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
} from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function SchemaAnalyzerProPage() {
  const [url, setUrl] = useState('');
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
      const response = await fetch('/api/schema-analyzer-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-500" size={32} />
            <div>
              <h1 className="text-4xl font-bold text-white">Schema.org Analyzer PRO</h1>
              <p className="text-gray-400">
                Análisis avanzado con 30+ tipos de entidades, validación inteligente y alertas contextualizadas
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
                    result.scores.average >= 80
                      ? 'text-green-400'
                      : result.scores.average >= 60
                      ? 'text-yellow-400'
                      : result.scores.average >= 40
                      ? 'text-orange-400'
                      : 'text-red-400'
                  }`}
                >
                  {result.scores.average}
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
                    {result.summary.totalSchemas}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Schemas totales</div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">
                    {result.summary.validSchemas}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Válidos</div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-400">
                    {result.summary.primaryType}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Tipo principal</div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div
                    className={`text-3xl font-bold ${
                      result.alertsSummary.critical > 0
                        ? 'text-red-400'
                        : 'text-green-400'
                    }`}
                  >
                    {result.alertsSummary.critical}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Alertas críticas</div>
                </div>
              </div>
            )}

            {/* Schemas por Categoría */}
            {result.byCategory && Object.keys(result.byCategory).length > 0 && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Esquemas por Categoría</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(result.byCategory).map(([category, schemas]: any) => (
                    <div
                      key={category}
                      className="bg-zinc-700/30 rounded-lg p-4 border border-zinc-600"
                    >
                      <div className="text-sm font-semibold text-white mb-2">
                        {category}
                      </div>
                      <div className="space-y-1">
                        {schemas.map((schema: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <div className="text-gray-300">{schema.type}</div>
                            <div className="text-gray-500">
                              Score:{' '}
                              <span
                                className={
                                  schema.score >= 80
                                    ? 'text-green-300'
                                    : schema.score >= 60
                                    ? 'text-yellow-300'
                                    : 'text-red-300'
                                }
                              >
                                {schema.score}%
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

            {/* Alerts */}
            {result.alerts && result.alerts.length > 0 && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">
                  Alertas ({result.alertsSummary.total})
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
          <div className="text-center py-20">
            <Zap size={48} className="mx-auto text-yellow-500 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Análisis Schema.org Avanzado
            </h3>
            <p className="text-gray-500 mb-6">
              Detecta, valida y optimiza 30+ tipos de datos estructurados
            </p>
            <div className="text-gray-600 text-sm space-y-1">
              <p>✓ Product, Article, LocalBusiness, FAQPage y más</p>
              <p>✓ Validación de propiedades requeridas y recomendadas</p>
              <p>✓ Alertas contextualizadas con impacto SEO</p>
              <p>✓ Soporte para @graph anidado</p>
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
