// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AsyncContent } from './AsyncContent';

afterEach(cleanup);

const renderState = (overrides: Partial<React.ComponentProps<typeof AsyncContent>> = {}) => render(
  <AsyncContent
    loading={false}
    empty={false}
    loadingLabel="Cargando datos"
    emptyTitle="Sin resultados"
    {...overrides}
  >
    <p>Contenido remoto</p>
  </AsyncContent>,
);

describe('AsyncContent', () => {
  it('prioritizes the loading state and announces it', () => {
    renderState({ loading: true, error: 'Falló', empty: true });

    expect(screen.getByRole('status')).toHaveTextContent('Cargando datos');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('Contenido remoto')).not.toBeInTheDocument();
  });

  it('shows an actionable error state', () => {
    const onRetry = vi.fn();
    renderState({ error: 'No se pudo cargar', onRetry });

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders the empty state or content when appropriate', () => {
    const { rerender } = renderState({ empty: true, emptyDescription: 'Prueba de nuevo más tarde' });
    expect(screen.getByRole('status')).toHaveTextContent('Sin resultados');
    expect(screen.getByRole('status')).toHaveTextContent('Prueba de nuevo más tarde');

    rerender(
      <AsyncContent loading={false} empty={false} loadingLabel="Cargando datos" emptyTitle="Sin resultados">
        <p>Contenido remoto</p>
      </AsyncContent>,
    );
    expect(screen.getByText('Contenido remoto')).toBeInTheDocument();
  });
});
