'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ textAlign: 'center', padding: '2rem', background: '#09090b', color: '#f4f4f5', minHeight: '100vh' }}>
          <h1>Error crítico</h1>
          <p>Algo salió muy mal</p>
          <button onClick={() => reset()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
