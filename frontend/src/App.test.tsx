// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { AuthService } from './modules/auth/infra/AuthService';
import { Capability, type User } from './modules/auth/domain/User';

const owner: User = {
  id: 4, name: 'Ana', lastName: 'García', email: 'ana@example.com', type: 'owner',
  roles: ['owner'], capabilities: [Capability.MANAGE_PETS],
};
const pet = {
  id: 9, name: 'Miso', owner_id: 4, type: 'cat', birth_date: '2022-04-03',
  size: 'small', sex: 'female', has_passport: false,
};
const fetchMock = vi.fn<typeof fetch>();

function renderAt(path: string) {
  window.history.replaceState(null, '', path);
  return render(<BrowserRouter><App /></BrowserRouter>);
}

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (input) => {
    const url = String(input);
    if (url.endsWith('/auth/profile')) return Response.json({ user: owner });
    if (url.endsWith('/pets/9')) return Response.json(pet);
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('application route loading', () => {
  it.each([
    ['/login', 'Iniciar Sesión'],
    ['/terms', 'Términos y privacidad'],
    ['/reset-password', 'Recuperar contraseña'],
    ['/missing-route', 'Esta página no existe'],
  ])('renders a direct visit to %s', async (path, heading) => {
    renderAt(path);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(window.location.pathname).toBe(path);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('navigates between deferred public views and preserves the selected language', async () => {
    renderAt('/reset-password');
    await screen.findByRole('heading', { name: 'Recuperar contraseña' });
    // The real navbar has a switcher for desktop and another for mobile.
    fireEvent.click(screen.getAllByRole('button', { name: 'Cambiar idioma' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    fireEvent.click(screen.getByRole('link', { name: 'Back to sign in' }));
    expect(await screen.findByRole('heading', { name: 'Log In' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(localStorage.getItem('language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('restores a private deep route and locale after remounting at the same URL', async () => {
    AuthService.saveAuth('token', owner);
    localStorage.setItem('language', 'ca');
    const first = renderAt('/pets/9?source=bookmark');
    expect(await screen.findByRole('heading', { name: 'Miso' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Obre la cartilla' })).toHaveAttribute('href', '/pets/9/health');
    first.unmount();

    render(<BrowserRouter><App /></BrowserRouter>);
    expect(await screen.findByRole('heading', { name: 'Miso' })).toBeInTheDocument();
    expect(window.location.pathname + window.location.search).toBe('/pets/9?source=bookmark');
    expect(document.documentElement.lang).toBe('ca');
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/auth/profile'))).toHaveLength(2);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/pets/9'))).toHaveLength(2);
  });

  it('redirects anonymous deep links to login before loading private data', async () => {
    renderAt('/pets/9/health?tab=documents');
    expect(await screen.findByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(window.history.state.usr).toEqual({ returnTo: '/pets/9/health?tab=documents' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses validated capabilities before opening a deferred pet view', async () => {
    AuthService.saveAuth('token', owner);
    // Each request consumes its own response body.
    fetchMock.mockImplementation(async () => Response.json({ user: {
      ...owner, type: 'volunteer', roles: ['volunteer'], capabilities: [Capability.USE_CHAT],
    } }));
    renderAt('/pets/9');
    expect(await screen.findByRole('heading', { name: 'Tu perfil' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/user-profile');
    expect(screen.queryByRole('heading', { name: 'Miso' })).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.every(([url]) => String(url).endsWith('/auth/profile'))).toBe(true);
  });
});
