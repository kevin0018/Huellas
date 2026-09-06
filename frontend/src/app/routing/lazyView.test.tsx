// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { Suspense, type ComponentType } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from '../errors/AppErrorBoundary';
import { TestLanguageProvider, switchLanguage } from '../../test/language';
import RouteLoading from './RouteLoading';
import { lazyView } from './lazyView';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function RecoveryRoutes({ View }: { View: ComponentType }) {
  const location = useLocation();
  return (
    <AppErrorBoundary key={location.pathname}>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/private" element={<View />} />
          <Route path="/" element={<h1>Huellas</h1>} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}

function renderView(View: ComponentType) {
  return render(
    <TestLanguageProvider>
      <MemoryRouter initialEntries={['/private']}>
        <RecoveryRoutes View={View} />
      </MemoryRouter>
    </TestLanguageProvider>,
  );
}

describe('deferred route loading', () => {
  it('announces loading in the active language without restarting the import', async () => {
    let resolve!: (module: { default: ComponentType }) => void;
    const load = vi.fn(() => new Promise<{ default: ComponentType }>(done => { resolve = done; }));
    const View = lazyView(load);
    renderView(View);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando...');
    switchLanguage('English');
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    switchLanguage('Català');
    expect(screen.getByRole('status')).toHaveTextContent('Carregant...');
    expect(document.documentElement.lang).toBe('ca');
    expect(load).toHaveBeenCalledOnce();

    await act(async () => resolve({ default: () => <h1>Loaded view</h1> }));
    expect(screen.getByRole('heading', { name: 'Loaded view' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('reloads only when the user retries a failed import', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reload = vi.fn();
    const View = lazyView(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module')));
    renderView(View);

    expect(await screen.findByRole('alert')).toHaveTextContent('No hemos podido mostrar esta página');
    expect(reload).not.toHaveBeenCalled();
    // JSDOM location is non-configurable; replace the global only for the click.
    vi.stubGlobal('window', { location: { reload } });
    fireEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }));
    expect(reload).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  it('allows navigation home after a failed import without retrying the broken module', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const load = vi.fn(() => Promise.reject(new Error('Offline')));
    renderView(lazyView(load));
    await screen.findByRole('alert');
    switchLanguage('English');
    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't display this page");
    fireEvent.click(screen.getByRole('link', { name: 'Back to home' }));
    expect(await screen.findByRole('heading', { name: 'Huellas' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(load).toHaveBeenCalledOnce();
  });

  it('keeps in-place retry for render errors in successfully loaded views', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let broken = true;
    const load = vi.fn(async () => ({ default: () => {
      if (broken) throw new Error('Render failed');
      return <h1>Recovered view</h1>;
    } }));
    renderView(lazyView(load));
    await screen.findByRole('alert');
    broken = false;
    fireEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }));
    expect(await screen.findByRole('heading', { name: 'Recovered view' })).toBeInTheDocument();
    expect(load).toHaveBeenCalledOnce();
  });
});
