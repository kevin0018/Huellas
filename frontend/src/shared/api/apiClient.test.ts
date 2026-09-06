import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../modules/auth/infra/AuthService';
import { ApiError, apiClient } from './apiClient';
import { apiUrl } from './apiConfig';

vi.mock('../../modules/auth/infra/AuthService', () => ({
  AuthService: { getToken: vi.fn() },
}));

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the shared API base and adds authentication', async () => {
    vi.mocked(AuthService.getToken).mockReturnValue('token');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 4 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get<{ id: number }>('/pets/4')).resolves.toEqual({ id: 4 });
    expect(fetchMock).toHaveBeenCalledWith(apiUrl('/pets/4'), expect.objectContaining({
      method: 'GET',
      headers: expect.any(Headers),
    }));
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token');
  });

  it('serializes JSON requests consistently', async () => {
    vi.mocked(AuthService.getToken).mockReturnValue(null);
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.post('/appointments', { petId: 3 });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.body).toBe('{"petId":3}');
    expect((init.headers as Headers).get('Content-Type')).toBe('application/json');
  });

  it('exposes normalized API errors with their status', async () => {
    vi.mocked(AuthService.getToken).mockReturnValue(null);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'No permitido' }), {
      status: 403,
    })));

    await expect(apiClient.get('/private')).rejects.toEqual(new ApiError('No permitido', 403));
  });
});
