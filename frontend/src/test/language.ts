import { createElement, type ReactNode } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import LanguageProvider from '../i18n/LanguageProvider';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

export function TestLanguageProvider({ children }: { children: ReactNode }) {
  return createElement(LanguageProvider, null, createElement(LanguageSwitcher), children);
}

/** Exercise the production switcher without remounting the view or its provider. */
export function switchLanguage(language: 'English' | 'Español' | 'Català') {
  fireEvent.click(screen.getByRole('button', { name: /Cambiar idioma|Change language|Canvia l'idioma/ }));
  fireEvent.click(screen.getByRole('button', { name: language }));
}
