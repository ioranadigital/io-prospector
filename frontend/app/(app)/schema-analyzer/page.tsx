'use client';
import { useState } from 'react';
import { Search, Loader2, AlertTriangle, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const SEVERITY_COLORS = {
  CRITICAL: { bg: 'bg-red-900/20', border: 'border-red-700', icon: '🚨', text: 'text-red-300' },
  HIGH: { bg: 'bg-orange-900/20', border: 'border-orange-700', icon: '⚠️', text: 'text-orange-300' },
  MEDIUM: { bg: 'bg-yellow-900/20', border: 'border-yellow-700', icon: '💡', text: 'text-yellow-300' },
  LOW: { bg: 'bg-blue-900/20', border: 'border-blue-700', icon: 'ℹ️', text: 'text-blue-300' },
};

export default function SchemaAnalyzerPage() {
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
      const response = await fetch('/api/schema-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: No se pudo analizar`);
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Analizador Schema.org</h1>
          <p className="text-gray-400">
            Detecta, valida y optimiza tus marcados JSON-LD para SEO Local y E-commerce
          </p>
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
            {/* Score Card */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Score Schema.org</h3>
                  <p className="text-gray-400 text-sm">Optimización general del marcado estructurado</p>
                </div>
                <div className={`text-5xl font-bold ${
                  result.seoScore >= 80 ? 'text-green-400' :
                  result.seoScore >= 60 ? 'text-yellow-400' :
                  result.seoScore >= 40 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {result.seoScore}
                </div>
              </div>

              {/* URL */}
              <div className="mt-4 pt-4 border-t border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-400 text-sm">URL:</span>
                  <span className="text-blue-400 text-sm truncate">{result.url}</span>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="ml-2 p-1 hover:bg-zinc-700 rounded transition"
                  title="Copiar URL"
                >
                  <Copy size={16} className="text-gray-400" />
                </button>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-1 hover:bg-zinc-700 rounded transition"
                  title="Abrir en nueva pestaña"
                >
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
              </div>
            </div>

            {/* Analysis Summary */}
            {result.analysis && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-3">Resumen del Análisis</h3>
                <div className="space-y-2">
                  {result.analysis.summary.map((line: string, idx: number) => (
                    <p key={idx} className="text-gray-300 text-sm">
                      {line}
                    </p>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-700">
                  <div className="bg-zinc-700/30 rounded p-3">
                    <div className="text-2xl font-bold text-blue-400">{result.analysis.totalSchemas}</div>
                    <div className="text-xs text-gray-400 mt-1">Schemas totales</div>
                  </div>
                  <div className="bg-zinc-700/30 rounded p-3">
                    <div className="text-2xl font-bold text-green-400">{result.analysis.validSchemas}</div>
                    <div className="text-xs text-gray-400 mt-1">Válidos</div>
                  </div>
                  <div className="bg-zinc-700/30 rounded p-3">
                    <div className="text-2xl font-bold text-orange-400">{result.analysis.highPriorityOpportunities}</div>
                    <div className="text-xs text-gray-400 mt-1">Problemas altos</div>
                  </div>
                  <div className="bg-zinc-700/30 rounded p-3">
                    <div className="text-2xl font-bold text-yellow-400">{result.loadTime}ms</div>
                    <div className="text-xs text-gray-400 mt-1">Tiempo carga</div>
                  </div>
                </div>
              </div>
            )}

            {/* Schemas Detectados */}
            {result.schemas && result.schemas.length > 0 && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Esquemas Detectados ({result.schemas.length})</h3>
                <div className="space-y-4">
                  {result.schemas.map((schema: any, idx: number) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-4 border-l-4 ${
                        schema.isValid
                          ? 'bg-green-900/10 border-green-700'
                          : 'bg-red-900/10 border-red-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-blue-400">
                              {schema.type}
                            </span>
                            {schema.isValid ? (
                              <CheckCircle size={16} className="text-green-400" />
                            ) : (
                              <AlertTriangle size={16} className="text-red-400" />
                            )}
                          </div>

                          {schema.isValid && (
                            <div className="mt-2 space-y-1">
                              {Object.keys(schema.missingFields || {}).length > 0 ? (
                                <div className="text-xs text-gray-300">
                                  <span className="text-gray-400">Campos faltantes: </span>
                                  {Object.entries(schema.missingFields).map(([key, field]: any) => (
                                    <span
                                      key={key}
                                      className={field.priority === 'required' ? 'text-red-300' : 'text-yellow-300'}
                                    >
                                      {field.label}
                                      {field.priority === 'required' ? '*' : ''}
                                      {', '}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-green-300">✓ Todos los campos críticos presentes</div>
                              )}
                            </div>
                          )}

                          {!schema.isValid && (
                            <div className="text-xs text-red-300 mt-1">{schema.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Oportunidades */}
            {result.opportunities && result.opportunities.length > 0 && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">
                  Oportunidades de Mejora ({result.opportunities.length})
                </h3>
                <div className="space-y-3">
                  {result.opportunities.map((opp: any, idx: number) => {
                    const colors = SEVERITY_COLORS[opp.severity as keyof typeof SEVERITY_COLORS];
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg p-4 border ${colors.bg} ${colors.border}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl mt-0.5">{colors.icon}</span>
                          <div className="flex-1">
                            <div className={`font-semibold text-sm ${colors.text}`}>
                              {opp.title}
                            </div>
                            <p className="text-gray-300 text-sm mt-1">{opp.description}</p>

                            {opp.fields && Object.keys(opp.fields).length > 0 && (
                              <div className="mt-2 text-xs text-gray-300 bg-zinc-900/50 rounded p-2">
                                <span className="text-gray-400">Campos: </span>
                                {Object.entries(opp.fields).map(([key, field]: any) => (
                                  <span key={key} className="inline-block mr-2">
                                    <span className={field.priority === 'required' ? 'text-red-300' : 'text-yellow-300'}>
                                      {field.label}
                                      {field.priority === 'required' ? '*' : ''}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-2 flex items-start gap-4 text-xs">
                              <div>
                                <span className="text-gray-500">Impacto: </span>
                                <span className="text-gray-300">{opp.impact}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Recomendación: </span>
                                <span className="text-gray-300">{opp.recommendation}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No opportunities */}
            {result.opportunities && result.opportunities.length === 0 && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
                <CheckCircle size={32} className="mx-auto text-green-400 mb-3" />
                <h3 className="text-white font-semibold mb-1">¡Perfecto!</h3>
                <p className="text-green-300 text-sm">Tu Schema.org está completamente optimizado</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Comienza a analizar</h3>
            <p className="text-gray-500 mb-6">
              Ingresa la URL de un sitio para detectar y validar sus schemas JSON-LD
            </p>
            <div className="text-gray-600 text-sm space-y-1">
              <p>✓ Detecta LocalBusiness, Product, FAQPage y más</p>
              <p>✓ Valida campos críticos y recomendados</p>
              <p>✓ Identifica oportunidades de mejora SEO</p>
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
