import './globals.css';

export const metadata = {
  title: 'IO Prospector',
  description: 'Platform de prospección SEO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans bg-zinc-950 text-zinc-100 min-h-screen flex" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
