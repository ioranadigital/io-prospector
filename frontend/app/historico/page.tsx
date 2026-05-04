'use client';

import { ProspectionsAdmin } from '@/components/prospections/ProspectionsAdmin';

export default function HistoricoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">📋 Histórico de Prospecciones</h1>
        <p className="text-zinc-400">Gestiona todas tus prospecciones guardadas. Aquí aparecen las búsquedas que has guardado desde el Prospector.</p>
      </div>

      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          💡 <strong>Cómo guardar prospecciones:</strong> Ve a 🔍 Prospector, ejecuta una búsqueda, y cuando se complete haz click en el botón "Guardar" para registrar la prospección.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <ProspectionsAdmin />
      </div>
    </div>
  );
}
