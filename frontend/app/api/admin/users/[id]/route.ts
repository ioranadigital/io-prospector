import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/require-admin';

// ~100 años: no existe un "ban permanente" nativo, así que se usa una
// duración muy larga para representar "Inactivo".
const PERMANENT_BAN = '876000h';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  const { admin } = guard;

  const { status, role } = await req.json();

  if (status) {
    const { error } = await admin.auth.admin.updateUserById(params.id, {
      ban_duration: status === 'Inactivo' ? PERMANENT_BAN : 'none',
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (role) {
    const { error } = await admin.from('io_pro_profiles').update({ role }).eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
