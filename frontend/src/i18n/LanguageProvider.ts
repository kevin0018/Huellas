import { useState, createElement, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { translations, type Language, type TranslationKey} from './dictionary';
import { TranslatorContext } from './TranslatorContext';

/** Safely read initial language; tolerates SSR and privacy modes. */
function readInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem('language');
    if (stored && stored in translations) return stored as Language;
  } catch {
    // ignore storage access errors
  }
  return 'en';
}

/** Safely persist language; tolerates SSR and privacy modes. */
function writeLanguage(lang: Language): void {
  try {
    localStorage.setItem('language', lang);
  } catch {
    // ignore storage write errors
  }
}

/** Props for the LanguageProvider component. */
type LanguageProviderProps = {
  children: ReactNode;
};

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    () => readInitialLanguage()
  );

  /** Change language and persist to storage. */
  const changeLanguage = useCallback((language: Language) => {
    setCurrentLanguage(language);
    writeLanguage(language);
  }, []);

  /** Translate keys for the current language with optional interpolation. */
  const translate = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let raw = translations[currentLanguage][key] ?? String(key);
      if (!vars) return raw;
      // Use simple split-join interpolation for readability.
      for (const [k, v] of Object.entries(vars)) {
        raw = raw.split(`{{${k}}}`).join(String(v));
      }
      return raw;
    },
    [currentLanguage]
  );

  /** Cache available languages to avoid re-computation. */
  const availableLanguages = useMemo(
    () => Object.keys(translations) as Language[],
    []
  );

  /** Stable context value for consumers. */
  const contextValue = useMemo(
    () => ({
      translate,
      currentLanguage,
      changeLanguage,
      availableLanguages,
    }),
    [translate, currentLanguage, changeLanguage, availableLanguages]
  );

  // Avoid JSX usage in .ts files.
  return createElement(TranslatorContext.Provider, { value: contextValue }, children);
};

export default LanguageProvider;