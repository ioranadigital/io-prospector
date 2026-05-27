'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Algo salió mal</h2>
      <button onClick={() => reset()}>Intentar de nuevo</button>
    </div>
  );
}
