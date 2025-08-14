import { createContext } from 'react';
import type { Language, TranslationKey } from './dictionary';

/**
 * Value contract supplied by the LanguageProvider.
 */
export interface TranslatorContextValue {
  /** Translate a key with optional `{{var}}` interpolation. */
  translate: ( key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Current active language code. */
  currentLanguage: Language;
  /** Update active language and persist it. */
  changeLanguage: (language: Language) => void;
  /** List of languages available from the dictionary. */
  availableLanguages: Language[];
}

/** Context instance; `null` by default to enforce provider usage. */
export const TranslatorContext = createContext<TranslatorContextValue | null>(
  null
);