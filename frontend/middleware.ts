import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Guardián de acceso — protege todas las rutas de la app (Prospección,
// Audit SEO, CRM, Admin) salvo /login. Usa la sesión real de Supabase Auth
// vía @supabase/ssr (lib/supabase/middleware.ts).
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
