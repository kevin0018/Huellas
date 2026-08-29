// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LanguageProvider from '../i18n/LanguageProvider';
import { authActions } from '../features/auth/authActions';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';
import Login from './Login';

vi.mock('../Components/NavBar', () => ({ default: () => <nav aria-label="Principal" /> }));
vi.mock('../Components/GoBackButton', () => ({ default: () => null }));
vi.mock('../features/auth/authActions', () => ({
  authActions: { login: vi.fn() },
}));

function renderLogin(initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LanguageProvider>
        <Login />
      </LanguageProvider>
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
});
