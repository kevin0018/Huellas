import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClientError } from '../errors/ClientError';
import { ApiError, ensureResponseOk, fetchResponse } from './response';
import { ApiAppointmentRepository } from '../../modules/appointment/infra/ApiAppointmentRepository';

vi.mock('../../modules/auth/infra/AuthService', () => ({ AuthService: { getToken: () => 'token' } }));
afterEach(() => vi.unstubAllGlobals());

describe('HTTP error provenance', () => {
  it.each([
    ['JSON error', JSON.stringify({ error: 'Mensaje del servidor' })],
    ['JSON message', JSON.stringify({ message: 'Mensaje del servidor' })],
    ['plain text', 'Mensaje del servidor'],
    ['JSON string', JSON.stringify('Mensaje del servidor')],
  ])('preserves a %s message and its status', async (_format, body) => {
    await expect(ensureResponseOk(new Response(body, { status: 403 }))).rejects.toEqual(new ApiError('Mensaje del servidor', 403));
  });

  it.each(['', '{}', '{"error":null}', '{"message":42}'])('marks an unusable response as a local fallback (%s)', async body => {
    await expect(ensureResponseOk(new Response(body, { status: 503 }), 'LOAD_REMINDERS')).rejects.toMatchObject({
      name: 'ApiError', status: 503, fallbackCode: 'LOAD_REMINDERS',
    });
  });

  it('does not consume successful response bodies', async () => {
    const response = new Response(JSON.stringify({ id: 9 }));
    await ensureResponseOk(response);
    expect(await response.json()).toEqual({ id: 9 });
  });

  it('retains the original network failure as its cause', async () => {
    const cause = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));
    await expect(fetchResponse('/api/pets')).rejects.toEqual(new ClientError('NETWORK', { cause }));
  });

  it('preserves cancellation instead of reporting a network failure', async () => {
    const cause = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));
    await expect(fetchResponse('/api/pets')).rejects.toBe(cause);
  });

  it('preserves legacy empty appointment lists returned as a bodyless 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    await expect(new ApiAppointmentRepository().getAppointments()).resolves.toEqual([]);
  });
});
