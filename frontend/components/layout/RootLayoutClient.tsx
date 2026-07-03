'use client';

import { Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div />}>
        <Sidebar />
      </Suspense>
      <main className="ml-60 flex-1 min-w-0 p-8 overflow-y-auto overflow-x-hidden min-h-screen">
        {children}
      </main>
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #3f3f46' } }}
      />
    </>
  );
}
