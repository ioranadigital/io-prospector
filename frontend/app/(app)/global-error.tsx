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
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>Error Critical</h1>
          <p>Algo salió muy mal</p>
          <button onClick={() => reset()}>Reintentar</button>
        </div>
      </body>
    </html>
  );
}
