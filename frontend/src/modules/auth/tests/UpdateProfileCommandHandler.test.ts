import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateProfileCommandHandler } from '../application/commands/UpdateProfileCommandHandler';
import { UpdateProfileCommand } from '../application/commands/UpdateProfileCommand';
import type { AuthRepository } from '../domain/AuthRepository';
import { UserType } from '../domain/User';

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

describe('UpdateProfileCommandHandler', () => {
  let handler: UpdateProfileCommandHandler;
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

    handler = new UpdateProfileCommandHandler(mockRepository);
  });

  it('should update profile successfully with valid token', async () => {
    // Arrange
    const command = new UpdateProfileCommand('Jane', 'Smith', 'jane@example.com');
    const mockUpdatedUser = {
      id: 1,
      name: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      type: UserType.OWNER
    };
    
    localStorageMock.getItem.mockReturnValue('valid-token');
    vi.mocked(mockRepository.updateProfile).mockResolvedValue(mockUpdatedUser);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.updateProfile).toHaveBeenCalledWith('valid-token', {
      name: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com'
    });
    expect(result).toEqual(mockUpdatedUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockUpdatedUser));
  });

  it('should throw error when no auth token is found', async () => {
    // Arrange
    const command = new UpdateProfileCommand('Jane', 'Smith', 'jane@example.com');
    localStorageMock.getItem.mockReturnValue(null);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('No authentication token found');
    expect(mockRepository.updateProfile).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    // Arrange
    const command = new UpdateProfileCommand('Jane', 'Smith', 'taken@example.com');
    localStorageMock.getItem.mockReturnValue('valid-token');
    vi.mocked(mockRepository.updateProfile).mockRejectedValue(new Error('Email already exists'));

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Email already exists');
  });
});
