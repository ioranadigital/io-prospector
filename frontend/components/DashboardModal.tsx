'use client';

import { X, BarChart3, Mail, Phone, Calendar, Download } from 'lucide-react';

interface DashboardModalProps {
  prospectionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  leads: any[];
}

export function DashboardModal({ prospectionId, isOpen, onClose, leads }: DashboardModalProps) {
  if (!isOpen || !prospectionId) return null;

  const leadsArray = Array.isArray(leads) ? leads : [];

  const calculateScore = (lead: any) => {
    const tier1 = ['has_phone', 'has_email', 'has_contact_form', 'has_address', 'has_ssl', 'has_privacy_policy', 'has_trust_badges', 'has_gmb'];
    const tier2 = ['has_h1', 'has_cta', 'has_meta_desc', 'has_analytics', 'has_og_tags'];
    const tier3 = ['has_gallery', 'has_social_links', 'has_blog', 'has_certifications'];
    const tier4 = ['has_map', 'has_compressed_images'];
    const tier5 = ['has_share_buttons', 'has_newsletter', 'has_whatsapp', 'has_multiple_forms'];

    const t1 = tier1.filter(k => lead[k]).length / tier1.length;
    const t2 = tier2.filter(k => lead[k]).length / tier2.length;
    const t3 = tier3.filter(k => lead[k]).length / tier3.length;
    const t4 = tier4.filter(k => lead[k]).length / tier4.length;
    const t5 = tier5.filter(k => lead[k]).length / tier5.length;

    return Math.round((t1 * 0.35 + t2 * 0.30 + t3 * 0.15 + t4 * 0.10 + t5 * 0.10) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-h-[90vh] overflow-y-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Dashboard de Resultados</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-300 font-semibold mb-2 flex items-center gap-1.5"><BarChart3 size={14} /> Resumen</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-400">Leads Procesados</p>
                <p className="text-2xl font-bold text-blue-400">{leadsArray.length}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Score Promedio</p>
                <p className="text-2xl font-bold text-green-400">
                  {leadsArray.length > 0
                    ? Math.round(leadsArray.reduce((sum: number, lead: any) => sum + calculateScore(lead), 0) / leadsArray.length)
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Críticos (TIER1)</p>
                <p className="text-2xl font-bold text-red-400">{leadsArray.filter(l => !l.has_phone && !l.has_email).length}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Excelentes (80+)</p>
                <p className="text-2xl font-bold text-yellow-400">{leadsArray.filter(l => calculateScore(l) >= 80).length}</p>
              </div>
            </div>
          </div>

          {/* Leads List */}
          <div className="space-y-3">
            {leadsArray.map((lead, idx) => {
              const score = calculateScore(lead);
              const statusColor =
                score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : score >= 40 ? 'text-orange-400' : 'text-red-400';

              return (
                <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  {/* Lead Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{lead.business_name}</h3>
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noopener" className="text-sm text-blue-400 hover:underline">
                          {lead.website}
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${statusColor}`}>{score}</p>
                      <p className="text-xs text-zinc-400">/100</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    {lead.email && <p className="text-zinc-300 flex items-center gap-1"><Mail size={12} /> {lead.email}</p>}
                    {lead.phone && <p className="text-zinc-300 flex items-center gap-1"><Phone size={12} /> {lead.phone}</p>}
                    {lead.created_at && <p className="text-zinc-400 text-xs flex items-center gap-1"><Calendar size={11} /> {new Date(lead.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</p>}
                  </div>

                  {/* TIERs Progress */}
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: 'TIER 1', color: 'bg-red-500', items: ['has_phone', 'has_email', 'has_contact_form', 'has_address', 'has_ssl', 'has_privacy_policy', 'has_trust_badges', 'has_gmb'] },
                      { label: 'TIER 2', color: 'bg-yellow-500', items: ['has_h1', 'has_cta', 'has_meta_desc', 'has_analytics', 'has_og_tags'] },
                      { label: 'TIER 3', color: 'bg-blue-500', items: ['has_gallery', 'has_social_links', 'has_blog', 'has_certifications'] },
                      { label: 'TIER 4', color: 'bg-green-500', items: ['has_map', 'has_compressed_images'] },
                      { label: 'TIER 5', color: 'bg-purple-500', items: ['has_share_buttons', 'has_newsletter', 'has_whatsapp', 'has_multiple_forms'] }
                    ].map((tier) => {
                      const count = tier.items.filter(k => lead[k]).length;
                      const percentage = Math.round((count / tier.items.length) * 100);
                      return (
                        <div key={tier.label}>
                          <p className="text-xs font-semibold text-zinc-300 mb-1">{tier.label}</p>
                          <div className="bg-zinc-700 rounded h-2 overflow-hidden">
                            <div className={`${tier.color} h-full transition-all`} style={{ width: `${percentage}%` }} />
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{count}/{tier.items.length}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Export Button */}
          <div className="flex gap-3">
            <a
              href={`http://localhost:4000/api/scraping/download/${prospectionId}/csv`}
              download
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-center"
            >
              <Download size={15} className="inline mr-1" />Descargar CSV
            </a>
            <a
              href={`http://localhost:4000/api/scraping/view/${prospectionId}/dashboard`}
              target="_blank"
              rel="noopener"
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold text-center"
            >
              <BarChart3 size={15} className="inline mr-1" />Ver Reporte Completo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
