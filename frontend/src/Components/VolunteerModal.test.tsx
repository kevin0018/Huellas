// @vitest-environment jsdom

import type { ReactElement } from 'react';
import { TestLanguageProvider } from '../test/language';

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VolunteerModal from './VolunteerModal';

const render = (ui: ReactElement) => rtlRender(ui, { wrapper: TestLanguageProvider });

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

afterEach(() => { cleanup(); localStorage.clear(); });

describe('VolunteerModal', () => {
  it('focuses and validates the description when becoming a volunteer', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <VolunteerModal
        isCurrentlyVolunteer={false}
        isOpen
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    const description = screen.getByRole('textbox', { name: /descripción/i });
    await waitFor(() => expect(description).toHaveFocus());

    await user.click(screen.getByRole('button', { name: 'Quiero ser voluntario' }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('La descripción es obligatoria');
    expect(description).toHaveAttribute('aria-invalid', 'true');
    expect(description.getAttribute('aria-describedby')).toContain(alert.id);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows a rejected update without closing and keeps the error associated', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockRejectedValue(new Error('No se pudo actualizar'));

    render(
      <VolunteerModal
        isCurrentlyVolunteer={false}
        isOpen
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    const description = screen.getByRole('textbox', { name: /descripción/i });
    await user.type(description, 'Experiencia con animales');
    await user.click(screen.getByRole('button', { name: 'Quiero ser voluntario' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudo actualizar');
    expect(description.getAttribute('aria-describedby')).toContain(alert.id);
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
  });

  it('focuses cancel when leaving and resets state when reopened', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { rerender } = render(
      <VolunteerModal
        isCurrentlyVolunteer={false}
        isOpen
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: /descripción/i }), 'Texto temporal');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    rerender(
      <VolunteerModal
        isCurrentlyVolunteer={false}
        isOpen={false}
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );
    rerender(
      <VolunteerModal
        isCurrentlyVolunteer={false}
        isOpen
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox', { name: /descripción/i })).toHaveValue('');

    rerender(
      <VolunteerModal
        isCurrentlyVolunteer={false}
        isOpen={false}
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );
    rerender(
      <VolunteerModal
        isCurrentlyVolunteer
        isOpen={false}
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );
    rerender(
      <VolunteerModal
        isCurrentlyVolunteer
        isOpen
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus());
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('blocks every close action and hides the loading spinner from assistive technology', () => {
    const onCancel = vi.fn();

    render(
      <VolunteerModal
        isCurrentlyVolunteer
        isLoading
        isOpen
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAttribute('aria-busy', 'true');
    expect(onCancel).not.toHaveBeenCalled();
    expect(document.querySelector('.ui-spinner')).toHaveAttribute('aria-hidden', 'true');
  });
});
