// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../modules/auth/infra/AuthService';
import { apiClient } from '../../shared/api/apiClient';
import ProtectedRoute from './ProtectedRoute';
import { TestLanguageProvider, switchLanguage } from '../../test/language';

vi.mock('../../modules/auth/infra/AuthService', () => ({
  AuthService: {
    getToken: vi.fn(),
    saveAuth: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('../../shared/api/apiClient', () => ({
  apiClient: { get: vi.fn() },
}));

function renderRoute() {
  return render(
    <TestLanguageProvider><MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route path="/login" element={<p>Login</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/private" element={<p>Private</p>} />
        </Route>
      </Routes>
    </MemoryRouter></TestLanguageProvider>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => { cleanup(); localStorage.clear(); });

  it('redirects before rendering private content when there is no token', async () => {
    vi.mocked(AuthService.getToken).mockReturnValue(null);
    renderRoute();

    expect(await screen.findByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Private')).not.toBeInTheDocument();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('renders private content only after the backend validates the session', async () => {
    vi.mocked(AuthService.getToken).mockReturnValue('token');
    vi.mocked(apiClient.get).mockResolvedValue({ user: { id: 1, name: 'Ana' } });
    renderRoute();

    expect(screen.getByText('Comprobando sesión…')).toBeInTheDocument();
    expect(await screen.findByText('Private')).toBeInTheDocument();
    expect(AuthService.saveAuth).toHaveBeenCalledWith('token', expect.objectContaining({ id: 1 }));
  });

  it('clears an invalid session and redirects to login', async () => {
    vi.mocked(AuthService.getToken).mockReturnValue('expired');
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Unauthorized'));
    renderRoute();

    await waitFor(() => expect(AuthService.logout).toHaveBeenCalled());
    expect(await screen.findByText('Login')).toBeInTheDocument();
  });
});

it('switches the pending session message without repeating validation', async () => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(AuthService.getToken).mockReturnValue('token');
  vi.mocked(apiClient.get).mockReturnValue(new Promise(() => {}));
  renderRoute();
  expect(screen.getByText('Comprobando sesión…')).toBeInTheDocument();
  switchLanguage('English');
  expect(screen.getByText('Checking session…')).toBeInTheDocument();
  switchLanguage('Català');
  expect(screen.getByText('Comprovant la sessió…')).toBeInTheDocument();
  expect(apiClient.get).toHaveBeenCalledOnce();
  cleanup();
  localStorage.clear();
});
