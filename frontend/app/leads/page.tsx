'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CsvUploader } from '@/components/leads/CsvUploader';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { ActivitiesTable } from '@/components/activities/ActivitiesTable';

export default function LeadsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'leads' | 'activities'>('leads');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [refreshTrigger]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('io_prosp_leads')
        .select('category')
        .neq('category', null);

      if (error) throw error;

      // Obtener categorías únicas
      const uniqueCategories = Array.from(new Set(data?.map(d => d.category).filter(Boolean) || []))
        .sort() as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Prospector 🎯</h1>
        <p className="text-zinc-400">Importa leads y gestiona campañas de email/WhatsApp</p>
      </div>

      <div className="flex gap-4 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'leads'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          📊 Leads ({refreshTrigger})
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'activities'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          📈 Historial
        </button>
      </div>

      {activeTab === 'leads' && (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Importar Leads (CSV)</h2>
            <CsvUploader onSuccess={() => setRefreshTrigger(prev => prev + 1)} />
          </div>

          {/* Pestañas de categorías */}
          <div className="flex gap-2 border-b border-zinc-800 overflow-x-auto pb-0">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedCategory === null
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              📋 Todos ({categories.length > 0 ? 'cargando...' : '0'})
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                🏷️ {category}
              </button>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Tabla de Leads</h2>
            <LeadsTable refreshTrigger={refreshTrigger} filterCategory={selectedCategory} />
          </div>
        </>
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
