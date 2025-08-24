import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiAuthRepository } from '../infra/ApiAuthRepository';
import { AuthService } from '../infra/AuthService';
import { UserType } from '../domain/User';

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

      // Act
      const result = await repository.getCurrentUser();

      // Assert
      expect(result).toEqual(mockUser);
      expect(AuthService.getUser).toHaveBeenCalledOnce();
    });

    it('should return null when no user in AuthService', async () => {
      // Arrange
      vi.mocked(AuthService.getUser).mockReturnValue(null);

      // Act
      const result = await repository.getCurrentUser();

      // Assert
      expect(result).toBeNull();
      expect(AuthService.getUser).toHaveBeenCalledOnce();
    });
  });
});
