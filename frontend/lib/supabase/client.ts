import { createBrowserClient } from '@supabase/ssr';

// Cliente Supabase para Client Components — usa cookies del navegador
// para mantener la sesión de auth en sincronía con el servidor.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
