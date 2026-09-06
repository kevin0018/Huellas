// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ReminderFeed } from '../composition/applicationServices';
import { TestLanguageProvider, switchLanguage } from '../test/language';
import UserHome from './UserHome';

const services = vi.hoisted(() => ({
  pets: { getUserPets: vi.fn() },
  reminders: { list: vi.fn(), action: vi.fn(), preferences: vi.fn() },
}));
vi.mock('../composition/applicationServices', () => ({ applicationServices: services }));
vi.mock('../modules/auth/infra/AuthService', () => ({ AuthService: {
  isAuthenticated: () => true,
  getUser: () => ({ id: 1, name: 'María', lastName: 'García', email: 'maria@example.com', type: 'owner' }),
} }));
vi.mock('../Components/NavBar', () => ({ default: () => null }));
vi.mock('../Components/footer', () => ({ default: () => null }));

const feed: ReminderFeed = {
  preferences: { enabled: true, leadDays: 7 },
  reminders: [{ id: 1, petId: 9, petName: 'Miso', source: 'PREVENTIVE_PLAN', title: 'Revisión de Miso',
    dueAt: '2026-09-18T12:00:00.000Z', status: 'PENDING', notifyNow: true }],
};

beforeEach(() => {
  vi.resetAllMocks();
  services.pets.getUserPets.mockResolvedValue([{ id: 9, name: 'Miso', type: 'cat' }]);
  services.reminders.list.mockResolvedValue(feed);
});
afterEach(() => { cleanup(); localStorage.clear(); });

function renderHome() {
  return render(<TestLanguageProvider><MemoryRouter><UserHome /></MemoryRouter></TestLanguageProvider>);
}

it('switches reminders, dates, pet cards and actions without reloading the dashboard', async () => {
  renderHome();
  expect(await screen.findByRole('heading', { name: '1 cuidado necesita tu atención' })).toBeInTheDocument();
  switchLanguage('English');
  expect(screen.getByRole('heading', { name: '1 care task needs your attention' })).toBeInTheDocument();
  expect(screen.getByText('18 September 2026')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: "Open Miso's profile" })).toHaveAttribute('href', '/pets/9');
  expect(screen.getByText('Cat')).toBeInTheDocument();
  expect(screen.getByRole('option', { name: '7 days' })).toBeInTheDocument();
  expect(screen.getByText('Revisión de Miso')).toBeInTheDocument();

  switchLanguage('Català');
  expect(screen.getByRole('heading', { name: '1 cura necessita la teva atenció' })).toBeInTheDocument();
  expect(screen.getByText(/18 de setembre del? 2026/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Obre el perfil de Miso' })).toBeInTheDocument();
  expect(screen.getByText('Gat')).toBeInTheDocument();
  expect(services.reminders.list).toHaveBeenCalledOnce();
  expect(services.pets.getUserPets).toHaveBeenCalledOnce();

  services.reminders.action.mockResolvedValue(undefined);
  services.reminders.list.mockResolvedValue({ ...feed, reminders: [] });
  fireEvent.click(screen.getByRole('button', { name: 'Completa' }));
  await waitFor(() => expect(services.reminders.action).toHaveBeenCalledWith(1, 'complete', undefined));
  await screen.findByText(/No hi ha accions pendents/);
  switchLanguage('English');
  expect(screen.getByText(/There are no pending actions/)).toBeInTheDocument();
});

it('localizes plural priorities and paused and empty dashboard states', async () => {
  services.pets.getUserPets.mockResolvedValue([]);
  services.reminders.list.mockResolvedValue({ ...feed, reminders: [
    ...feed.reminders, { ...feed.reminders[0], id: 2, petId: 10, petName: 'Luna' },
  ] });
  renderHome();
  await screen.findByRole('heading', { name: '2 cuidados necesitan tu atención' });
  switchLanguage('English');
  expect(screen.getByRole('heading', { name: '2 care tasks need your attention' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: "You don't have any pets yet" })).toBeInTheDocument();

  services.reminders.preferences.mockResolvedValue(undefined);
  services.reminders.list.mockResolvedValue({ preferences: { enabled: false, leadDays: 7 }, reminders: [] });
  fireEvent.click(screen.getByRole('checkbox', { name: 'In-app notifications' }));
  await screen.findByText(/Reminders are paused/);
  expect(services.reminders.preferences).toHaveBeenCalledWith(false, 7);
  switchLanguage('Català');
  expect(screen.getByText(/Els recordatoris estan pausats/)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Encara no tens mascotes' })).toBeInTheDocument();
});
