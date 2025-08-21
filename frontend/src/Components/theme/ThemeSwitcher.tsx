/**
 * Animated, accessible theme switcher (light ↔ dark).
 * Reusable component used across the app (e.g., NavBar).
*/

import type { FC } from 'react';
import { useTheme } from './useTheme.ts';

export type ThemeSwitcherProps = {
  className?: string;
  ariaLabelLight?: string; // label shown when switching to light
  ariaLabelDark?: string;  // label shown when switching to dark
};

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({
  className,
  ariaLabelLight = 'Cambiar a tema claro',
  ariaLabelDark = 'Cambiar a tema oscuro',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? ariaLabelLight : ariaLabelDark}
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--huellas-eggplant] ${
        isDark ? 'bg-gray-800' : 'bg-gray-300'
      } ${className ?? ''}`}
      title={isDark ? 'Dark' : 'Light'}
    >
      {/* Knob */}
      <span
        aria-hidden
        className={`pointer-events-none absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 ${
          isDark ? 'translate-x-8 bg-gray-700' : 'translate-x-0 bg-white'
        }`}
      >
        {isDark ? (
          // Moon
          <svg viewBox="0 0 24 24" className="h-4 w-4 !text-yellow-300" fill="currentColor">
            <path d="M21.64 13a1 1 0 0 0-1-.77 8 8 0 0 1-8.87-8.87 1 1 0 0 0-1.27-1A10 10 0 1 0 22.4 14.27a1 1 0 0 0-1-1.27Z"/>
          </svg>
        ) : (
          // Sun
          <svg viewBox="0 0 24 24" className="h-4 w-4 !text-yellow-500" fill="currentColor">
            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.45 14.32l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 4V1h-1v3h1zm0 19v-3h-1v3h1zM4 13H1v-1h3v1zm19 0h-3v-1h3v1zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zM19.16 6.76l1.42-1.42 1.8 1.79-1.41 1.41-1.81-1.78zM12 6a6 6 0 100 12 6 6 0 000-12z"/>
          </svg>
        )}
      </span>

      {/* Stars overlay for dark */}
      <span
        aria-hidden
        className={`absolute inset-0 overflow-hidden rounded-full transition-opacity duration-300 ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="absolute left-3 top-2 h-1 w-1 rounded-full bg-white"></span>
        <span className="absolute left-6 top-3 h-0.5 w-0.5 rounded-full bg-white"></span>
        <span className="absolute left-8 top-1.5 h-0.5 w-0.5 rounded-full bg-white"></span>
      </span>
    </button>
  );
};

export default ThemeSwitcher;