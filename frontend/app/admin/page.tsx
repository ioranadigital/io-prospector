'use client';

import { TemplatesAdmin } from '@/components/templates/TemplatesAdmin';
import { ProspectionsAdmin } from '@/components/prospections/ProspectionsAdmin';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Administración ⚙️</h1>
        <p className="text-zinc-400">Gestiona plantillas, prospecciones y configuración</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <ProspectionsAdmin />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <TemplatesAdmin />
      </div>
    </div>
  );
}
