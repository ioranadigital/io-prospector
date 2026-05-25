// frontend/components/ui/AuditPopup.tsx
'use client';
import { X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const RULE_LABELS: Record<string, { label: string; category: string }> = {
  no_h1:            { label: 'Sin H1 principal',         category: 'SEO' },
  no_https:         { label: 'Sin HTTPS / SSL',          category: 'Seguridad' },
  no_cta:           { label: 'Sin CTAs claros',          category: 'UX' },
  no_meta_desc:     { label: 'Sin meta descripción',     category: 'SEO' },
  low_content:      { label: 'Poco contenido (<300 palabras)', category: 'SEO' },
  not_mobile:       { label: 'No mobile-friendly',       category: 'Performance' },
  no_og_tags:       { label: 'Sin Open Graph tags',      category: 'SEO' },
  no_schema_markup: { label: 'Sin Schema Markup',        category: 'SEO' },
  no_analytics:     { label: 'Sin Google Analytics',    category: 'SEO' },
  no_favicon:       { label: 'Sin favicon',              category: 'UX' },
  broken_links:     { label: 'Links rotos detectados',  category: 'UX' },
  slow_lcp:         { label: 'Carga lenta (LCP > 3s)',  category: 'Performance' },
};

export function AuditPopup({ lead, onClose }: { lead: any; onClose: () => void }) {
  const issues    = lead.audit_data || {};
  const failing   = Object.entries(issues).filter(([, v]) => v);
  const passing   = Object.entries(issues).filter(([, v]) => !v);
  const score     = lead.audit_score ?? 100;
  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="font-bold text-white text-lg">{lead.business_name}</h2>
            <p className="text-zinc-400 text-sm mt-0.5">{lead.website_url || 'Sin web'}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Score circular */}
            <div className="text-center">
              <div className="text-3xl font-black" style={{ color: scoreColor }}>{score}</div>
              <div className="text-[10px] text-zinc-500">/ 100</div>
            </div>
            <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {failing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <XCircle size={13} /> {failing.length} problemas detectados
              </p>
              <div className="space-y-1.5">
                {failing.map(([key]) => (
                  <div key={key} className="flex items-center gap-2.5 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
                    <span className="text-sm text-zinc-200">{RULE_LABELS[key]?.label || key}</span>
                    <span className="ml-auto text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {RULE_LABELS[key]?.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {passing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle size={13} /> {passing.length} correctos
              </p>
              <div className="space-y-1.5">
                {passing.map(([key]) => (
                  <div key={key} className="flex items-center gap-2.5 bg-green-500/5 border border-green-500/15 rounded-lg px-3 py-2">
                    <CheckCircle size={13} className="text-green-400 flex-shrink-0" />
                    <span className="text-sm text-zinc-400">{RULE_LABELS[key]?.label || key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
