/**
 * Theme context and types.
 * Provides light/dark preference and controls.
*/

import { createContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  /** Stored user preference (light | dark). */
  theme: Theme;
  /** Set explicit theme preference. */
  setTheme: (theme: Theme) => void;
  /** Toggle preference: light ↔ dark. */
  toggleTheme: () => void;
  /** Available preferences. */
  availableThemes: Theme[];
}

/** Context instance; `null` by default to enforce provider usage. */
export const ThemeContext = createContext<ThemeContextValue | null>(null);