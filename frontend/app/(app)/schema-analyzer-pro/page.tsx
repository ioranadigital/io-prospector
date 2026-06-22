'use client';

import { useState } from 'react';
import { Search, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4006/api';
      const response = await fetch(`${apiUrl}/schema-analyzer-pro/analyze`, {
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
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Schema.org Analyzer PRO</h1>
          <p className="text-gray-400">Análisis avanzado de 30+ entidades Schema.org</p>
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

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">Score General</h3>
                  <p className="text-gray-400 text-sm">Completitud de datos estructurados</p>
                </div>
                <div className="text-6xl font-bold text-green-400">
                  {result.scores?.average || 0}
                </div>
              </div>

              {/* URL */}
              <div className="mt-4 pt-4 border-t border-zinc-700 flex items-center justify-between">
                <span className="text-blue-400 text-sm truncate">{result.url}</span>
                <button
                  onClick={handleCopyUrl}
                  className="ml-2 px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-white"
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-400">
                    {result.summary.totalSchemas || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Schemas totales</div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">
                    {result.summary.validSchemas || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Válidos</div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-400">
                    {result.summary.primaryType || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Tipo principal</div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="text-3xl font-bold text-red-400">
                    {result.alertsSummary?.critical || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Alertas críticas</div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.recommendations?.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">
                  Schemas Recomendados ({result.recommendations.recommendations.length})
                </h3>
                <div className="space-y-3">
                  {result.recommendations.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="bg-amber-900/20 border border-amber-700 rounded p-3">
                      <h5 className="font-semibold text-white text-sm">{rec.type}</h5>
                      <p className="text-xs text-amber-300 mt-1">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success */}
            {result.alerts?.length === 0 && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
                <CheckCircle size={32} className="mx-auto text-green-400 mb-3" />
                <h3 className="text-white font-semibold">¡Perfecto!</h3>
                <p className="text-green-300 text-sm">Tu Schema.org está optimizado</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 text-center">
            <p className="text-blue-300 text-sm">
              Ingresa una URL para analizar sus esquemas Schema.org
            </p>
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
