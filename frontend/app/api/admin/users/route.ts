import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/require-admin';

function isBanned(bannedUntil: string | null | undefined) {
  if (!bannedUntil) return false;
  return new Date(bannedUntil).getTime() > Date.now();
}

export async function GET() {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  const { admin } = guard;

  const { data: authUsers, error: authError } = await admin.auth.admin.listUsers();
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const { data: profiles } = await admin.from('io_pro_profiles').select('id, role, full_name');
  const profileById = new Map((profiles || []).map(p => [p.id, p]));

  const users = authUsers.users.map(u => {
    const profile = profileById.get(u.id);
    return {
      id: u.id,
      name: profile?.full_name || u.user_metadata?.full_name || u.email,
      email: u.email,
      role: profile?.role || 'Viewer',
      status: isBanned(u.banned_until) ? 'Inactivo' : 'Activo',
    };
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  const { admin } = guard;

  const { name, email, role } = await req.json();
  if (!name?.trim() || !email?.trim() || !role) {
    return NextResponse.json({ error: 'Nombre, email y rol son obligatorios' }, { status: 400 });
  }

  const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email.trim(),
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: name.trim() },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || 'No se pudo crear el usuario' },
      { status: 400 }
    );
  }

  // El trigger on_auth_user_created ya insertó el perfil con role='Viewer';
  // lo actualizamos al rol elegido (upsert por si el trigger aún no corrió).
  await admin.from('io_pro_profiles').upsert({
    id: created.user.id,
    full_name: name.trim(),
    role,
  });

  return NextResponse.json({
    user: { id: created.user.id, name: name.trim(), email: email.trim(), role, status: 'Activo' },
    tempPassword,
  });
}
