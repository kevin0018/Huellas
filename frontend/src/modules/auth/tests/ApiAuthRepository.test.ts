import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiAuthRepository } from '../infra/ApiAuthRepository';
import { AuthService } from '../infra/AuthService';
import { UserType } from '../domain/User';
import { ApiError } from '../../../shared/api/apiClient';

// Mock AuthService
vi.mock('../infra/AuthService', () => ({
  AuthService: {
    getUser: vi.fn(),
    getToken: vi.fn(),
    saveAuth: vi.fn(),
    logout: vi.fn(),
  }
}));

describe('ApiAuthRepository', () => {
  let repository: ApiAuthRepository;

  beforeEach(() => {
    repository = new ApiAuthRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('login', () => {
    it('normalizes the email and preserves the API response', async () => {
      const responseBody = {
        token: 'token',
        user: { id: 24, name: 'Juan', lastName: 'García', email: 'juan@email.com', type: UserType.OWNER },
      };
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
      vi.stubGlobal('fetch', fetchMock);

      await expect(repository.login('  JUAN@EMAIL.COM ', 'huellas123')).resolves.toEqual(responseBody);

      expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/login$/), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'juan@email.com', password: 'huellas123' }),
      }));
    });

    it('preserves the response status and message for the interface', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
        error: 'Too many login attempts. Try again later.',
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })));

      await expect(repository.login('juan@email.com', 'wrong')).rejects.toEqual(
        new ApiError('Too many login attempts. Try again later.', 429),
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from AuthService when available', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        type: UserType.OWNER
      };
      
      vi.mocked(AuthService.getUser).mockReturnValue(mockUser);
      vi.mocked(AuthService.getToken).mockReturnValue('valid-token');

      // Act
      const result = await repository.getCurrentUser();

      // Assert
      expect(result).toEqual(mockUser);
      expect(AuthService.getUser).toHaveBeenCalledOnce();
    });

    it('should return null when no user in AuthService', async () => {
      // Arrange
      vi.mocked(AuthService.getUser).mockReturnValue(null);
      vi.mocked(AuthService.getToken).mockReturnValue(null);

      // Act
      const result = await repository.getCurrentUser();

      // Assert
      expect(result).toBeNull();
      expect(AuthService.getUser).toHaveBeenCalledOnce();
    });
  });
});
