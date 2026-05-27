'use client';

import { TemplatesAdmin } from '@/components/templates/TemplatesAdmin';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">⚙️ Administración</h1>
        <p className="text-zinc-400">Gestiona plantillas de Email y WhatsApp personalizadas</p>
      </div>

      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          💡 <strong>Tip:</strong> Las prospecciones guardadas se gestionan en 📋 Histórico. Aquí solo configuras las plantillas.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <TemplatesAdmin />
      </div>
    </div>
  );
}
