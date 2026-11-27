import { flushSync } from 'react-dom';
import { useTranslation } from '../../i18n/hooks/hook';
import { useTheme } from './useTheme';
import './ThemeSwitcher.css';

// Both navigation layouts control the same document transition.
let activeReveal: ViewTransition | null = null;

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { translate } = useTranslation();
  const isDark = theme === 'dark';

  function switchAt(button: HTMLButtonElement) {
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      toggleTheme();
      return;
    }

    const root = document.documentElement;
    const { left, top, width, height } = button.getBoundingClientRect();
    root.style.setProperty('--theme-origin', `${left + width / 2}px ${top + height / 2}px`);
    root.dataset.themeReveal = '';
    const reveal = document.startViewTransition(() => flushSync(toggleTheme));
    activeReveal = reveal;
    void reveal.finished.finally(() => {
      if (activeReveal !== reveal) return;
      activeReveal = null;
      delete root.dataset.themeReveal;
      root.style.removeProperty('--theme-origin');
    });
  }

  return (
    <button className="theme-switch" type="button" role="switch" aria-checked={isDark}
      aria-label={translate('darkMode')} title={translate('darkMode')} onClick={event => switchAt(event.currentTarget)}>
      <span className="theme-switch__track" aria-hidden="true">
        <svg className="theme-switch__sky" viewBox="0 0 64 32" fill="none">
          <g className="theme-switch__clouds" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M37 12h5a3 3 0 0 1 6 0h4M46 20h9"/>
          </g>
          <g className="theme-switch__stars" fill="currentColor">
            <path d="m13 8 1.2 3 3.2 1.1-3.2 1.2-1.2 3-1.1-3-3.1-1.2 3.1-1.1Z"/>
            <circle cx="22" cy="20" r="1.2"/><circle cx="25" cy="9" r=".9"/>
          </g>
        </svg>
        <span className="theme-switch__thumb">
          <svg viewBox="0 0 24 24" fill="none">
            <g className="theme-switch__sun">
              <circle cx="12" cy="12" r="4" fill="currentColor"/>
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"
                stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/>
            </g>
            <path className="theme-switch__moon" fill="currentColor" d="M18.9 15.1A8.2 8.2 0 0 1 9 4a8.3 8.3 0 1 0 9.9 11.1Z"/>
          </svg>
        </span>
      </span>
    </button>
  );
}
