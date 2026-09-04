// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LanguageProvider from '../i18n/LanguageProvider';
import AnuncioCard from './AnuncioCard';

describe('AnuncioCard', () => {
  beforeEach(() => {
    localStorage.setItem('language', 'en');
  });

  afterEach(cleanup);

  it('uses the shared category and action translations', () => {
    render(
      <LanguageProvider>
        <AnuncioCard
          title="Morning walk"
          author="Ada Lovelace"
          description="Help Nala get her exercise."
          category="WALKING_EXERCISE"
          onOpenChat={vi.fn()}
          onDelete={vi.fn()}
        />
      </LanguageProvider>,
    );

    expect(screen.getByText('Walks and exercise')).toBeInTheDocument();
    expect(screen.getByText('Published by Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
