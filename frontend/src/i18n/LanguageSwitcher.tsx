// src/i18n/LanguageSwitcher.tsx
/**
 * Language switcher showing flag IMAGES from /public/media/flags instead of strings.
 * Uses a small custom dropdown because native <select> cannot render images in <option>.
 * Why: Keeps your original provider/hook wiring; no UI libraries required.
 */

import type { FC, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from './hooks/hook';
import type { Language } from './dictionary';

const FLAGS_BASE = '/media/flags'; // public path

const LABEL_BY_LANG: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  ca: 'Català',
};

const SRC_BY_LANG: Record<Language, string> = {
  en: `${FLAGS_BASE}/en.png`,
  es: `${FLAGS_BASE}/es.png`,
  ca: `${FLAGS_BASE}/ca.png`, // Catalan (use your preferred asset)
};

const LanguageSwitcher: FC<{ className?: string }> = ({ className }) => {
  const { currentLanguage, changeLanguage, availableLanguages } = useTranslation();

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Sync active index with current value when menu opens
  useEffect(() => {
    if (open) {
      const idx = Math.max(0, availableLanguages.indexOf(currentLanguage));
      setActiveIdx(idx);
      // focus the active item for keyboard users
      requestAnimationFrame(() => itemRefs.current[idx]?.focus());
    }
  }, [open, availableLanguages, currentLanguage]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        !listRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const selectLang = (lang: Language) => {
    changeLanguage(lang);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const len = availableLanguages.length;
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => {
        const ni = (i + 1) % len;
        requestAnimationFrame(() => itemRefs.current[ni]?.focus());
        return ni;
      });
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => {
        const ni = (i - 1 + len) % len;
        requestAnimationFrame(() => itemRefs.current[ni]?.focus());
        return ni;
      });
    }
  };

  return (
    <div className={`relative inline-block ${className ?? ''}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
      >
        <img
          src={SRC_BY_LANG[currentLanguage]}
          alt=""
          className="h-5 w-5 rounded-sm"
        />
        <span className="sr-only">{LABEL_BY_LANG[currentLanguage]}</span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Languages"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className="absolute right-0 z-50 min-w-[10rem] rounded-md border bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-900"
        >
          {availableLanguages.map((lang, i) => (
            <li key={lang} role="option" aria-selected={lang === currentLanguage}>
              <button
                ref={(el) => { itemRefs.current[i] = el; }}
                type="button"
                onClick={() => selectLang(lang)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-neutral-100 focus:bg-neutral-100 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 ${
                  i === activeIdx ? 'ring-1 ring-neutral-300 dark:ring-neutral-700' : ''
                }`}
              >
                <img src={SRC_BY_LANG[lang]} alt="" className="h-5 w-5 rounded-sm" />
                <span>{LABEL_BY_LANG[lang]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;