// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import AppointmentsView from './AppointmentsView';
import { AppointmentReason, AppointmentStatus, type Appointment } from '../modules/appointment/domain/Appointment';
import { PetSize, PetType, Sex, type Pet } from '../modules/pet/domain/Pet';
import { expectNoCriticalAccessibilityViolations } from '../test/accessibility';
import LanguageProvider from '../i18n/LanguageProvider';

const useAppointmentsMock = vi.hoisted(() => vi.fn());

vi.mock('../features/appointments/useAppointments', () => ({
  useAppointments: useAppointmentsMock,
}));
vi.mock('../Components/NavBar', () => ({ default: () => null }));
vi.mock('../Components/footer', () => ({ default: () => null }));
vi.mock('../Components/GoBackButton', () => ({ default: () => null }));
vi.mock('../Components/AppointmentModal', () => ({ default: () => null }));

const pets: Pet[] = [
  {
    id: 1,
    name: 'Miso',
    ownerId: 4,
    type: PetType.CAT,
    birthDate: '2022-04-03T00:00:00.000Z',
    size: PetSize.SMALL,
    sex: Sex.FEMALE,
    hasPassport: false,
  },
  {
    id: 2,
    name: 'Luna',
    ownerId: 4,
    type: PetType.DOG,
    birthDate: '2020-02-10T00:00:00.000Z',
    size: PetSize.MEDIUM,
    sex: Sex.FEMALE,
    hasPassport: false,
  },
];

const appointments: Appointment[] = [
  { id: 1, petId: 1, date: '2036-06-12T10:30:00.000Z', reason: AppointmentReason.GENERAL_CHECKUP, status: AppointmentStatus.SCHEDULED },
  { id: 2, petId: 2, date: '2035-05-10T09:00:00.000Z', reason: AppointmentReason.VACCINATION, status: AppointmentStatus.SCHEDULED },
  { id: 3, petId: 1, date: '2020-02-10T09:00:00.000Z', reason: AppointmentReason.OPERATION, status: AppointmentStatus.COMPLETED },
  { id: 4, petId: 2, date: '2021-03-11T11:00:00.000Z', reason: AppointmentReason.OTHERS, status: AppointmentStatus.CANCELLED },
];

afterEach(() => {
  cleanup();
  localStorage.clear();
});

beforeEach(() => {
  useAppointmentsMock.mockReturnValue({
    appointments,
    pets,
    loading: false,
    actionLoading: false,
    error: null,
    clearError: vi.fn(),
    reload: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    petById: (id: number) => pets.find((pet) => pet.id === id),
  });
});

describe('AppointmentsView', () => {
  it('separates upcoming appointments from history in chronological order', async () => {
    const { container } = render(<LanguageProvider><AppointmentsView /></LanguageProvider>);

    const upcoming = screen.getByRole('region', { name: 'Próximas citas' });
    const history = screen.getByRole('region', { name: 'Historial' });
    const upcomingRows = within(upcoming).getAllByRole('article');
    const historyRows = within(history).getAllByRole('article');

    expect(upcomingRows).toHaveLength(2);
    expect(upcomingRows[0]).toHaveTextContent('Luna');
    expect(upcomingRows[0]).toHaveTextContent('Siguiente cita');
    expect(upcomingRows[1]).toHaveTextContent('Miso');
    expect(historyRows).toHaveLength(2);
    expect(historyRows[0]).toHaveTextContent('Luna');
    expect(historyRows[1]).toHaveTextContent('Miso');
    await expectNoCriticalAccessibilityViolations(container);
  });

  it('localizes appointment content and date presentation', () => {
    localStorage.setItem('language', 'en');
    render(<LanguageProvider><AppointmentsView /></LanguageProvider>);

    expect(screen.getByRole('heading', { name: 'My appointments' })).toBeInTheDocument();
    const upcoming = screen.getByRole('region', { name: 'Upcoming appointments' });
    expect(within(upcoming).getByText('Next appointment')).toBeInTheDocument();
    expect(within(upcoming).getByText('Vaccination')).toBeInTheDocument();
    expect(within(upcoming).getAllByText(/May 2035/i).length).toBeGreaterThan(0);
  });
});
