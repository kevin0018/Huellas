// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PetSize, PetType, Sex, type Pet } from '../modules/pet/domain/Pet';
import type { PetProcedure } from '../modules/pet/domain/PetProcedure';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';
import ProceduresView from './ProceduresView';

const services = vi.hoisted(() => ({
  checkups: { create: vi.fn(), update: vi.fn() },
  pets: { getPetById: vi.fn(), getPetProcedures: vi.fn() },
}));

vi.mock('../composition/applicationServices', () => ({ applicationServices: services }));
vi.mock('../Components/NavBar', () => ({ default: () => null }));
vi.mock('../Components/footer', () => ({ default: () => null }));
vi.mock('../Components/GoBackButton', () => ({ ArrowLeftIcon: () => <svg aria-hidden="true" /> }));
vi.mock('../Components/ProceduresModal', () => ({
  default: ({ isOpen, procedure }: { isOpen: boolean; procedure: PetProcedure }) => isOpen
    ? <div aria-label={`Editar ${procedure.name}`} role="dialog">Edición de {procedure.name}</div>
    : null,
}));

const pet: Pet = {
  birthDate: '2022-04-03T00:00:00.000Z',
  hasPassport: false,
  id: 14,
  name: 'Miso',
  ownerId: 2,
  profileImageUrl: '/pets/miso.jpg',
  sex: Sex.FEMALE,
  size: PetSize.SMALL,
  type: PetType.CAT,
};

const procedure = (overrides: Partial<PetProcedure>): PetProcedure => ({
  age: 8,
  description: 'Pauta preventiva recomendada.',
  explanation: 'Fecha calculada desde el último registro.',
  id: 1,
  name: 'Vacuna trivalente',
  petType: 'cat',
  recurrenceDays: 365,
  region: 'ES',
  source: 'Huellas',
  status: 'UPCOMING',
  version: '1',
  ...overrides,
});

const procedures: PetProcedure[] = [
  procedure({ id: 5, name: 'Revisión anual', status: 'DONE', lastOccurredAt: '2026-05-10T12:00:00.000Z' }),
  procedure({ id: 4, name: 'Vacuna de leucemia', status: 'UPCOMING', dueAt: '2026-11-08T12:00:00.000Z' }),
  procedure({ id: 2, name: 'Desparasitación interna', status: 'MISSING', dueAt: '2026-07-01T12:00:00.000Z' }),
  procedure({ id: 3, name: 'Vacuna de rabia', status: 'UPCOMING', dueAt: '2026-09-01T12:00:00.000Z' }),
  procedure({ id: 1, name: 'Vacuna trivalente', status: 'MISSING', dueAt: '2026-05-01T12:00:00.000Z' }),
];

function renderView() {
  return render(
    <MemoryRouter initialEntries={['/procedures-view/14']}>
      <Routes><Route element={<ProceduresView />} path="/procedures-view/:petId" /></Routes>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  services.pets.getPetById.mockResolvedValue(pet);
  services.pets.getPetProcedures.mockResolvedValue(procedures);
});

describe('ProceduresView', () => {
  it('orders the preventive plan by attention, proximity and current records', async () => {
    const { container } = renderView();

    expect(await screen.findByRole('heading', { level: 1, name: 'Prevención de Miso' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /perfil de mascota/i })).toHaveAttribute('href', '/pets/14');
    expect(container.querySelector('img[src="/pets/miso.jpg"]')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: /cuidados necesitan atención/i })).toHaveTextContent('2');

    const attention = screen.getByRole('region', { name: 'Necesita atención' });
    const attentionEntries = within(attention).getAllByRole('article');
    expect(attentionEntries[0]).toHaveTextContent('Vacuna trivalente');
    expect(attentionEntries[1]).toHaveTextContent('Desparasitación interna');

    const upcoming = screen.getByRole('region', { name: 'Próximamente' });
    const upcomingEntries = within(upcoming).getAllByRole('article');
    expect(upcomingEntries[0]).toHaveTextContent('Vacuna de rabia');
    expect(upcomingEntries[1]).toHaveTextContent('Vacuna de leucemia');

    expect(screen.getByRole('region', { name: 'Al día' })).toHaveTextContent('Revisión anual');
    await waitFor(async () => expectNoCriticalAccessibilityViolations(container));
  });

  it('opens the selected procedure record from its contextual action', async () => {
    renderView();

    fireEvent.click(await screen.findByRole('button', { name: 'Registrar realización de Vacuna trivalente' }));

    expect(screen.getByRole('dialog', { name: 'Editar Vacuna trivalente' })).toBeInTheDocument();
  });

  it('explains when no preventive plan is available', async () => {
    services.pets.getPetProcedures.mockResolvedValue([]);
    renderView();

    expect(await screen.findByText('Todavía no hay cuidados preventivos')).toBeInTheDocument();
    expect(screen.getByText(/El plan se genera según el tipo y la edad/i)).toBeInTheDocument();
  });
});
