import { NextResponse } from 'next/server';

// Endpoint de healthcheck para Docker/Traefik. Vive bajo /api, por lo que
// el middleware de auth (middleware.ts) lo excluye del guard de login.
export async function GET() {
  return NextResponse.json({ ok: true });
}
