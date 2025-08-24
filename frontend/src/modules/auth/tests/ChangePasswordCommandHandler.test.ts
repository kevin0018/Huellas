import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChangePasswordCommandHandler } from '../application/commands/ChangePasswordCommandHandler';
import { ChangePasswordCommand } from '../application/commands/ChangePasswordCommand';
import type { AuthRepository } from '../domain/AuthRepository';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('ChangePasswordCommandHandler', () => {
  let handler: ChangePasswordCommandHandler;
  let mockRepository: AuthRepository;

  beforeEach(() => {
    // Clear localStorage mock before each test
    vi.clearAllMocks();
    
    mockRepository = {
      login: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      getCurrentUser: vi.fn(),
      toggleVolunteer: vi.fn()
    };

    handler = new ChangePasswordCommandHandler(mockRepository);
  });

  it('should change password successfully with valid token', async () => {
    // Arrange
    const command = new ChangePasswordCommand('oldPassword', 'newPassword123');
    localStorageMock.getItem.mockReturnValue('valid-token');
    vi.mocked(mockRepository.changePassword).mockResolvedValue();

    // Act
    await handler.handle(command);

    // Assert
    expect(mockRepository.changePassword).toHaveBeenCalledWith('valid-token', {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123'
    });
  });

  it('should throw error when no auth token is found', async () => {
    // Arrange
    const command = new ChangePasswordCommand('oldPassword', 'newPassword123');
    localStorageMock.getItem.mockReturnValue(null);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('No authentication token found');
    expect(mockRepository.changePassword).not.toHaveBeenCalled();
  });

  it('should throw error when current and new passwords are the same', async () => {
    // Arrange
    const command = new ChangePasswordCommand('samePassword', 'samePassword');
    localStorageMock.getItem.mockReturnValue('valid-token');

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('New password must be different from current password');
    expect(mockRepository.changePassword).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    // Arrange
    const command = new ChangePasswordCommand('wrongPassword', 'newPassword123');
    localStorageMock.getItem.mockReturnValue('valid-token');
    vi.mocked(mockRepository.changePassword).mockRejectedValue(new Error('Current password is incorrect'));

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Current password is incorrect');
  });
});
