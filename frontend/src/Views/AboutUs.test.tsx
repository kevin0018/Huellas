// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TestLanguageProvider, switchLanguage } from '../test/language';
import AboutUs from './AboutUs';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';

vi.mock('../Components/NavBar', () => ({ default: () => null }));
vi.mock('../Components/footer', () => ({ default: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); });

it('switches team roles while preserving names', () => {
  render(<TestLanguageProvider><AboutUs /></TestLanguageProvider>);
  expect(screen.getByText('Desarrollador Full-Stack')).toBeInTheDocument();
  switchLanguage('English');
  expect(screen.getAllByText('Full-Stack Developer')).toHaveLength(4);
  switchLanguage('Català');
  expect(screen.getByText('Desenvolupador Full-Stack')).toBeInTheDocument();
  expect(screen.getAllByText('Desenvolupadora Full-Stack')).toHaveLength(3);
  expect(screen.getByText('Kevin Hernandez')).toBeInTheDocument();
});

it('provides a main landmark and named sections without accessibility violations', async () => {
  const { container } = render(<TestLanguageProvider><AboutUs /></TestLanguageProvider>);
  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Más tiempo juntos. Más cuidado.');
  expect(screen.getAllByRole('region')).toHaveLength(3);
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
  await expectNoCriticalAccessibilityViolations(container);
});
