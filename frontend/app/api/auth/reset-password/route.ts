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

    console.log('Reset config:', { url: !!supabaseUrl, key: !!supabaseServiceRoleKey });

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Supabase config missing');
      return NextResponse.json({ error: 'Configuración de Supabase incompleta' }, { status: 500 });
    }

    // Obtener todos los usuarios y filtrar por email
    console.log(`Buscando usuario: ${email}`);
    const allUsersUrl = `${supabaseUrl}/auth/v1/admin/users`;
    console.log(`URL: ${allUsersUrl}`);

    const allUsersResponse = await fetch(allUsersUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'apikey': supabaseServiceRoleKey,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Get users response status: ${allUsersResponse.status}`);
    const allUsersData = await allUsersResponse.json();

    if (!allUsersResponse.ok) {
      console.error('Error getting users:', allUsersData);
      return NextResponse.json({ error: 'Error al conectar con Supabase' }, { status: 500 });
    }

    // Filtrar por email
    const user = allUsersData.users?.find((u: any) => u.email === email);
    if (!user) {
      console.error('User not found:', email);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userId = user.id;
    console.log(`User found: ${userId}`);

    // Actualizar contraseña
    const updateUrl = `${supabaseUrl}/auth/v1/admin/users/${userId}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        'apikey': supabaseServiceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    });

    console.log(`Update response status: ${updateResponse.status}`);
    const updateData = await updateResponse.json();
    console.log(`Update response:`, updateData);

    if (!updateResponse.ok) {
      console.error('Error updating password:', updateData);
      return NextResponse.json({ error: 'No se pudo actualizar la contraseña' }, { status: 500 });
    }

    console.log('Password updated successfully');
    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Error al resetear la contraseña' }, { status: 500 });
  }
}
