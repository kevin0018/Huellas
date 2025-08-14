/**
 * Hook to access the TranslatorContext value.
 * Throws an error when used outside of the LanguageProvider to simplify debugging.
 */

import { useContext } from 'react';
import { TranslatorContext } from '../TranslatorContext';

export function useTranslation() {
  const context = useContext(TranslatorContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}