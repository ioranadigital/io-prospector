'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'io-prospector-theme';

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

// El <html> ya llega con la clase correcta antes de hidratar (ver el script
// inline en app/layout.tsx), así que aquí solo hace falta reflejar ese mismo
// estado en React sin volver a tocar el DOM en el primer render (evita el
// flash de tema equivocado).
function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
