// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CTAButton from '../../Components/CTAButton';
import LanguageProvider from '../../i18n/LanguageProvider';
import AppErrorBoundary from '../errors/AppErrorBoundary';

function BrokenView(): never {
  throw new Error('render failed');
}

describe('navigation fallbacks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps internal CTA navigation inside the router', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CTAButton label="Crear cuenta" href="/register" />} />
          <Route path="/register" element={<h1>Registro</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'Crear cuenta' }));

    expect(screen.getByRole('heading', { name: 'Registro' })).toBeInTheDocument();
  });

  it('shows a localized recovery screen after an unexpected render error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <MemoryRouter>
        <LanguageProvider>
          <AppErrorBoundary>
            <BrokenView />
          </AppErrorBoundary>
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('No hemos podido mostrar esta página');
    expect(screen.getByRole('button', { name: 'Volver a intentar' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});
