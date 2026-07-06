-- ============================================
-- io_pro_profiles — perfiles de usuario (rol) para el panel de acceso
-- Complementa auth.users (Supabase Auth ya gestiona email/password/estado
-- de baneo). Esta tabla solo añade el rol de aplicación.
-- ============================================

CREATE TABLE IF NOT EXISTS io_pro_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Admin', 'Editor', 'Viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE io_pro_profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario autenticado puede leer (solo) su propio perfil.
-- Todas las escrituras (crear/editar rol/banear) pasan por /api/admin/users
-- usando la Service Role Key, que ignora RLS.
CREATE POLICY "profiles_select_own" ON io_pro_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Crea automáticamente un perfil (rol Viewer por defecto) al registrarse
-- un nuevo usuario en auth.users.
-- SET search_path es obligatorio: SECURITY DEFINER no hereda el search_path
-- del contexto de GoTrue, y sin él la referencia a io_pro_profiles no
-- resuelve (el alta de usuario falla con "Database error creating new user").
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.io_pro_profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'Viewer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
