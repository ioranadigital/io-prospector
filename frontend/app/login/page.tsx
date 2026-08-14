'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2, Zap, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-zinc-950" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo iniciar sesión');
      }
      const redirectTo = searchParams?.get('from') || '/prospector';
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Zap size={24} className="text-zinc-900 dark:text-white" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">IO Prospector</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-500 mt-1">Acceso restringido · Iorana Digital</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 mb-2">
            <Lock size={16} />
            <h2 className="text-sm font-semibold">Iniciar sesión</h2>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-700 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@iorana.es"
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-100 dark:disabled:bg-blue-800 disabled:cursor-wait text-zinc-900 dark:text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center mt-4">
          Acceso en modo test · io_session_test
        </p>
      </div>
    </div>
  );
}
