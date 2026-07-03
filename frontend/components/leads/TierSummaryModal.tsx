'use client';

import { X, BarChart2, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { type Lead } from '@/lib/supabase';

interface TierSummaryModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

export function TierSummaryModal({ lead, isOpen, onClose }: TierSummaryModalProps) {
  if (!isOpen) return null;

  // Cada check usa campos reales de io_pro_leads (Lead type en lib/supabase.ts)
  const tiers = [
    {
      label: 'TIER 1 — Contacto & Presencia',
      color: 'bg-red-500',
      items: [
        { label: 'Email',                   has: !!lead.email },
        { label: 'Teléfono',                has: !!lead.phone },
        { label: 'HTTPS / SSL',             has: !!lead.ssl_active },
        { label: 'Google Business reclamado', has: !!lead.gmb_claimed },
      ]
    },
    {
      label: 'TIER 2 — Señales SEO',
      color: 'bg-yellow-500',
      items: [
        { label: 'H1 correcto (exactamente 1)', has: lead.h1_count === 1 },
        { label: 'Schema markup',             has: !!lead.has_schema },
        { label: 'Diseño mobile responsive',  has: !!lead.is_mobile_responsive },
        { label: 'Sin enlaces rotos',         has: (lead.broken_links_count ?? 1) === 0 },
      ]
    },
    {
      label: 'TIER 3 — Reputación GMB',
      color: 'bg-blue-500',
      items: [
        { label: 'Rating GMB ≥ 4',   has: (lead.gmb_rating ?? 0) >= 4 },
        { label: 'Fotos en GMB',     has: (lead.photo_count ?? 0) > 0 },
        { label: 'Reseñas > 10',     has: (lead.review_count ?? 0) > 10 },
      ]
    },
    {
      label: 'TIER 4 — Rendimiento',
      color: 'bg-green-500',
      items: [
        { label: 'TTFB < 300ms',  has: lead.ttfb_ms ? lead.ttfb_ms < 300 : false },
        { label: 'LCP < 2.5s',    has: lead.lcp_ms  ? lead.lcp_ms  < 2500 : false },
      ]
    },
    {
      label: 'TIER 5 — Stack Técnico',
      color: 'bg-purple-500',
      items: [
        { label: 'CMS detectado',       has: !!lead.tech_cms },
        { label: 'Analytics detectado', has: !!lead.tech_analytics },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart2 size={22} className="text-white" /> Resumen de TIERS</h2>
            <p className="text-sm text-zinc-400 mt-1">{lead.business_name}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-700 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {tiers.map((tier) => {
            const completed = tier.items.filter(item => item.has).length;
            const total = tier.items.length;
            const percentage = Math.round((completed / total) * 100);

            return (
              <div key={tier.label} className="border border-zinc-700 rounded-lg p-4">
                {/* Tier Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${tier.color} w-4 h-4 rounded-full`} />
                    <h3 className="text-lg font-semibold text-white">{tier.label}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{completed}/{total}</p>
                    <p className="text-sm text-zinc-400">{percentage}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-zinc-700 rounded h-3 overflow-hidden mb-4">
                  <div
                    className={`${tier.color} h-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {tier.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-sm flex items-center gap-2 ${
                        item.has
                          ? 'bg-green-900/30 text-green-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.has
                        ? <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                        : <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Score Summary */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-3 flex items-center gap-1.5"><TrendingUp size={14} /> Puntuación General</h3>
            <p className="text-3xl font-bold text-white">{lead.audit_score || 0}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
