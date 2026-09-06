// @vitest-environment jsdom

import type { ReactElement } from 'react';
import { TestLanguageProvider, switchLanguage } from '../test/language';

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PetProcedure } from '../modules/pet/domain/PetProcedure';
import ProcedureModal from './ProceduresModal';

const render = (ui: ReactElement) => rtlRender(ui, { wrapper: TestLanguageProvider });

beforeAll(() => {
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

afterEach(() => { cleanup(); localStorage.clear(); });

const procedure: PetProcedure = {
  id: 7,
  petType: 'dog',
  name: 'Vacuna anual',
  age: 2,
  description: 'Protección anual recomendada.',
  status: 'UPCOMING',
  checkupId: 12,
  checkupDate: '2026-09-18T23:00:00.000Z',
  checkupNotes: 'Primera nota',
  dueAt: null,
  lastOccurredAt: null,
  recurrenceDays: 365,
  explanation: 'Calendario veterinario',
  source: 'Huellas',
  version: '1',
  region: 'ES',
};

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe('ProcedureModal', () => {
  it('submits normalized controlled values and blocks closing while saving', async () => {
    const user = userEvent.setup();
    const saving = deferred();
    const onClose = vi.fn();
    const onModalSubmit = vi.fn(() => saving.promise);

    render(
      <ProcedureModal isOpen onClose={onClose} onModalSubmit={onModalSubmit} procedure={procedure} />,
    );

    expect(screen.getByRole('dialog', { name: 'Vacuna anual' })).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha de realización')).toHaveValue('2026-09-18');
    expect(screen.getByLabelText(/Notas/)).toHaveValue('Primera nota');

    await user.clear(screen.getByLabelText(/Notas/));
    await user.type(screen.getByLabelText(/Notas/), '  Revisión completada  ');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(onModalSubmit).toHaveBeenCalledWith(7, 12, '2026-09-18', 'Revisión completada');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();

    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: false, cancelable: true }));
    expect(onClose).not.toHaveBeenCalled();

    saving.resolve();
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('stays open and announces repository errors', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onModalSubmit = vi.fn().mockRejectedValue(new Error('No se pudo actualizar'));

    render(
      <ProcedureModal isOpen onClose={onClose} onModalSubmit={onModalSubmit} procedure={procedure} />,
    );

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  });

  it('opens the native date picker only from the date input', () => {
    render(
      <ProcedureModal isOpen onClose={vi.fn()} onModalSubmit={vi.fn()} procedure={procedure} />,
    );

    const dateInput = screen.getByLabelText('Fecha de realización');
    const dateField = dateInput.closest('.form-field');
    const showPicker = vi.fn();
    Object.defineProperty(dateInput, 'showPicker', { value: showPicker });

    expect(dateField).not.toBeNull();
    fireEvent.click(dateField as HTMLElement);
    expect(showPicker).not.toHaveBeenCalled();

    fireEvent.click(dateInput);

    expect(showPicker).toHaveBeenCalledOnce();
  });
});

it('switches the open form, preserves edits and translates a visible fallback error', async () => {
  const user = userEvent.setup();
  const onModalSubmit = vi.fn().mockRejectedValue(null);
  const onClose = vi.fn();
  render(<ProcedureModal isOpen onClose={onClose} onModalSubmit={onModalSubmit} procedure={procedure} />);
  await user.clear(screen.getByLabelText(/Notas/));
  await user.type(screen.getByLabelText(/Notas/), 'Nota escrita');
  switchLanguage('English');
  expect(screen.getByLabelText('Completion date')).toHaveValue('2026-09-18');
  expect(screen.getByLabelText(/Notes/)).toHaveValue('Nota escrita');
  expect(screen.getByRole('button', { name: 'Close procedure editor' })).toBeEnabled();
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Changes could not be saved. Try again.');
  switchLanguage('Català');
  expect(screen.getByRole('alert')).toHaveTextContent("No s'han pogut desar els canvis. Torna-ho a provar.");
  expect(screen.getByLabelText('Data de realització')).toHaveAttribute('lang', 'ca-ES');
  expect(screen.getByLabelText(/Notes/)).toHaveValue('Nota escrita');
  expect(onModalSubmit).toHaveBeenCalledWith(7, 12, '2026-09-18', 'Nota escrita');
  expect(onClose).not.toHaveBeenCalled();
});
