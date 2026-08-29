// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LanguageProvider from '../i18n/LanguageProvider';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';
import Register from './Register';
import { registerUser } from '../features/registration/registerUser';

vi.mock('../features/registration/registerUser', () => ({ registerUser: vi.fn() }));
vi.mock('../Components/NavBar', () => ({ default: () => <nav aria-label="Navegación principal" /> }));
vi.mock('../Components/GoBackButton', () => ({ default: () => <button type="button">Volver</button> }));

const mockedRegisterUser = vi.mocked(registerUser);

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <LanguageProvider>
        <Register />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

async function completeRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Ada');
  await user.type(screen.getByRole('textbox', { name: 'Apellido' }), 'Lovelace');
  await user.type(screen.getByRole('textbox', { name: 'Correo Electrónico' }), 'ada@example.com');
  await user.type(screen.getByLabelText('Contraseña'), 'safe-password');
}

beforeEach(() => {
  localStorage.setItem('language', 'es');
  mockedRegisterUser.mockReset();
});

afterEach(cleanup);

describe('Register', () => {
  it('exposes persistent labels and suitable autocomplete values', () => {
    renderRegister();

    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveAttribute('autocomplete', 'given-name');
    expect(screen.getByRole('textbox', { name: 'Apellido' })).toHaveAttribute('autocomplete', 'family-name');
    expect(screen.getByRole('textbox', { name: 'Correo Electrónico' })).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('autocomplete', 'new-password');
  });

  it('groups account options and keeps the terms link outside the checkbox label', async () => {
    const user = userEvent.setup();
    renderRegister();

    const accountType = screen.getByRole('group', { name: 'Titular / Voluntario' });
    expect(accountType).toContainElement(screen.getByRole('radio', { name: 'Titular' }));
    expect(accountType).toContainElement(screen.getByRole('radio', { name: 'Voluntario' }));

    const terms = screen.getByRole('checkbox', { name: 'Acepto los términos' });
    const termsLink = screen.getByRole('link', { name: 'Leer Términos y Condiciones' });
    expect(termsLink).toHaveAttribute('href', '/terms');
    expect(terms.closest('label')).not.toContainElement(termsLink);

    await user.click(screen.getByRole('radio', { name: 'Voluntario' }));
    expect(screen.getByRole('textbox', { name: 'Descripción' })).toBeRequired();
  });

  it('associates the terms error with its checkbox', async () => {
    const user = userEvent.setup();
    renderRegister();
    await completeRequiredFields(user);

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));

    const terms = screen.getByRole('checkbox', { name: 'Acepto los términos' });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Acepto los términos.');
    expect(terms).toHaveAttribute('aria-invalid', 'true');
    expect(terms).toHaveAccessibleDescription('Acepto los términos.');
    expect(mockedRegisterUser).not.toHaveBeenCalled();

    await user.click(terms);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(terms).not.toHaveAttribute('aria-invalid');
  });

  it('submits once and exposes a rejected request as an alert', async () => {
    const user = userEvent.setup();
    mockedRegisterUser.mockRejectedValue(new Error('Network error'));
    renderRegister();
    await completeRequiredFields(user);
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos' }));

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));

    await waitFor(() => expect(mockedRegisterUser).toHaveBeenCalledTimes(1));
    expect(mockedRegisterUser).toHaveBeenCalledWith('owner', {
      name: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'safe-password',
      description: '',
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Error de conexión. Inténtalo de nuevo');
  });

  it('announces and locks the submit action while registration is pending', async () => {
    const user = userEvent.setup();
    let finishRegistration: (() => void) | undefined;
    mockedRegisterUser.mockImplementation(() => new Promise<void>((resolve) => {
      finishRegistration = resolve;
    }));
    renderRegister();
    await completeRequiredFields(user);
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos' }));

    await user.click(screen.getByRole('button', { name: 'Regístrate' }));

    const pendingButton = screen.getByRole('button', { name: 'Cargando...' });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton).toHaveAttribute('aria-busy', 'true');

    finishRegistration?.();
    await waitFor(() => expect(pendingButton).not.toHaveAttribute('aria-busy'));
  });

  it('has no serious or critical automated accessibility violations', async () => {
    const { container } = renderRegister();

    await expectNoCriticalAccessibilityViolations(container);
  });
});
