import { NextRequest, NextResponse } from 'next/server';
import { AUTH_MODE, SESSION_COOKIE_NAME } from '@/lib/mock-auth';

// Guardián de acceso — Modo Test.
// Protege todas las rutas de la app (Prospección, Audit SEO, CRM, Admin)
// salvo /login y los assets internos de Next. Ver lib/mock-auth.ts para
// el detalle de qué reemplazar por Supabase Auth en el siguiente paso.

export function middleware(req: NextRequest) {
  if (AUTH_MODE !== 'test') return NextResponse.next();

  const hasSession = req.cookies.has(SESSION_COOKIE_NAME);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('from', req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
