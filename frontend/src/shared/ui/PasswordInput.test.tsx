// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { TestLanguageProvider, switchLanguage } from '../../test/language';
import { expectNoCriticalAccessibilityViolations } from '../../test/accessibility';
import PasswordInput, { PasswordCompanion } from './PasswordInput';

afterEach(() => { cleanup(); localStorage.clear(); });

function Form({ submit = vi.fn(), disabled = false }: { submit?: (value: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState('');
  return <TestLanguageProvider><form onSubmit={event => { event.preventDefault(); submit(value); }}>
    <PasswordCompanion>
      <label htmlFor="secret">Secret</label>
      <PasswordInput id="secret" name="secret" autoComplete="new-password" value={value} onChange={event => setValue(event.target.value)} disabled={disabled} />
      <button type="submit">Continue</button>
    </PasswordCompanion>
  </form></TestLanguageProvider>;
}

it('reveals the same input without submitting or losing typing focus, and animates only interaction state', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  const { container } = render(<Form submit={submit} />);
  const field = screen.getByLabelText('Secret');
  const cat = container.querySelector('.huellas-cat');
  expect(cat).toHaveAttribute('data-mood', 'idle');
  await user.type(field, 'miso-secret');
  expect(cat).toHaveAttribute('data-mood', 'hiding');
  expect(field).toHaveAttribute('type', 'password');
  await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
  expect(field).toHaveAttribute('type', 'text');
  expect(field).toHaveFocus();
  expect(cat).toHaveAttribute('data-mood', 'watching');
  expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-controls', 'secret');
  await user.keyboard('-extra');
  await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
  expect(field).toHaveAttribute('type', 'password');
  expect(field).toHaveValue('miso-secret-extra');
  expect(cat?.outerHTML).not.toContain('miso-secret');
  expect(submit).not.toHaveBeenCalled();
  await user.keyboard('{Enter}');
  expect(submit).toHaveBeenCalledExactlyOnceWith('miso-secret-extra');
  await expectNoCriticalAccessibilityViolations(container);
});

it('supports keyboard toggling and translates the active action without resetting the value', async () => {
  const user = userEvent.setup();
  const { container } = render(<Form />);
  const field = screen.getByLabelText('Secret');
  await user.type(field, 'secret');
  await user.tab();
  expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toHaveFocus();
  await user.keyboard(' ');
  expect(field).toHaveAttribute('type', 'text');
  switchLanguage('English');
  expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
  switchLanguage('Català');
  await user.click(screen.getByRole('button', { name: 'Amaga la contrasenya' }));
  expect(screen.getByRole('button', { name: 'Mostra la contrasenya' })).toHaveAttribute('aria-pressed', 'false');
  expect(field).toHaveValue('secret');
  await user.click(field);
  await user.tab();
  await user.tab();
  expect(container.querySelector('.huellas-cat')).toHaveAttribute('data-mood', 'idle');
});

it('disables the reveal action along with the field', () => {
  render(<Form disabled />);
  expect(screen.getByLabelText('Secret')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeDisabled();
});
