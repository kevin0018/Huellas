// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { TestLanguageProvider, switchLanguage } from '../test/language';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';
import HomePage from './HomePage';

vi.mock('../Components/NavBar', () => ({ default: () => null }));
vi.mock('../Components/footer', () => ({ default: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); });

it('presents care steps and working calls to action in all three languages', async () => {
  const { container } = render(<MemoryRouter><TestLanguageProvider><HomePage /></TestLanguageProvider></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Su bienestar, en un mismo lugar.');
  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(screen.getByRole('link', { name: 'Empieza ahora' })).toHaveAttribute('href', '/register');
  expect(screen.getByRole('link', { name: 'Conoce al Equipo' })).toHaveAttribute('href', '/about');
  switchLanguage('English');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Their wellbeing, all in one place.');
  expect(screen.getByRole('heading', { name: 'Know what comes next' })).toBeInTheDocument();
  switchLanguage('Català');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('El seu benestar, en un mateix lloc.');
  expect(screen.getByRole('heading', { name: 'Mira què ve després' })).toBeInTheDocument();
  await expectNoCriticalAccessibilityViolations(container);
});
