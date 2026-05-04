'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen flex`}>
        <Sidebar />
        <main className="flex-1 ml-60 p-8 overflow-auto min-h-screen">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #3f3f46' } }}
        />
      </body>
    </html>
  );
}
