'use client';
import { useState, useEffect } from 'react';
import { X, Phone, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

export function ScriptModal({ lead, onClose }: { lead: any; onClose: () => void }) {
  const [script,     setScript]     = useState('');
  const [objections, setObjections] = useState<any[]>([]);
  const [note,       setNote]       = useState('');
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    api.getTemplates('call_script').then((result: any) => {
      const t = result as any[];
      if (t[0]) setScript(
        t[0].body
          .replace(/\{\{business_name\}\}/g, lead.business_name)
          .replace(/\{\{audit_score\}\}/g,   lead.audit_score ?? '?')
      );
    });
    api.getTemplates('objection').then((result: any) => setObjections(result as any[]));
  }, []);

  async function saveNote() {
    if (!note.trim()) return;
    setSaving(true);
    await api.addActivity(lead.id, { type: 'call', direction: 'outbound', body: note, outcome: 'note' });
    setSaving(false);
    setNote('');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl shadow-2xl fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500/15 rounded-lg flex items-center justify-center">
              <Phone size={15} className="text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Guión de llamada</p>
              <p className="text-xs text-zinc-400">{lead.business_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Guión</p>
            <pre className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
              {script || 'Cargando guión...'}
            </pre>
          </div>

          {objections.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Manejo de objeciones</p>
              <div className="space-y-2">
                {objections.map(obj => (
                  <details key={obj.id} className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl group">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-zinc-200 list-none">
                      {obj.name.replace('Manejo objeción: ', '')}
                      <ChevronRight size={14} className="text-zinc-500 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="px-4 pb-3 text-sm text-zinc-400 leading-relaxed">{obj.body}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Nota de seguimiento</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Ej: Interesado, volver a llamar el jueves..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              onClick={saveNote}
              disabled={!note.trim() || saving}
              className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar nota y cerrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
