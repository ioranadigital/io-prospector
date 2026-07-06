'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, ArrowLeft, ShieldCheck, ShieldOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMockUsers,
  saveMockUsers,
  type MockUser,
  type MockUserRole,
} from '@/lib/mock-auth';

const ROLE_STYLES: Record<MockUserRole, string> = {
  Admin: 'bg-blue-900/30 text-blue-300 border-blue-800',
  Editor: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
  Viewer: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setUsers(getMockUsers());
  }, []);

  const persist = (next: MockUser[]) => {
    setUsers(next);
    saveMockUsers(next);
  };

  const toggleStatus = (id: string) => {
    const next = users.map(u =>
      u.id === id ? { ...u, status: u.status === 'Activo' ? 'Inactivo' as const : 'Activo' as const } : u
    );
    persist(next);
    const target = next.find(u => u.id === id);
    toast.success(`${target?.name}: acceso ${target?.status === 'Activo' ? 'activado' : 'revocado'}`);
  };

  const addUser = (user: Omit<MockUser, 'id'>) => {
    const next = [...users, { ...user, id: crypto.randomUUID() }];
    persist(next);
    setModalOpen(false);
    toast.success('Usuario añadido (modo test)');
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
            <p className="text-zinc-400 text-sm mt-1">
              Modo test · datos simulados (localStorage), ver <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">lib/mock-auth.ts</code>
            </p>
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
                    onClick={() => toggleStatus(user.id)}
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
      </div>

      {modalOpen && <AddUserModal onClose={() => setModalOpen(false)} onSave={addUser} />}
    </div>
  );
}

function AddUserModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (user: Omit<MockUser, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MockUserRole>('Viewer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({ name: name.trim(), email: email.trim(), role, status: 'Activo' });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
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
            onChange={e => setRole(e.target.value as MockUserRole)}
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
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
