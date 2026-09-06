// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  const user = userEvent.setup();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ellos dejan huella.');
  expect(screen.getAllByRole('tab')).toHaveLength(3);
  expect(screen.getByRole('link', { name: 'Empieza ahora' })).toHaveAttribute('href', '/register');
  expect(screen.getByRole('link', { name: 'Conoce al Equipo' })).toHaveAttribute('href', '/about');
  await user.click(screen.getByRole('tab', { name: 'Lo que viene' }));
  switchLanguage('English');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('They leave pawprints.');
  expect(screen.getByRole('heading', { name: 'Know what comes next' })).toBeInTheDocument();
  switchLanguage('Català');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ells deixen petjada.');
  expect(screen.getByRole('heading', { name: 'Mira què ve després' })).toBeInTheDocument();
  await expectNoCriticalAccessibilityViolations(container);
});

it('lets keyboard users explore the notebook and keeps focus on the selected tab', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><TestLanguageProvider><HomePage /></TestLanguageProvider></MemoryRouter>);
  screen.getByRole('tab', { name: 'Tu mascota' }).focus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Su cartilla' })).toHaveFocus();
  expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Su cartilla');
  expect(screen.getByRole('heading', { name: 'Guarda su historia' })).toBeVisible();
  await user.keyboard('{End}{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Tu mascota' })).toHaveFocus();
  await user.keyboard('{ArrowLeft}');
  expect(screen.getByRole('tab', { name: 'Lo que viene' })).toHaveFocus();
  await user.keyboard('{Home}{Tab}');
  expect(screen.getByRole('tabpanel', { name: 'Tu mascota' })).toHaveFocus();
});
