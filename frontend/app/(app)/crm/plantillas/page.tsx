'use client';
import { TemplatesAdmin } from '@/components/templates/TemplatesAdmin';

export default function PlantillasPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">✉️ Plantillas</h1>
        <p className="text-zinc-400 text-sm mt-1">Plantillas de email y WhatsApp para contactar leads y clientes</p>
      </div>
      <TemplatesAdmin />
    </div>
  );
}
