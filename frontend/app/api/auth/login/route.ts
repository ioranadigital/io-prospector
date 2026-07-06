import { NextRequest, NextResponse } from 'next/server';
import { MOCK_ADMIN_CREDENTIALS, SESSION_COOKIE_NAME } from '@/lib/mock-auth';

// Modo Test: valida contra credenciales mockeadas en lib/mock-auth.ts.
// Sustituir por supabase.auth.signInWithPassword() al pasar a producción.
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const valid =
    email?.trim().toLowerCase() === MOCK_ADMIN_CREDENTIALS.email &&
    password === MOCK_ADMIN_CREDENTIALS.password;

  if (!valid) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, 'mock-session', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 horas
  });
  return res;
}
