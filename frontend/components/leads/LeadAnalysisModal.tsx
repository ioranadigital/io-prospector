'use client';

import { X, Mail, Phone, Lock, MapPin, FileText, Link2, Smartphone, Star, Camera, Zap, Target, Wrench, BarChart2, CheckCircle, XCircle, Check } from 'lucide-react';
import type { Lead } from '@/lib/supabase';

interface LeadAnalysisModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadAnalysisModal({ lead, onClose }: LeadAnalysisModalProps) {
  if (!lead) return null;

  const tiers = {
    tier1: {
      name: 'TIER 1: Contacto & Confianza',
      color: 'red',
      checks: [
        { label: 'Email', icon: Mail, has: !!lead.email },
        { label: 'Teléfono', icon: Phone, has: !!lead.phone },
        { label: 'SSL/HTTPS', icon: Lock, has: lead.ssl_active },
        { label: 'GMB', icon: MapPin, has: lead.gmb_claimed },
      ]
    },
    tier2: {
      name: 'TIER 2: Conversión',
      color: 'yellow',
      checks: [
        { label: 'H1', icon: FileText, has: (lead.h1_count || 0) === 1 },
        { label: 'Schema', icon: Link2, has: lead.has_schema },
        { label: 'Mobile', icon: Smartphone, has: lead.is_mobile_responsive },
      ]
    },
    tier3: {
      name: 'TIER 3: Credibilidad',
      color: 'blue',
      checks: [
        { label: 'GMB Rating', icon: Star, has: !!lead.gmb_rating },
        { label: 'Fotos GMB', icon: Camera, has: (lead.photo_count || 0) > 0 },
        { label: 'Reseñas', icon: FileText, has: (lead.review_count || 0) > 0 },
      ]
    },
    tier4: {
      name: 'TIER 4: Rendimiento',
      color: 'green',
      checks: [
        { label: 'TTFB', icon: Zap, has: lead.ttfb_ms ? lead.ttfb_ms < 300 : false },
        { label: 'LCP', icon: Target, has: lead.lcp_ms ? lead.lcp_ms < 2500 : false },
      ]
    },
    tier5: {
      name: 'TIER 5: Engagement',
      color: 'purple',
      checks: [
        { label: 'Tech Stack', icon: Wrench, has: !!lead.tech_cms },
      ]
    }
  };

  const colorMap = {
    red: { bg: 'bg-red-900/20', border: 'border-red-800', text: 'text-red-300' },
    yellow: { bg: 'bg-yellow-900/20', border: 'border-yellow-800', text: 'text-yellow-300' },
    blue: { bg: 'bg-blue-900/20', border: 'border-blue-800', text: 'text-blue-300' },
    green: { bg: 'bg-green-900/20', border: 'border-green-800', text: 'text-green-300' },
    purple: { bg: 'bg-purple-900/20', border: 'border-purple-800', text: 'text-purple-300' },
  };

  const barColors = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  const calculateScores = () => {
    const tier1Count = tiers.tier1.checks.filter(c => c.has).length;
    const tier2Count = tiers.tier2.checks.filter(c => c.has).length;
    const tier3Count = tiers.tier3.checks.filter(c => c.has).length;
    const tier4Count = tiers.tier4.checks.filter(c => c.has).length;
    const tier5Count = tiers.tier5.checks.filter(c => c.has).length;

    const totalScore = Math.round(
      (tier1Count / tiers.tier1.checks.length * 0.35 +
       tier2Count / tiers.tier2.checks.length * 0.30 +
       tier3Count / tiers.tier3.checks.length * 0.15 +
       tier4Count / tiers.tier4.checks.length * 0.10 +
       tier5Count / tiers.tier5.checks.length * 0.10) * 100
    );

    return { tier1Count, tier2Count, tier3Count, tier4Count, tier5Count, totalScore };
  };

  const scores = calculateScores();
  const statusText =
    scores.totalScore >= 80 ? 'EXCELENTE - Contactar' :
    scores.totalScore >= 60 ? 'BUENO - Contactar con propuesta' :
    scores.totalScore >= 40 ? 'REGULAR - Esperar mejoras' :
    'CRÍTICO - Enfoque en TIER 1 primero';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <div>
            <h2 className="text-2xl font-bold text-white">{lead.business_name}</h2>
            {lead.website && (
              <a href={lead.website} target="_blank" rel="noopener" className="text-sm text-blue-400 hover:underline">
                {lead.website}
              </a>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Puntuación General */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-blue-300 flex items-center gap-1.5"><BarChart2 size={14} /> Puntuación Integral</p>
              <span className="text-3xl font-bold text-blue-400">{scores.totalScore}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                style={{ width: `${scores.totalScore}%` }}
              />
            </div>
            <p className="text-sm text-zinc-300">{statusText}</p>
          </div>

          {/* Detalles del Lead */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-zinc-800/50 rounded p-3">
              <p className="text-xs text-zinc-500 uppercase mb-1">Email</p>
              <p className="text-sm font-semibold truncate">{lead.email || '—'}</p>
            </div>
            <div className="bg-zinc-800/50 rounded p-3">
              <p className="text-xs text-zinc-500 uppercase mb-1">Teléfono</p>
              <p className="text-sm font-semibold truncate">{lead.phone || '—'}</p>
            </div>
            <div className="bg-zinc-800/50 rounded p-3">
              <p className="text-xs text-zinc-500 uppercase mb-1">Estado CRM</p>
              <p className="text-sm font-semibold truncate">{lead.crm_status || '—'}</p>
            </div>
            <div className="bg-zinc-800/50 rounded p-3">
              <p className="text-xs text-zinc-500 uppercase mb-1">Score Audit</p>
              <p className="text-sm font-semibold truncate">{lead.audit_score || '—'}/100</p>
            </div>
          </div>



          {/* TIERs Grid */}
          <div className="space-y-3">
            {Object.entries(tiers).map(([key, tier]) => {
              const colors = colorMap[tier.color as keyof typeof colorMap];
              const barColor = barColors[tier.color as keyof typeof barColors];
              const completedCount = tier.checks.filter(c => c.has).length;
              const percentage = Math.round((completedCount / tier.checks.length) * 100);

              return (
                <div key={key} className={`border rounded-lg p-3 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-bold uppercase ${colors.text}`}>{tier.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-zinc-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-zinc-400">{completedCount}/{tier.checks.length}</span>
                    </div>
                  </div>

                  {/* Checks en una sola línea */}
                  <div className="flex flex-wrap gap-1.5">
                    {tier.checks.map((check, idx) => {
                      const CheckIcon = check.icon;
                      return (
                        <div
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                            check.has
                              ? `${colors.bg} border ${colors.border} text-zinc-200`
                              : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 line-through opacity-50'
                          }`}
                        >
                          {check.has ? <Check size={10} /> : <X size={10} />}
                          <CheckIcon size={10} />
                          <span>{check.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notas */}
          {lead.notes && (
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 uppercase mb-2">Notas</p>
              <p className="text-sm text-zinc-300">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
