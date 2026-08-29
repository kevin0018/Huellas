// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatView from './chatView';

const mocks = vi.hoisted(() => ({
  selectConversation: vi.fn(),
}));

vi.mock('../Components/NavBar', () => ({ default: () => <nav>Huellas</nav> }));
vi.mock('../Components/GoBackButton', () => ({ default: () => <button type="button">Atrás</button> }));
vi.mock('../modules/auth/infra/AuthService', () => ({
  AuthService: { getUser: () => ({ id: 1 }) },
}));
vi.mock('../modules/chat/application/useChat', () => ({
  useChat: () => ({
    conversations: [{
      id: 7,
      title: 'Consulta sobre: Paseo de Nala',
      participants: [
        { id: 1, name: 'Kevin', lastName: 'Tutor' },
        { id: 2, name: 'Marta', lastName: 'Voluntaria' },
      ],
      unreadCount: 1,
      isArchived: false,
    }],
    selectedConversation: null,
    messages: [],
    loading: false,
    error: null,
    selectConversation: mocks.selectConversation,
    sendMessage: vi.fn(),
    setError: vi.fn(),
  }),
}));

describe('ChatView', () => {
  beforeEach(() => {
    mocks.selectConversation.mockReset().mockResolvedValue(undefined);
  });

  it('switches from the conversation list to the thread on narrow layouts', async () => {
    render(
      <MemoryRouter>
        <ChatView />
      </MemoryRouter>,
    );

    const sidebar = screen.getByRole('complementary', { name: 'Conversaciones' });
    const thread = screen.getByRole('region', { name: 'Conversación activa' });

    expect(sidebar.getAttribute('data-mobile-hidden')).toBe('false');
    expect(thread.getAttribute('data-mobile-hidden')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: /Consulta sobre: Paseo de Nala/i }));

    await waitFor(() => expect(mocks.selectConversation).toHaveBeenCalledTimes(1));
    expect(sidebar.getAttribute('data-mobile-hidden')).toBe('true');
    expect(thread.getAttribute('data-mobile-hidden')).toBe('false');
  });
});
