// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PetRegister from './PetRegister';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';

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

    expect(screen.getByRole('group', { name: 'Sexo *' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '¿Tiene pasaporte?' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo *')).toHaveAccessibleDescription(
      'Actualmente se admiten perros, gatos y hurones.',
    );
    expect(screen.queryByRole('link', { name: 'Ir a procedimientos' })).not.toBeInTheDocument();

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
});
