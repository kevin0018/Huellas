// @vitest-environment jsdom

import type { ReactElement } from 'react';
import { TestLanguageProvider } from '../../test/language';

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Dialog } from './Dialog';

const render = (ui: ReactElement) => rtlRender(ui, { wrapper: TestLanguageProvider });

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

afterEach(() => { cleanup(); localStorage.clear(); });

function DialogHarness({ preventClose = false }: { preventClose?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button">Abrir cita</button>
      <Dialog
        description="Completa los datos de la cita"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        preventClose={preventClose}
        title="Nueva cita"
      >
        <label htmlFor="dialog-date">Fecha</label>
        <input id="dialog-date" />
        <button type="button">Guardar</button>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('exposes an accessible name and moves focus to the first form control', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    await user.click(screen.getByRole('button', { name: 'Abrir cita' }));

    expect(screen.getByRole('dialog', { name: 'Nueva cita' })).toHaveAccessibleDescription('Completa los datos de la cita');
    expect(screen.getByRole('textbox', { name: 'Fecha' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveAttribute('type', 'button');
  });

  it('closes on cancel and restores focus to the opener', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    const opener = screen.getByRole('button', { name: 'Abrir cita' });
    await user.click(opener);

    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('prevents every close action while an operation is in flight', async () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen onClose={onClose} preventClose title="Guardando cita">
        <button type="button">Acción</button>
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      bottom: 300,
      height: 200,
      left: 100,
      right: 400,
      top: 100,
      width: 300,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    fireEvent.click(dialog, { clientX: 20, clientY: 20 });

    expect(dialog).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
