import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Verifica que la petición viene de un usuario autenticado con rol Admin
// en io_pro_profiles. Usado por todas las rutas de /api/admin/*.
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
  }

  // Se usa el cliente admin (service role) para leer el perfil: evita
  // depender de que la policy RLS de SELECT esté bien alineada con esta ruta.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('io_pro_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'Admin') {
    return { error: NextResponse.json({ error: 'Requiere rol Admin' }, { status: 403 }) };
  }

  return { user, admin };
}
