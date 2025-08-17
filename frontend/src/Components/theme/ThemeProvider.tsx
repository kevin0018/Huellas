/**
 * Theme context provider.
 * - Stores user preference: 'light' | 'dark'.
 * - Applies `.dark` on <html> when theme is 'dark' (Tailwind v4 compatible).
*/

import { createElement, useCallback, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext, type Theme } from './ThemeContext';

const STORAGE_KEY = 'theme';
const AVAILABLE_THEMES: Theme[] = ['light', 'dark'];

/** Safely read initial theme preference; tolerates SSR and privacy modes. */
function readInitialTheme(defaultTheme: Theme = 'light'): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore storage access errors
  }
  return defaultTheme;
}

/** Safely persist theme preference; tolerates SSR and privacy modes. */
function writeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore storage write errors
  }
}

export type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme; // optional override for first render
  persist?: boolean; // disable to avoid touching storage (e.g., during tests)
};

const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  persist = true,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => readInitialTheme(defaultTheme));

  // Sync the <html> class so Tailwind v4 `dark:` utilities respond globally
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  /** Set preference and persist to storage. */
  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      if (persist) writeTheme(next);
    },
    [persist]
  );

  /** Toggle preference: light ↔ dark. */
  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      if (persist) writeTheme(next);
      return next;
    });
  }, [persist]);

  /** Stable context value. */
  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, availableThemes: AVAILABLE_THEMES }),
    [theme, setTheme, toggleTheme]
  );

  return createElement(ThemeContext.Provider, { value }, children);
};

export default ThemeProvider;