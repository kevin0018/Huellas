import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import type { Socket } from 'socket.io';
import { authenticateChatSocket } from '../../../infra/websocket/ChatSocketHandler.js';

describe('authenticateChatSocket', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'chat-test-secret';
  });

  it('rejects a connection without a token', async () => {
    const socket = { handshake: { auth: {} }, data: {} } as unknown as Socket;
    const next = vi.fn();

    await authenticateChatSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unauthorized' }));
  });

  it('rejects a connection with an invalid token', async () => {
    const socket = { handshake: { auth: { token: 'invalid' } }, data: {} } as unknown as Socket;
    const next = vi.fn();

    await authenticateChatSocket(socket, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unauthorized' }));
  });

  it('derives the socket identity from a valid token', async () => {
    const token = jwt.sign(
      { userId: 7, email: 'owner@example.com', type: 'owner' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    const socket = { handshake: { auth: { token } }, data: {} } as unknown as Socket;
    const next = vi.fn();

    await authenticateChatSocket(socket, next);

    expect(socket.data.userId).toBe(7);
    expect(next).toHaveBeenCalledWith();
  });
});
