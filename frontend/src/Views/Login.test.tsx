// @vitest-environment jsdom

import { randomUUID } from 'node:crypto';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestLanguageProvider, switchLanguage } from '../test/language';
import { authActions } from '../features/auth/authActions';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';
import Login from './Login';
import { ApiError } from '../shared/api/apiClient';

vi.mock('../Components/NavBar', () => ({ default: () => <nav aria-label="Principal" /> }));
vi.mock('../Components/GoBackButton', () => ({ default: () => null }));
vi.mock('../features/auth/authActions', () => ({
  authActions: { login: vi.fn() },
}));

function renderLogin(initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TestLanguageProvider>
        <Login />
      </TestLanguageProvider>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  afterEach(cleanup);

  it('associates each label and exposes the expected autocomplete purpose', async () => {
    const { container } = renderLogin();

    expect(container.querySelector('.form-page__content')).toHaveClass('form-page__content--compact');
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo Electrónico')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toHaveClass('ui-button');
    await expectNoCriticalAccessibilityViolations(container);
  });

  it('announces an authentication error and associates it with both controls', async () => {
    const user = userEvent.setup();
    vi.mocked(authActions.login).mockRejectedValue(new Error('Unauthorized'));
    renderLogin();

    const email = screen.getByLabelText('Correo Electrónico');
    const password = screen.getByLabelText('Contraseña');
    await user.type(email, 'ana@example.com');
    await user.type(password, 'incorrecta');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Correo o contraseña incorrectos');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Correo o contraseña incorrectos');
    expect(password).toHaveAccessibleDescription('Correo o contraseña incorrectos');

    await user.type(password, 'a');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(email).not.toHaveAttribute('aria-invalid');
    expect(password).not.toHaveAttribute('aria-invalid');
  });

  it('exposes and blocks the loading state while authentication is pending', async () => {
    const user = userEvent.setup();
    let resolveLogin!: (value: Awaited<ReturnType<typeof authActions.login>>) => void;
    vi.mocked(authActions.login).mockImplementation(() => new Promise(resolve => {
      resolveLogin = resolve;
    }));
    renderLogin();

    await user.type(screen.getByLabelText('Correo Electrónico'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'secreto');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    const submit = screen.getByRole('button', { name: 'Cargando...' });
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute('aria-busy', 'true');
    expect(authActions.login).toHaveBeenCalledWith('ana@example.com', 'secreto');

    resolveLogin({
      token: 'token',
      user: {
        id: 1,
        name: 'Ana',
        lastName: 'García',
        email: 'ana@example.com',
        type: 'owner',
      },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeEnabled());
  });

  it('distinguishes a temporary login limit from invalid credentials', async () => {
    const user = userEvent.setup();
    vi.mocked(authActions.login).mockRejectedValue(new ApiError('Too many login attempts. Try again later.', 429));
    renderLogin();

    await user.type(screen.getByLabelText('Correo Electrónico'), 'juan@email.com');
    await user.type(screen.getByLabelText('Contraseña'), randomUUID());
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos de acceso');
  });
});

describe('login error language changes', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });
  afterEach(cleanup);

  it.each([
    [new ApiError('Unauthorized', 401), 'Invalid email or password'],
    [new ApiError('Too many attempts', 429), 'Too many login attempts. Wait a few minutes and try again.'],
  ])('updates a visible authentication error without resubmitting', async (failure, english) => {
    const user = userEvent.setup();
    vi.mocked(authActions.login).mockRejectedValue(failure);
    renderLogin();
    await user.type(screen.getByLabelText('Correo Electrónico'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    await screen.findByRole('alert');
    switchLanguage('English');
    expect(screen.getByRole('alert')).toHaveTextContent(english);
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(english);
    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com');
    expect(authActions.login).toHaveBeenCalledOnce();
  });
});
