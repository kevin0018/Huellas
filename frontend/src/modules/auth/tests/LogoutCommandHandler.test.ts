import { describe, it, expect, vi } from 'vitest';
import { LogoutCommandHandler } from '../application/commands/LogoutCommandHandler';
import { LogoutCommand } from '../application/commands/LogoutCommand';
import type { AuthRepository } from '../domain/AuthRepository';

describe('LogoutCommandHandler', () => {
  it('should call repository logout method', async () => {
    // Arrange
    const mockAuthRepository: AuthRepository = {
      login: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      getCurrentUser: vi.fn(),
      toggleVolunteer: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined)
    };
    const handler = new LogoutCommandHandler(mockAuthRepository);
    const command = new LogoutCommand();

    // Act
    await handler.handle(command);

    // Assert
    expect(mockAuthRepository.logout).toHaveBeenCalledOnce();
  });

  it('should propagate repository errors', async () => {
    // Arrange
    const error = new Error('Network error');
    const mockAuthRepository: AuthRepository = {
      login: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      getCurrentUser: vi.fn(),
      toggleVolunteer: vi.fn(),
      logout: vi.fn().mockRejectedValue(error)
    };
    const handler = new LogoutCommandHandler(mockAuthRepository);
    const command = new LogoutCommand();

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Network error');
  });
});
