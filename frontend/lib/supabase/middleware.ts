import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/auth', '/auth/reset-password'];

// Refresca la sesión de Supabase (si el access token expiró, usa el refresh
// token de la cookie) y redirige a /login si no hay usuario autenticado.
// Basado en el patrón oficial de @supabase/ssr para Next.js App Router.
export async function updateSession(request: NextRequest) {
  // Permitir acceso directo a rutas públicas sin verificar autenticación
  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
