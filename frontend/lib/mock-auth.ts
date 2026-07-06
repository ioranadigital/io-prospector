// ============================================================================
// MODO TEST — AUTENTICACIÓN Y USUARIOS SIMULADOS
// ============================================================================
// Este módulo concentra TODOS los datos mockeados del sistema de acceso.
// Activo mientras process.env.NEXT_PUBLIC_AUTH_MODE === 'test'.
//
// PARA REEMPLAZAR POR SUPABASE AUTH (siguiente paso):
//   1. Borrar MOCK_ADMIN_CREDENTIALS y la validación en
//      app/api/auth/login/route.ts (usar supabase.auth.signInWithPassword).
//   2. Sustituir getMockUsers/saveMockUsers (localStorage) por queries a una
//      tabla `io_pro_users` en Supabase (o supabase.auth.admin.listUsers()).
//   3. Sustituir la cookie `io_session_test` en middleware.ts por la cookie
//      real de sesión de Supabase (sb-access-token / @supabase/ssr).
//   4. Eliminar NEXT_PUBLIC_AUTH_MODE y esta bandera de next.config.js una
//      vez el login real esté en producción.
// ============================================================================

export const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE || 'test';
export const SESSION_COOKIE_NAME = 'io_session_test';

// Credenciales de administrador en modo test — SOLO para desarrollo local.
export const MOCK_ADMIN_CREDENTIALS = {
  email: 'admin@iorana.es',
  password: 'IoranaAdmin2026!',
};

export type MockUserRole = 'Admin' | 'Editor' | 'Viewer';
export type MockUserStatus = 'Activo' | 'Inactivo';

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: MockUserRole;
  status: MockUserStatus;
};

const STORAGE_KEY = 'io_prospector_mock_users';

const SEED_USERS: MockUser[] = [
  { id: '1', name: 'Rivarela Admin', email: 'admin@iorana.es', role: 'Admin', status: 'Activo' },
  { id: '2', name: 'Ana García', email: 'ana.garcia@iorana.es', role: 'Editor', status: 'Activo' },
  { id: '3', name: 'Carlos Ruiz', email: 'carlos.ruiz@iorana.es', role: 'Viewer', status: 'Inactivo' },
];

// Lee la lista de usuarios simulados desde localStorage, sembrando datos
// de ejemplo la primera vez que se accede.
export function getMockUsers(): MockUser[] {
  if (typeof window === 'undefined') return SEED_USERS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  try {
    return JSON.parse(raw) as MockUser[];
  } catch {
    return SEED_USERS;
  }
}

export function saveMockUsers(users: MockUser[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
