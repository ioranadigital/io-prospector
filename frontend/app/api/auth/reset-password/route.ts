import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Reset password debug:', {
      urlPresent: !!supabaseUrl,
      keyPresent: !!supabaseServiceRoleKey,
      keyLength: supabaseServiceRoleKey?.length,
    });

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Supabase config missing:', { supabaseUrl: !!supabaseUrl, supabaseServiceRoleKey: !!supabaseServiceRoleKey });
      return NextResponse.json({ error: 'Configuración de Supabase incompleta' }, { status: 500 });
    }

    // Primero, obtener el ID del usuario por email
    const getUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!getUserResponse.ok) {
      const errorDetails = await getUserResponse.json().catch(() => ({}));
      console.error('Get user error:', { status: getUserResponse.status, errorDetails });
      return NextResponse.json({ error: 'Usuario no encontrado', details: errorDetails }, { status: 404 });
    }

    const usersData = await getUserResponse.json();
    if (!usersData.users || usersData.users.length === 0) {
      console.error('No users found for email:', email);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userId = usersData.users[0].id;

    // Actualizar la contraseña del usuario
    const updateResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      console.error('Error updating password:', errorData);
      return NextResponse.json({ error: 'No se pudo actualizar la contraseña' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Error al resetear la contraseña' }, { status: 500 });
  }
}
