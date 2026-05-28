'use client';

// Global error boundary is handled at app/global-error.tsx (root level)
// This file intentionally left minimal to avoid layout inheritance issues
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Error</h2>
      <button onClick={() => reset()}>Reintentar</button>
    </div>
  );
}
