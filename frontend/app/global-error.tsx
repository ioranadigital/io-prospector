'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="font-sans bg-zinc-950 text-zinc-100 min-h-screen flex items-center justify-center">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Algo salió mal</h2>
          <button onClick={() => reset()}>Intentar de nuevo</button>
        </div>
      </body>
    </html>
  );
}
