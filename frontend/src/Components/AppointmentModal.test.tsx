// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppointmentModal from './AppointmentModal';
import { AppointmentReason, AppointmentStatus } from '../modules/appointment/domain/Appointment';
import { PetSize, PetType, Sex, type Pet } from '../modules/pet/domain/Pet';

const pets: Pet[] = [{
  id: 7,
  name: 'Miso',
  race: 'Europeo',
  type: PetType.CAT,
  ownerId: 2,
  birthDate: '2022-04-03T00:00:00.000Z',
  size: PetSize.SMALL,
  sex: Sex.FEMALE,
  hasPassport: false,
}];

afterEach(cleanup);

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
});

describe('AppointmentModal', () => {
  it('exposes a named dialog, associated fields and accessible validation', async () => {
    const user = userEvent.setup();

    render(
      <AppointmentModal
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        pets={pets}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Nueva cita' })).toBeInTheDocument();
    const petSelect = screen.getByLabelText('Mascota');
    expect(screen.getByLabelText('Fecha')).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText('Hora')).toHaveAttribute('type', 'time');
    expect(screen.getByLabelText('Hora')).toHaveAttribute('step', '1800');
    expect(screen.getByLabelText('Motivo de la cita')).toBeInTheDocument();
    expect(screen.getByLabelText(/Notas adicionales/)).toBeInTheDocument();
    await waitFor(() => expect(petSelect).toHaveFocus());

    await user.click(screen.getByRole('button', { name: 'Crear cita' }));

    expect(screen.getByText('Selecciona una mascota.')).toBeInTheDocument();
    expect(petSelect).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Fecha')).toHaveAccessibleDescription('Selecciona una fecha.');
    expect(screen.getByLabelText('Hora')).toHaveAccessibleDescription('Selecciona una hora.');
    expect(screen.getByLabelText('Motivo de la cita')).toHaveAccessibleDescription('Selecciona un motivo.');
  });

  it('submits a complete appointment once as a zoned ISO timestamp', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AppointmentModal
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
        pets={pets}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Mascota'), '7');
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2030-05-12' } });
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '10:30' } });
    await user.selectOptions(screen.getByLabelText('Motivo de la cita'), AppointmentReason.GENERAL_CHECKUP);
    await user.type(screen.getByLabelText(/Notas adicionales/), '  Control anual  ');
    await user.click(screen.getByRole('button', { name: 'Crear cita' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      petId: 7,
      date: new Date('2030-05-12T10:30').toISOString(),
      reason: AppointmentReason.GENERAL_CHECKUP,
      status: AppointmentStatus.SCHEDULED,
      notes: 'Control anual',
    });
  });

  it('uses local date fields while editing and keeps the pet immutable', () => {
    const localDate = new Date(2030, 4, 12, 10, 30);

    render(
      <AppointmentModal
        appointment={{
          id: 12,
          petId: 7,
          date: localDate.toISOString(),
          reason: AppointmentReason.VACCINATION,
          status: AppointmentStatus.COMPLETED,
          notes: null,
        }}
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        pets={pets}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Editar cita' })).toBeInTheDocument();
    expect(screen.getByLabelText('Mascota')).toBeDisabled();
    expect(screen.getByLabelText('Fecha')).toHaveValue('2030-05-12');
    expect(screen.getByLabelText('Fecha')).not.toHaveAttribute('min');
    expect(screen.getByLabelText('Hora')).toHaveValue('10:30');
    expect(screen.getByLabelText('Estado')).toHaveValue(AppointmentStatus.COMPLETED);
  });

  it('shows save errors inline and blocks every close path while loading', () => {
    const onClose = vi.fn();

    render(
      <AppointmentModal
        error="No se pudo guardar la cita"
        isOpen
        loading
        onClose={onClose}
        onSubmit={vi.fn()}
        pets={pets}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar la cita');
    expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
