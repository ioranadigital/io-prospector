import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';

export const metadata = {
  title: 'IO Prospector',
  description: 'Platform de prospección SEO',
};

// Se decide la clase "dark" antes de que React hidrate — si esto se hiciera
// solo desde ThemeProvider (useEffect), se vería un parpadeo del tema
// equivocado en cada carga mientras React arranca.
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('io-prospector-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen flex" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
