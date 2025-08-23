import { describe, it, expect, vi } from 'vitest';
import { LoginCommand } from '../application/commands/LoginCommand';
import { LoginCommandHandler } from '../application/commands/LoginCommandHandler';
import { MemoryAuthRepository } from '../infra/MemoryAuthRepository';

describe('LoginCommandHandler', () => {
  it('should call repository with email and password', async () => {
    // Arrange
    const mockRepository = {
      login: vi.fn().mockResolvedValue({
        token: 'mock-token',
        user: {
          id: 1,
          name: 'John',
          lastName: 'Doe',
          email: 'owner@example.com',
          type: 'owner'
        }
      }),
      logout: vi.fn().mockResolvedValue(undefined)
    };
    const handler = new LoginCommandHandler(mockRepository);
    const command = new LoginCommand('owner@example.com', 'password123');

    // Act
    await handler.execute(command);

    // Assert
    expect(mockRepository.login).toHaveBeenCalledTimes(1);
    expect(mockRepository.login).toHaveBeenCalledWith('owner@example.com', 'password123');
  });

  it('should throw if repository fails', async () => {
    // Arrange
    const repository = new MemoryAuthRepository();
    const handler = new LoginCommandHandler(repository);
    const command = new LoginCommand('invalid@example.com', 'wrongPassword');

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow('Invalid email or password');
  });
});
