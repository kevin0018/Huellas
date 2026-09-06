// @vitest-environment jsdom

import type { ReactElement } from 'react';
import { TestLanguageProvider, switchLanguage } from '../test/language';

import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PetRegister from './PetRegister';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';

const render = (ui: ReactElement) => rtlRender(ui, { wrapper: TestLanguageProvider });

const petRepository = vi.hoisted(() => ({
  create: vi.fn(),
  getPetById: vi.fn(),
  update: vi.fn(),
}));

vi.mock('../composition/applicationServices', () => ({
  applicationServices: { pets: petRepository },
}));

vi.mock('../Components/NavBar', () => ({ default: () => null }));
vi.mock('../Components/footer', () => ({ default: () => null }));
vi.mock('../Components/GoBackButton', () => ({ default: () => null }));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/pets/new']}>
      <Routes>
        <Route path="/pets/new" element={<PetRegister />} />
        <Route path="/user-home" element={<p>Inicio cargado</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function tabUntil(user: ReturnType<typeof userEvent.setup>, target: HTMLElement) {
  for (let step = 0; step < 30 && document.activeElement !== target; step += 1) {
    await user.tab();
  }
  expect(target).toHaveFocus();
}

describe('PetRegister', () => {
  it('associates its choices, help and validation errors accessibly', async () => {
    const user = userEvent.setup();
    const { container } = renderCreate();

    expect(screen.getByRole('heading', { name: 'Datos básicos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Identificación y viaje' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Información de salud' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Sexo *' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '¿Tiene pasaporte?' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de animal *')).toHaveValue('dog');
    expect(screen.queryByLabelText('Número de pasaporte')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ir a procedimientos' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Sí' }));
    expect(screen.getByLabelText('Número de pasaporte')).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Crear mascota' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los campos obligatorios');
    expect(screen.getByLabelText('Nombre *')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Nombre *')).toHaveAccessibleDescription('Escribe el nombre de tu mascota.');
    expect(screen.getByLabelText('Fecha de nacimiento *')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Fecha de nacimiento *')).toHaveAccessibleDescription(
      'Indica su fecha de nacimiento.',
    );
    await waitFor(() => expect(screen.getByLabelText('Nombre *')).toHaveFocus());
    await expectNoCriticalAccessibilityViolations(container);
  });

  it('completes registration using only the keyboard and exposes its saving state', async () => {
    const user = userEvent.setup();
    let finishSaving: (() => void) | undefined;
    petRepository.create.mockImplementation(() => new Promise<void>((resolve) => {
      finishSaving = resolve;
    }));
    renderCreate();

    const name = screen.getByLabelText('Nombre *');
    const birthDate = screen.getByLabelText('Fecha de nacimiento *');
    const submit = screen.getByRole('button', { name: 'Crear mascota' });

    await tabUntil(user, name);
    await user.keyboard('Miso');
    await tabUntil(user, birthDate);
    await user.keyboard('2022-04-03');
    await tabUntil(user, submit);
    await user.keyboard('{Enter}');

    expect(petRepository.create).toHaveBeenCalledTimes(1);
    expect(petRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      birthDate: '2022-04-03',
      hasPassport: false,
      name: 'Miso',
      sex: 'male',
      size: 'medium',
      type: 'dog',
    }));
    expect(screen.getByRole('button', { name: 'Guardando…' })).toHaveAttribute('aria-busy', 'true');
    expect(document.querySelector('.ui-spinner')).toHaveAttribute('aria-hidden', 'true');

    finishSaving?.();
    await waitFor(() => expect(screen.getByText('Inicio cargado')).toBeInTheDocument());
  });

  it('opens the native date picker from the whole birth date field', async () => {
    const user = userEvent.setup();
    renderCreate();
    const birthDate = screen.getByLabelText('Fecha de nacimiento *');
    const showPicker = vi.fn();
    Object.defineProperty(birthDate, 'showPicker', { value: showPicker });

    await user.click(birthDate);

    expect(showPicker).toHaveBeenCalledOnce();
  });
});

it('switches a visible validation error and preserves form data when creating in Catalan', async () => {
  const user = userEvent.setup();
  petRepository.create.mockResolvedValue(undefined);
  renderCreate();
  await user.type(screen.getByLabelText('Nombre *'), 'Núvol');
  await user.click(screen.getByRole('button', { name: 'Crear mascota' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Revisa los campos obligatorios');

  switchLanguage('English');
  expect(screen.getByRole('alert')).toHaveTextContent('Review the required fields before continuing.');
  expect(screen.getByLabelText('Name *')).toHaveValue('Núvol');
  expect(screen.getByLabelText('Date of birth *')).toHaveAccessibleDescription('Enter their date of birth.');
  expect(screen.getByRole('option', { name: 'Dog' })).toHaveValue('dog');

  switchLanguage('Català');
  expect(screen.getByRole('alert')).toHaveTextContent('Revisa els camps obligatoris');
  expect(screen.getByLabelText('Data de naixement *')).toHaveAttribute('lang', 'ca-ES');
  await user.type(screen.getByLabelText('Data de naixement *'), '2022-04-03');
  await user.click(screen.getByRole('radio', { name: 'Femella' }));
  await user.click(screen.getByRole('radio', { name: 'Sí' }));
  await user.type(screen.getByLabelText('Número de passaport'), 'ES-42');
  await user.click(screen.getByRole('button', { name: 'Crea la mascota' }));
  expect(petRepository.create).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Núvol', birthDate: '2022-04-03', type: 'dog', sex: 'female', hasPassport: true, passportNumber: 'ES-42',
  }));
  await screen.findByText('Inicio cargado');
});

it('keeps unsaved pet edits when switching from Catalan to English', async () => {
  localStorage.setItem('language', 'ca');
  petRepository.getPetById.mockResolvedValue({
    id: 9, name: 'Miso', type: 'cat', size: 'small', sex: 'female', birthDate: '2022-04-03', hasPassport: false,
  });
  petRepository.update.mockResolvedValue(undefined);
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/pets/9/edit']}><Routes>
    <Route path="/pets/:id/edit" element={<PetRegister />} />
    <Route path="/user-home" element={<p>Inicio cargado</p>} />
  </Routes></MemoryRouter>);
  await screen.findByDisplayValue('Miso');
  await user.type(screen.getByLabelText('Nom *'), ' II');
  switchLanguage('English');
  expect(screen.getByRole('heading', { name: 'Edit pet' })).toBeInTheDocument();
  expect(screen.getByLabelText('Name *')).toHaveValue('Miso II');
  expect(screen.getByRole('link', { name: 'Go to procedures' })).toHaveAttribute('href', '/procedures-view/9');
  expect(petRepository.getPetById).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(petRepository.update).toHaveBeenCalledWith(9, expect.objectContaining({ name: 'Miso II', type: 'cat' }));
  await screen.findByText('Inicio cargado');
});
