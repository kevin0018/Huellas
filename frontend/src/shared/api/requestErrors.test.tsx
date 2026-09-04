// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { TestLanguageProvider, switchLanguage } from '../../test/language';
import UserHome from '../../Views/UserHome';
import UserProfile from '../../Views/UserProfile';
import VolunteerHome from '../../Views/VolunteerHome';
import { useChat } from '../../modules/chat/application/useChat';
import { socketService } from '../../modules/chat/infra/SocketService';
import { useVolunteerPosts } from '../../modules/posts/application/useVolunteerPosts';
import AppointmentsView from '../../Views/AppointmentsView';
import { ApiPetRepository } from '../../modules/pet/infra/ApiPetRepository';
import { ApiHealthEventRepository } from '../../modules/health/ApiHealthEventRepository';
import { ApiReminderRepository } from '../../modules/reminder/ApiReminderRepository';
import { ApiCheckupRepository } from '../../modules/checkup/infra/ApiCheckupRepository';
import { ApiAuthRepository } from '../../modules/auth/infra/ApiAuthRepository';
import { ApiChatRepository } from '../../modules/chat/infra/ApiChatRepository';
import { ApiVolunteerPosts } from '../../modules/posts/infra/ApiVolunteerPosts';
import { ApiError } from './response';

vi.mock('../../modules/auth/infra/AuthService', () => ({ AuthService: {
  getToken: () => 'token',
  isAuthenticated: () => true,
  getAuthHeaders: () => ({ Authorization: 'Bearer token' }),
  getUser: () => ({ id: 1, name: 'María', lastName: 'García', email: 'maria@example.com', type: 'owner' }),
} }));
vi.mock('../../modules/chat/infra/SocketService', () => ({ socketService: {
  connect: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(),
} }));
vi.mock('../../Components/NavBar', () => ({ default: () => null }));
vi.mock('../../Components/footer', () => ({ default: () => null }));

const fetchMock = vi.fn();
beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); });
afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });

function renderRoute(route: string, element: React.ReactElement) {
  render(<TestLanguageProvider><MemoryRouter initialEntries={[route]}>
    <Routes><Route path={route} element={element} /></Routes>
  </MemoryRouter></TestLanguageProvider>);
}

it('translates reminder HTTP fallbacks end to end and retries only when requested', async () => {
  fetchMock.mockImplementation(async (url: string) => String(url).endsWith('/reminders')
    ? new Response(null, { status: 503 }) : new Response('[]'));
  renderRoute('/user-home', <UserHome />);
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los recordatorios');
  const calls = fetchMock.mock.calls.length;
  switchLanguage('English');
  expect(screen.getByRole('alert')).toHaveTextContent('Reminders could not be loaded');
  switchLanguage('Català');
  expect(screen.getByRole('alert')).toHaveTextContent("No s'han pogut carregar els recordatoris");
  expect(fetchMock).toHaveBeenCalledTimes(calls);
  fetchMock.mockImplementation(async (url: string) => new Response(String(url).endsWith('/reminders')
    ? JSON.stringify({ preferences: { enabled: true, leadDays: 7 }, reminders: [] }) : '[]'));
  fireEvent.click(screen.getByRole('button', { name: 'Torna-ho a provar' }));
  await screen.findByText('Tot al dia per ara');
  expect(fetchMock).toHaveBeenCalledTimes(calls + 2);
});

it('translates actual appointment network failures without starting new requests', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  renderRoute('/appointments', <AppointmentsView />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Error de conexión. Inténtalo de nuevo');
  switchLanguage('English');
  expect(screen.getByRole('alert')).toHaveTextContent('Connection error. Please try again');
  switchLanguage('Català');
  expect(screen.getByRole('alert')).toHaveTextContent('Error de connexió. Torna-ho a intentar');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('keeps a server message verbatim even when it matches local Spanish copy', async () => {
  fetchMock.mockImplementation(async (url: string) => String(url).endsWith('/reminders')
    ? new Response(JSON.stringify({ error: 'No se pudieron cargar los recordatorios' }), { status: 400 })
    : new Response('[]'));
  renderRoute('/user-home', <UserHome />);
  await screen.findByRole('alert');
  switchLanguage('English');
  expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los recordatorios');
  expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled();
});

it.each([
  ['pet', () => new ApiPetRepository().getPetById(9)],
  ['health event', () => new ApiHealthEventRepository().delete(9)],
  ['reminder', () => new ApiReminderRepository().action(9, 'complete')],
  ['reminder preferences', () => new ApiReminderRepository().preferences(false, 7)],
  ['checkup', () => new ApiCheckupRepository().create(9, { procedureId: 2 })],
  ['profile', () => new ApiAuthRepository().updateProfile('token', { name: 'María', lastName: 'García', email: 'maria@example.com' })],
  ['chat', () => new ApiChatRepository().getConversations()],
  ['post', () => new ApiVolunteerPosts().list()],
] as const)('preserves the server error in the %s adapter', async (_name, request) => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: 'Mensaje específico' }), { status: 403 }));
  await expect(request()).rejects.toEqual(new ApiError('Mensaje específico', 403));
});

it('updates chat load errors without repeating requests or socket subscriptions', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
  const { result } = renderHook(() => useChat(), { wrapper: TestLanguageProvider });
  await waitFor(() => expect(result.current.error).toBe('No se pudieron cargar las conversaciones'));
  switchLanguage('English');
  expect(result.current.error).toBe('Conversations could not be loaded');
  switchLanguage('Català');
  expect(result.current.error).toBe("No s'han pogut carregar les converses");
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(socketService.connect).toHaveBeenCalledOnce();
  expect(socketService.addEventListener).toHaveBeenCalledTimes(3);
});

it('updates board load errors without losing pagination or refetching', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
  const { result } = renderHook(() => useVolunteerPosts({ pageSize: 12 }), { wrapper: TestLanguageProvider });
  await waitFor(() => expect(result.current.error).toBe('No se pudieron cargar los anuncios'));
  switchLanguage('English');
  expect(result.current.error).toBe('Posts could not be loaded');
  switchLanguage('Català');
  expect(result.current.error).toBe("No s'han pogut carregar els anuncis");
  expect(result.current.page).toBe(1);
  expect(fetchMock).toHaveBeenCalledOnce();
});

it('translates password validation from the real application handler without sending a request', async () => {
  renderRoute('/profile', <UserProfile />);
  await screen.findByLabelText('Contraseña actual');
  for (const label of ['Contraseña actual', 'Nueva contraseña', 'Confirmar contraseña']) {
    fireEvent.change(screen.getByLabelText(label), { target: { value: 'same-password' } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('La nueva contraseña debe ser diferente de la actual.');
  switchLanguage('English');
  expect(screen.getByRole('alert')).toHaveTextContent('The new password must be different from the current password.');
  expect(screen.getByLabelText('New password')).toHaveValue('same-password');
  expect(fetchMock).not.toHaveBeenCalled();
});

it('preserves the volunteer 403 guidance for a response without a body', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 403 }));
  renderRoute('/volunteer-home', <VolunteerHome />);
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Ayuda para Miso' } });
  fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Necesito ayuda para llevarlo al veterinario' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar anuncio' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Necesitas activar tu perfil de voluntario para publicar.');
  switchLanguage('English');
  expect(screen.getByRole('alert')).toHaveTextContent('Activate your volunteer profile before publishing.');
  expect(screen.getByLabelText('Title')).toHaveValue('Ayuda para Miso');
  expect(fetchMock).toHaveBeenCalledOnce();
});
