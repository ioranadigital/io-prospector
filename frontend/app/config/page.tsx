// frontend/app/config/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ConfigPage() {
  const [rules,    setRules]    = useState<any[]>([]);
  const [config,   setConfig]   = useState<Record<string,string>>({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/config/audit-rules`).then(r=>r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/config`).then(r=>r.json()),
    ]).then(([rules, cfg]) => { setRules(rules); setConfig(cfg); setLoading(false); });
  }, []);

  async function saveRule(id: string, updates: object) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config/audit-rules/${id}`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(updates)
    });
    toast.success('Regla actualizada');
    setRules(r => r.map(rule => rule.id === id ? { ...rule, ...updates } : rule));
  }

  async function saveConfig() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(config)
    });
    toast.success('Configuración guardada');
  }

  const CAT_COLOR: Record<string,string> = {
    seo: 'bg-blue-900/40 text-blue-300', security: 'bg-red-900/40 text-red-300',
    ux: 'bg-violet-900/40 text-violet-300', performance: 'bg-amber-900/40 text-amber-300',
  };

  if (loading) return <div className="text-zinc-600 text-center py-24">Cargando...</div>;

  return (
    <div className="space-y-10 fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Ajusta las reglas de auditoría y variables globales</p>
      </div>

      {/* Config global */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Variables globales</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          {Object.entries(config).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs font-medium text-zinc-400 block mb-1.5">{key}</label>
              <input value={value} onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <button onClick={saveConfig}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Guardar configuración
          </button>
        </div>
      </section>

      {/* Reglas de auditoría */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Reglas de auditoría SEO</h2>
        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              <input type="checkbox" checked={rule.enabled}
                onChange={e => saveRule(rule.id, { enabled: e.target.checked })}
                className="w-4 h-4 accent-blue-500 cursor-pointer" />
              <div className="flex-1">
                <p className="text-sm text-zinc-200">{rule.label}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${CAT_COLOR[rule.category] || 'bg-zinc-700 text-zinc-400'}`}>
                  {rule.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Penalización:</span>
                <input type="number" value={rule.penalty} max={0}
                  onChange={e => saveRule(rule.id, { penalty: Number(e.target.value) })}
                  className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-red-400 text-right focus:outline-none" />
                <span className="text-xs text-zinc-600">pts</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
