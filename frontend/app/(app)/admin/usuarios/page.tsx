'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, ArrowLeft, ShieldCheck, ShieldOff, X, Loader2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

type UserRole = 'Admin' | 'Editor' | 'Viewer';
type UserStatus = 'Activo' | 'Inactivo';
type AppUser = { id: string; name: string; email: string; role: UserRole; status: UserStatus };

const ROLE_STYLES: Record<UserRole, string> = {
  Admin: 'bg-blue-900/30 text-blue-300 border-blue-800',
  Editor: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
  Viewer: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error((await res.json()).error || 'Error al cargar usuarios');
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (user: AppUser) => {
    const nextStatus: UserStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Error al actualizar');
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      toast.success(`${user.name}: acceso ${nextStatus === 'Activo' ? 'activado' : 'revocado'}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreated = (user: AppUser) => {
    setUsers(prev => [...prev, user]);
    setModalOpen(false);
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <Link href="/admin" className="text-xs text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1 mb-2">
          <ArrowLeft size={13} /> Administración
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users size={22} className="text-white" /> Gestión de Usuarios
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Supabase Auth · roles en io_pro_profiles</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <Plus size={16} /> Añadir Usuario
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-zinc-500 gap-2">
            <Loader2 size={18} className="animate-spin" /> Cargando usuarios...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-3.5 text-white font-medium">{user.name}</td>
                  <td className="px-6 py-3.5 text-zinc-400">{user.email}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-xs px-2 py-1 rounded border ${ROLE_STYLES[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        user.status === 'Activo'
                          ? 'bg-green-900/20 text-green-400 border-green-800'
                          : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => toggleStatus(user)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        user.status === 'Activo'
                          ? 'bg-red-900/20 hover:bg-red-900/40 text-red-300'
                          : 'bg-green-900/20 hover:bg-green-900/40 text-green-300'
                      }`}
                    >
                      {user.status === 'Activo' ? (
                        <>
                          <ShieldOff size={13} /> Revocar
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={13} /> Activar
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No hay usuarios registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && <AddUserModal onClose={() => setModalOpen(false)} onCreated={handleCreated} />}
    </div>
  );
}

function AddUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: AppUser) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Viewer');
  const [saving, setSaving] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el usuario');
      setTempPassword(data.tempPassword);
      onCreated(data.user);
      toast.success('Usuario creado en Supabase Auth');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyPassword = () => {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    toast.success('Contraseña copiada');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {tempPassword ? (
        <div
          onClick={e => e.stopPropagation()}
          className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">Usuario creado</h3>
          <p className="text-sm text-zinc-400">
            Comparte esta contraseña temporal con el usuario — no volverá a mostrarse.
          </p>
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3">
            <code className="flex-1 text-sm text-white font-mono break-all">{tempPassword}</code>
            <button onClick={copyPassword} className="text-zinc-400 hover:text-white flex-shrink-0">
              <Copy size={16} />
            </button>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          onClick={e => e.stopPropagation()}
          className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Añadir Usuario</h3>
            <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nombre</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@iorana.es"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Rol</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
