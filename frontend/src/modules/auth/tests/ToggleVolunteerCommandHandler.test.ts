import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToggleVolunteerCommandHandler } from '../application/commands/ToggleVolunteerCommandHandler';
import { ToggleVolunteerCommand } from '../application/commands/ToggleVolunteerCommand';
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

describe('ToggleVolunteerCommandHandler', () => {
  let handler: ToggleVolunteerCommandHandler;
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

    handler = new ToggleVolunteerCommandHandler(mockRepository);
  });

  it('should create volunteer profile successfully', async () => {
    // Arrange
    const command = new ToggleVolunteerCommand(true, 'I love animals and want to help');
    const mockUpdatedUser = {
      id: 1,
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      type: UserType.VOLUNTEER
    };
    
    localStorageMock.getItem.mockReturnValue('valid-token');
    vi.mocked(mockRepository.toggleVolunteer).mockResolvedValue(mockUpdatedUser);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.toggleVolunteer).toHaveBeenCalledWith('valid-token', {
      description: 'I love animals and want to help'
    });
    expect(result).toEqual(mockUpdatedUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockUpdatedUser));
  });

  it('should delete volunteer profile successfully', async () => {
    // Arrange
    const command = new ToggleVolunteerCommand(false);
    const mockUpdatedUser = {
      id: 1,
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      type: UserType.OWNER
    };
    
    localStorageMock.getItem.mockReturnValue('valid-token');
    vi.mocked(mockRepository.toggleVolunteer).mockResolvedValue(mockUpdatedUser);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.toggleVolunteer).toHaveBeenCalledWith('valid-token', undefined);
    expect(result).toEqual(mockUpdatedUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockUpdatedUser));
  });

  it('should throw error when no auth token is found', async () => {
    // Arrange
    const command = new ToggleVolunteerCommand(true, 'Description');
    localStorageMock.getItem.mockReturnValue(null);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('No authentication token found');
    expect(mockRepository.toggleVolunteer).not.toHaveBeenCalled();
  });

  it('should throw error when becoming volunteer without description', async () => {
    // Arrange
    const command = new ToggleVolunteerCommand(true, '');
    localStorageMock.getItem.mockReturnValue('valid-token');

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Description is required to become a volunteer');
    expect(mockRepository.toggleVolunteer).not.toHaveBeenCalled();
  });

  it('should throw error when becoming volunteer with whitespace-only description', async () => {
    // Arrange
    const command = new ToggleVolunteerCommand(true, '   ');
    localStorageMock.getItem.mockReturnValue('valid-token');

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Description is required to become a volunteer');
    expect(mockRepository.toggleVolunteer).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    // Arrange
    const command = new ToggleVolunteerCommand(true, 'Description');
    localStorageMock.getItem.mockReturnValue('valid-token');
    vi.mocked(mockRepository.toggleVolunteer).mockRejectedValue(new Error('User is already a volunteer'));

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('User is already a volunteer');
  });
});
