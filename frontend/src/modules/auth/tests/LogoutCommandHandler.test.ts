import { describe, it, expect, vi } from 'vitest';
import { LogoutCommandHandler } from '../app/LogoutCommandHandler';
import { LogoutCommand } from '../app/LogoutCommand';
import type { AuthRepository } from '../domain/AuthRepository';

describe('LogoutCommandHandler', () => {
  it('should call repository logout method', async () => {
    // Arrange
    const mockAuthRepository: AuthRepository = {
      login: vi.fn(),
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
      logout: vi.fn().mockRejectedValue(error)
    };
    const handler = new LogoutCommandHandler(mockAuthRepository);
    const command = new LogoutCommand();

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Network error');
  });
});
