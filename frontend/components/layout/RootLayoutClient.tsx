'use client';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="ml-60 p-8 overflow-auto min-h-screen">
        {children}
      </main>
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #3f3f46' } }}
      />
    </>
  );
}
