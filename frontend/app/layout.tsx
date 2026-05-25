import { Inter } from 'next/font/google';
import './globals.css';
import { RootLayoutClient } from '@/components/layout/RootLayoutClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'IO Prospector',
  description: 'Platform de prospección SEO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen flex`} suppressHydrationWarning>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
