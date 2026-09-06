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

it('switches the manifesto and team roles in place while preserving names', () => {
  render(<TestLanguageProvider><AboutUs /></TestLanguageProvider>);
  const heading = screen.getByRole('heading', { level: 1 });
  expect(screen.getByText('Son familia. Y por ahí empieza todo.')).toBeInTheDocument();
  expect(screen.getByText('Desarrollador Full-Stack')).toBeInTheDocument();
  switchLanguage('English');
  expect(heading).toHaveTextContent('More time together. Better care.');
  expect(screen.getByText('They’re family. That’s where it all begins.')).toBeInTheDocument();
  expect(screen.getByText('A better life, by your side.')).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Our Mission' })).toHaveTextContent('We know your pets are family.');
  expect(screen.getAllByText('Full-Stack Developer')).toHaveLength(4);
  switchLanguage('Català');
  expect(heading).toHaveTextContent('Més temps junts. Més cura.');
  expect(screen.getByText('Són família. I tot comença aquí.')).toBeInTheDocument();
  expect(screen.getByText('Una vida millor, al teu costat.')).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'La Nostra Visió' })).toHaveTextContent('Somiem amb un futur');
  expect(screen.getByText('Desenvolupador Full-Stack')).toBeInTheDocument();
  expect(screen.getAllByText('Desenvolupadora Full-Stack')).toHaveLength(3);
  switchLanguage('Español');
  expect(heading).toHaveTextContent('Más tiempo juntos. Más cuidado.');
  expect(screen.getByText('Una vida mejor, a tu lado.')).toBeInTheDocument();
  for (const name of ['Kevin Hernandez', 'Adriana Elias', 'Aroa Granja', 'Fernanda Montalvan']) {
    expect(screen.getByRole('heading', { name })).toBeInTheDocument();
  }
});

it('provides a main landmark and named sections without accessibility violations', async () => {
  const { container } = render(<TestLanguageProvider><AboutUs /></TestLanguageProvider>);
  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Más tiempo juntos. Más cuidado.');
  expect(screen.getAllByRole('region')).toHaveLength(3);
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
  await expectNoCriticalAccessibilityViolations(container);
});
