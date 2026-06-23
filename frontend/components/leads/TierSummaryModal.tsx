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

  const tiers = [
    {
      label: 'TIER 1',
      color: 'bg-red-500',
      items: [
        { key: 'has_phone', label: 'Teléfono' },
        { key: 'has_email', label: 'Email' },
        { key: 'has_contact_form', label: 'Formulario de contacto' },
        { key: 'has_address', label: 'Dirección' },
        { key: 'has_ssl', label: 'SSL' },
        { key: 'has_privacy_policy', label: 'Política de privacidad' },
        { key: 'has_trust_badges', label: 'Badges de confianza' },
        { key: 'has_gmb', label: 'Google Business Profile' }
      ]
    },
    {
      label: 'TIER 2',
      color: 'bg-yellow-500',
      items: [
        { key: 'has_h1', label: 'H1 Tag' },
        { key: 'has_cta', label: 'Call-to-action' },
        { key: 'has_meta_desc', label: 'Meta description' },
        { key: 'has_analytics', label: 'Analytics' },
        { key: 'has_og_tags', label: 'OG Tags' }
      ]
    },
    {
      label: 'TIER 3',
      color: 'bg-blue-500',
      items: [
        { key: 'has_gallery', label: 'Galería de fotos' },
        { key: 'has_social_links', label: 'Enlaces a redes sociales' },
        { key: 'has_blog', label: 'Blog' },
        { key: 'has_certifications', label: 'Certificaciones' }
      ]
    },
    {
      label: 'TIER 4',
      color: 'bg-green-500',
      items: [
        { key: 'has_map', label: 'Mapa' },
        { key: 'has_compressed_images', label: 'Imágenes optimizadas' }
      ]
    },
    {
      label: 'TIER 5',
      color: 'bg-purple-500',
      items: [
        { key: 'has_share_buttons', label: 'Botones de compartir' },
        { key: 'has_newsletter', label: 'Newsletter' },
        { key: 'has_whatsapp', label: 'WhatsApp widget' },
        { key: 'has_multiple_forms', label: 'Múltiples formularios' }
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
            const completed = tier.items.filter(item => lead[item.key as keyof Lead]).length;
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
                  {tier.items.map((item) => {
                    const hasItem = lead[item.key as keyof Lead];
                    return (
                      <div
                        key={item.key}
                        className={`p-2 rounded text-sm flex items-center gap-2 ${
                          hasItem
                            ? 'bg-green-900/30 text-green-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {hasItem ? <CheckCircle size={14} className="text-green-400 flex-shrink-0" /> : <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
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
