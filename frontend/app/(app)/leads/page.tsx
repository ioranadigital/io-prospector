'use client';

import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, ClipboardList, Search, Target, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CsvUploader } from '@/components/leads/CsvUploader';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { ActivitiesTable } from '@/components/activities/ActivitiesTable';
import type { Lead } from '@/lib/supabase';

export default function LeadsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'leads' | 'activities'>('leads');
  const [source, setSource] = useState<'all' | 'prospector' | 'audit'>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadCategories();
  }, [refreshTrigger]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('io_pro_leads')
        .select('category')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueCategories = Array.from(new Set(data?.map(d => d.category).filter(Boolean) || []))
        .sort() as string[];

      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  return (
    <div className="space-y-6 h-screen flex flex-col">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          Prospector CRM <Target size={22} className="text-blue-400" />
        </h1>
        <p className="text-xs text-zinc-400">Análisis de clientes | Gestión de campañas</p>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-0">
        {/* Pestañas */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'leads'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart2 size={15} className="inline mr-1" /> Leads ({refreshTrigger})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'activities'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp size={15} className="inline mr-1" /> Historial
          </button>
        </div>

        {/* Botón Importar CSV (visible solo en tab leads) */}
        {activeTab === 'leads' && (
          <div className="pb-3">
            <CsvUploader onSuccess={() => setRefreshTrigger(prev => prev + 1)} />
          </div>
        )}
      </div>

      {activeTab === 'leads' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Pestañas de ORIGEN */}
          <div className="flex gap-2 flex-shrink-0">
            {([
              { id: 'all',        label: 'Todos',      icon: ClipboardList },
              { id: 'prospector', label: 'Prospector', icon: Search },
              { id: 'audit',      label: 'Auditoría',  icon: Target },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setSource(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  source === t.id ? 'bg-blue-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <t.icon size={14} className="inline mr-1" />{t.label}
              </button>
            ))}
          </div>

          {/* Pestañas de categorías */}
          <div className="flex gap-2 border-b border-zinc-800 overflow-x-auto pb-0 flex-shrink-0">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap text-sm ${
                selectedCategory === null
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <ClipboardList size={14} className="inline mr-1" /> Todos
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap text-sm ${
                  selectedCategory === category
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Tag size={14} className="inline mr-1" /> {category}
              </button>
            ))}
          </div>

          {/* Tabla a ancho completo */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-zinc-800 flex-shrink-0">
              <h2 className="text-sm font-semibold">Análisis de Clientes</h2>
              <p className="text-xs text-zinc-500 mt-1">Haz clic en un cliente para ver análisis detallado (Fortalezas & Debilidades)</p>
            </div>
            <div className="flex-1 overflow-auto">
              <LeadsTable
                refreshTrigger={refreshTrigger}
                filterCategory={selectedCategory}
                source={source}
                onSelectLead={(lead) => {
                  setSelectedLead(lead);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={true}
          onClose={() => setSelectedLead(null)}
          onSendEmail={() => {}}
          onSendWhatsApp={() => {}}
          onUpdate={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      {activeTab === 'activities' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Historial de Envíos</h2>
          <ActivitiesTable />
        </div>
      )}
    </div>
  );
}
