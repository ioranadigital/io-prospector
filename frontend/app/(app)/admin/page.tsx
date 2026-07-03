'use client';
import Link from 'next/link';
import { AlertCircle, Users, Settings, Lightbulb } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users size={22} className="text-white" /> Administración</h1>
        <p className="text-zinc-400 text-sm mt-1">Gestión de usuarios y configuración del sistema</p>
      </div>

      {/* Usuarios */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Users size={18} /> Usuarios</h2>
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-200">
            Gestión de usuarios en desarrollo. Por ahora, usa Supabase Auth en la consola para gestionar accesos.
          </p>
        </div>
      </div>

      {/* Sistema Global */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Settings size={18} /> Sistema Global</h2>
        <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            Configuración global (API keys, webhooks, etc) en desarrollo. Para cambios rápidos, edita <code className="bg-zinc-800 px-2 py-1 rounded text-xs">.env</code>.
          </p>
        </div>
      </div>

      {/* Nota sobre Configuración */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <p className="text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><Lightbulb size={14} className="text-zinc-400 flex-shrink-0" /> <strong>Nota:</strong></span>{' '}
          Las categorías, plantillas de email/WhatsApp y exclusiones se gestionan en{' '}
          <Link href="/config" className="text-zinc-300 hover:text-white underline inline-flex items-center gap-1">
            <Settings size={13} className="inline" /> Configuración
          </Link>.
        </p>
      </div>
    </div>
  );
}
