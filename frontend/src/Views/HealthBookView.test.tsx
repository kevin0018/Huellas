// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HealthBookView from './HealthBookView';
import type { HealthEvent } from '../modules/health/HealthEvent';
import { PetSize, PetType, Sex, type Pet } from '../modules/pet/domain/Pet';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';
import LanguageProvider from '../i18n/LanguageProvider';

const services = vi.hoisted(() => ({
  healthEvents: {
    create: vi.fn(),
    createShare: vi.fn(),
    delete: vi.fn(),
    deleteDocument: vi.fn(),
    downloadDocument: vi.fn(),
    exportSummary: vi.fn(),
    list: vi.fn(),
    revokeShare: vi.fn(),
    update: vi.fn(),
    uploadDocument: vi.fn(),
  },
  pets: { getPetById: vi.fn() },
}));

vi.mock('../composition/applicationServices', () => ({
  applicationServices: {
    checkups: {},
    healthEvents: services.healthEvents,
    pets: services.pets,
    reminders: {},
  },
}));
vi.mock('../Components/NavBar', () => ({ default: () => null }));
vi.mock('../Components/footer', () => ({ default: () => null }));

const pet: Pet = {
  birthDate: '2021-04-03T00:00:00.000Z',
  hasPassport: false,
  id: 7,
  name: 'Miso',
  ownerId: 2,
  sex: Sex.FEMALE,
  size: PetSize.SMALL,
  type: PetType.CAT,
};

const events: HealthEvent[] = [
  {
    attachments: [],
    dose: null,
    expiresAt: null,
    id: 1,
    lotNumber: null,
    notes: 'Todo correcto.',
    occurredAt: '2024-03-10T12:00:00.000Z',
    petId: 7,
    provider: 'Clínica Huellas',
    result: 'Sin incidencias',
    source: 'OWNER',
    title: 'Revisión anual',
    type: 'GENERAL_CHECKUP',
    verification: 'OWNER_REPORTED',
  },
  {
    attachments: [{
      createdAt: '2025-05-01T10:00:00.000Z',
      fileName: 'vacuna.pdf',
      healthEventId: 2,
      id: 8,
      mimeType: 'application/pdf',
      petId: 7,
      sizeBytes: 1200,
    }],
    dose: '1 ml',
    expiresAt: '2026-05-01T12:00:00.000Z',
    id: 2,
    lotNumber: 'L-204',
    notes: null,
    occurredAt: '2025-05-01T12:00:00.000Z',
    petId: 7,
    provider: 'Centro veterinario',
    result: null,
    source: 'APPOINTMENT',
    title: 'Vacuna trivalente',
    type: 'VACCINATION',
    verification: 'VERIFIED',
  },
];

function renderView() {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={['/pets/7/health']}>
        <Routes><Route element={<HealthBookView />} path="/pets/:petId/health" /></Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

beforeEach(() => {
  vi.clearAllMocks();
  services.healthEvents.list.mockResolvedValue(events);
  services.healthEvents.update.mockResolvedValue(events[0]);
  services.pets.getPetById.mockResolvedValue(pet);
});

describe('HealthBookView', () => {
  it('presents the pet health history as an accessible reverse chronology', async () => {
    const { container } = renderView();

    expect(await screen.findByText(/tratamientos de Miso/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /perfil de mascota/i })).toHaveAttribute('href', '/pets/7');

    const timeline = screen.getByRole('region', { name: 'Historial' });
    const entries = within(timeline).getAllByRole('article');
    expect(entries).toHaveLength(2);
    expect(entries[0]).toHaveTextContent('Vacuna trivalente');
    expect(entries[1]).toHaveTextContent('Revisión anual');
    expect(screen.getByText('2 eventos · 1 documento')).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /añadir evento/i });
    fireEvent.click(toggle);
    expect(screen.getByRole('heading', { name: 'Nuevo evento sanitario' })).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const periodFrom = screen.getByLabelText(/Desde/);
    const showDatePicker = vi.fn();
    Object.defineProperty(periodFrom, 'showPicker', { value: showDatePicker });
    fireEvent.click(periodFrom);
    expect(showDatePicker).toHaveBeenCalledOnce();

    await waitFor(async () => expectNoCriticalAccessibilityViolations(container));
  });

  it('edits owner-reported events while keeping verified sources read-only', async () => {
    renderView();

    expect(await screen.findByText(/tratamientos de Miso/i)).toBeInTheDocument();
    const timeline = screen.getByRole('region', { name: 'Historial' });
    const entries = within(timeline).getAllByRole('article');

    expect(entries[0]).toHaveTextContent('Solo lectura · Evento verificado');
    expect(within(entries[0]).queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();

    fireEvent.click(within(entries[1]).getByRole('button', { name: /editar revisión anual/i }));
    expect(screen.getByRole('heading', { name: 'Editar evento sanitario' })).toBeInTheDocument();
    const titleInput = screen.getByLabelText('Título');
    expect(titleInput).toHaveValue('Revisión anual');

    fireEvent.change(titleInput, { target: { value: 'Revisión anual corregida' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(services.healthEvents.update).toHaveBeenCalledWith(1, expect.objectContaining({
      title: 'Revisión anual corregida',
      type: 'GENERAL_CHECKUP',
    })));
    expect(services.healthEvents.create).not.toHaveBeenCalled();
  });

  it('localizes health event labels, dates and summary controls', async () => {
    localStorage.setItem('language', 'en');
    renderView();

    expect(await screen.findByRole('heading', { name: 'Health book' })).toBeInTheDocument();
    const timeline = screen.getByRole('region', { name: 'History' });
    expect(within(timeline).getByText('Vaccine')).toBeInTheDocument();
    expect(within(timeline).getByText(/1 May 2025/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Prepare summary' })).toBeInTheDocument();
  });
});
