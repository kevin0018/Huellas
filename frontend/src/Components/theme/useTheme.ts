/**
 * Hook to access the ThemeContext value.
 * Throws an error when used outside of the ThemeProvider to simplify debugging.
*/

import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}