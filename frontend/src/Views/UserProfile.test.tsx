// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { TestLanguageProvider, switchLanguage } from '../test/language';
import UserProfile from './UserProfile';

const actions = vi.hoisted(() => ({ currentUser: vi.fn(), updateProfile: vi.fn(), changePassword: vi.fn(), toggleVolunteer: vi.fn() }));
vi.mock('../features/auth/authActions', () => ({ authActions: actions }));
vi.mock('../Components/NavBar', () => ({ default: () => null }));
vi.mock('../Components/footer', () => ({ default: () => null }));
const profile = { id: 1, name: 'María', lastName: 'García', email: 'maria@example.com', type: 'owner', roles: ['owner'] };

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
beforeEach(() => { vi.resetAllMocks(); actions.currentUser.mockResolvedValue(profile); });
afterEach(() => { cleanup(); localStorage.clear(); });

function renderProfile() {
  return render(<TestLanguageProvider><MemoryRouter><UserProfile /></MemoryRouter></TestLanguageProvider>);
}

it('switches profile fields and visible password validation without losing edits', async () => {
  const user = userEvent.setup();
  renderProfile();
  await screen.findByRole('heading', { name: 'Tu perfil' });
  await user.type(screen.getByLabelText('Nombre'), ' II');
  await user.type(screen.getByLabelText('Contraseña actual'), 'current123');
  await user.type(screen.getByLabelText('Nueva contraseña'), 'new123');
  await user.click(screen.getByRole('button', { name: 'Mostrar contraseña: Contraseña actual' }));
  expect(screen.getByLabelText('Contraseña actual')).toHaveAttribute('type', 'text');
  expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('type', 'password');
  expect(screen.getByLabelText('Confirmar contraseña')).toHaveAttribute('type', 'password');
  await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden');

  switchLanguage('English');
  expect(screen.getByRole('heading', { name: 'Your profile' })).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
  expect(screen.getByLabelText('Name')).toHaveValue('María II');
  expect(screen.getByLabelText('Current password')).toHaveValue('current123');
  expect(screen.getByRole('button', { name: 'Hide password: Current password' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByLabelText('Last name')).toHaveValue('García');
  expect(screen.getByLabelText('Email address')).toHaveValue('maria@example.com');

  switchLanguage('Català');
  expect(screen.getByRole('alert')).toHaveTextContent('Les contrasenyes no coincideixen');
  await user.type(screen.getByLabelText('Confirma la contrasenya'), 'new123');
  await user.click(screen.getByRole('button', { name: 'Mostra la contrasenya: Contrasenya nova' }));
  expect(screen.getByLabelText('Contrasenya nova')).toHaveAttribute('type', 'text');
  expect(screen.getByLabelText('Confirma la contrasenya')).toHaveAttribute('type', 'password');
  actions.changePassword.mockResolvedValue(undefined);
  await user.click(screen.getByRole('button', { name: 'Canvia la contrasenya' }));
  await screen.findByText('Canvis desats');
  expect(actions.changePassword).toHaveBeenCalledWith('current123', 'new123');
  expect(screen.getByLabelText('Contrasenya nova')).toHaveValue('');
  expect(actions.currentUser).toHaveBeenCalledOnce();
});

it('localizes the volunteer dialog and keeps its description and validation on language changes', async () => {
  const user = userEvent.setup();
  renderProfile();
  await user.click(await screen.findByRole('button', { name: 'Activar voluntariado' }));
  await user.click(screen.getByRole('button', { name: 'Quiero ser voluntario' }));
  expect(screen.getByRole('alert')).toHaveTextContent('La descripción es obligatoria');
  switchLanguage('English');
  expect(screen.getByRole('dialog', { name: 'Become a volunteer!' })).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('A description is required to become a volunteer.');
  await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Cuido gatos');
  switchLanguage('Català');
  expect(screen.getByRole('dialog', { name: 'Fes-te voluntari!' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Descripció' })).toHaveValue('Cuido gatos');
  expect(screen.getByRole('button', { name: 'Tanca' })).toBeEnabled();
  actions.toggleVolunteer.mockResolvedValue({ ...profile, roles: ['owner', 'volunteer'], description: 'Cuido gatos' });
  await user.click(screen.getByRole('button', { name: 'Vull ser voluntari' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(actions.toggleVolunteer).toHaveBeenCalledWith(true, 'Cuido gatos');
  expect(screen.getByText('Perfil de voluntariat')).toBeInTheDocument();
});

it('preserves server error messages across languages when saving profile details', async () => {
  const user = userEvent.setup();
  actions.updateProfile.mockRejectedValue(new Error('Correo ya registrado'));
  renderProfile();
  await user.click(await screen.findByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Correo ya registrado');
  switchLanguage('English');
  expect(screen.getByRole('alert')).toHaveTextContent('Correo ya registrado');
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
});

it('keeps delegated local volunteer errors translatable in both the profile and open dialog', async () => {
  actions.toggleVolunteer.mockRejectedValue(null);
  const user = userEvent.setup();
  renderProfile();
  await user.click(await screen.findByRole('button', { name: 'Activar voluntariado' }));
  await user.type(screen.getByRole('textbox', { name: 'Descripción' }), 'Cuido gatos');
  await user.click(screen.getByRole('button', { name: 'Quiero ser voluntario' }));
  await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(2));
  for (const alert of screen.getAllByRole('alert')) expect(alert).toHaveTextContent('Error al actualizar el estado de voluntario');
  switchLanguage('English');
  for (const alert of screen.getAllByRole('alert')) expect(alert).toHaveTextContent('Could not update volunteer status');
});
