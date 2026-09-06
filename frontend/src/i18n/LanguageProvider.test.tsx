// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageProvider from './LanguageProvider';
import { useTranslation } from './hooks/hook';

function LanguageControl() {
  const { changeLanguage, currentLanguage } = useTranslation();

  return (
    <button type="button" onClick={() => changeLanguage('ca')}>
      {currentLanguage}
    </button>
  );
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('keeps the document language aligned with the active language', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageControl />
      </LanguageProvider>
    );

    expect(document.documentElement.lang).toBe('es');

    await user.click(screen.getByRole('button', { name: 'es' }));

    expect(document.documentElement.lang).toBe('ca');
    expect(localStorage.getItem('language')).toBe('ca');
  });
});
