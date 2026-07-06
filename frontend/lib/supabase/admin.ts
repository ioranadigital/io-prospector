import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// SOLO para uso server-side (Route Handlers) — nunca importar desde un
// 'use client' ni exponer SUPABASE_SERVICE_ROLE_KEY al navegador.
// Se usa para gestión de usuarios (auth.admin.*) que requiere permisos
// que la anon key no tiene.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada (requerida para /api/admin/users)');
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
