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

describe('request correlation', () => {
  it('generates an independent request ID while preserving headers and request bodies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    await fetchResponse('/api/pets', { method: 'POST', headers: { Authorization: 'Bearer private-token' }, body: 'private-health-note' });
    await fetchResponse('/api/pets');
    const first = fetchMock.mock.calls[0][1] as RequestInit;
    const second = fetchMock.mock.calls[1][1] as RequestInit;
    const firstId = new Headers(first.headers).get('X-Request-ID');
    expect(firstId).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/);
    expect(new Headers(second.headers).get('X-Request-ID')).not.toBe(firstId);
    expect(new Headers(first.headers).get('Authorization')).toBe('Bearer private-token');
    expect(first.body).toBe('private-health-note');
  });

  it('preserves a valid ID and Request headers, replacing untrusted text', async () => {
    const id = 'de6712c8-d2ae-4ee0-9c7a-c248a319c72d';
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    await fetchResponse(new Request('https://example.test/api/pets', { headers: { 'X-Request-ID': id, Authorization: 'Bearer token' } }));
    expect(new Headers(fetchMock.mock.calls[0][1].headers).get('X-Request-ID')).toBe(id);
    expect(new Headers(fetchMock.mock.calls[0][1].headers).get('Authorization')).toBe('Bearer token');
    await fetchResponse('/api/pets', { headers: { 'X-Request-ID': 'private-diagnosis' } });
    expect(new Headers(fetchMock.mock.calls[1][1].headers).get('X-Request-ID')).not.toBe('private-diagnosis');
  });

  it('attaches the server correlation ID to normalized errors without changing the message', async () => {
    const id = 'de6712c8-d2ae-4ee0-9c7a-c248a319c72d';
    await expect(ensureResponseOk(new Response('{"error":"No permitido"}', { status: 403, headers: { 'X-Request-ID': id } })))
      .rejects.toMatchObject({ status: 403, message: 'No permitido', requestId: id });
    await expect(ensureResponseOk(new Response('', { status: 503, headers: { 'X-Request-ID': 'private-text' } })))
      .rejects.toMatchObject({ status: 503, requestId: undefined });
  });
});
