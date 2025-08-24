import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateUserProfileCommandHandler } from '../../../../app/commands/updateProfile/UpdateUserProfileCommandHandler.js';
import { UpdateUserProfileCommand } from '../../../../app/commands/updateProfile/UpdateUserProfileCommand.js';
import { AuthRepository } from '../../../../domain/repositories/AuthRepository.js';
import { UserAuth, UserType } from '../../../../domain/entities/UserAuth.js';

describe('UpdateUserProfileCommandHandler', () => {
  let handler: UpdateUserProfileCommandHandler;
  let mockRepository: AuthRepository;
  let mockUser: UserAuth;

  beforeEach(() => {
    mockUser = UserAuth.create(
      1,
      'John',
      'Doe',
      'john@example.com',
      'hashedpassword',
      UserType.OWNER
    );

    mockRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      verifyPassword: vi.fn(),
      updateProfile: vi.fn(),
      updatePassword: vi.fn(),
      createVolunteerProfile: vi.fn(),
      deleteVolunteerProfile: vi.fn(),
      getUserWithDescription: vi.fn(),
      hasVolunteerProfile: vi.fn()
    };

    handler = new UpdateUserProfileCommandHandler(mockRepository);
  });

  it('should update profile successfully when email is not taken', async () => {
    // Arrange
    const command = new UpdateUserProfileCommand(1, 'Jane', 'Smith', 'jane@example.com');
    const updatedUser = UserAuth.create(1, 'Jane', 'Smith', 'jane@example.com', 'hashedpassword', UserType.OWNER);
    
    (mockRepository.findByEmail as any).mockResolvedValue(null);
    (mockRepository.updateProfile as any).mockResolvedValue(updatedUser);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.findByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(mockRepository.updateProfile).toHaveBeenCalledWith(1, 'Jane', 'Smith', 'jane@example.com');
    expect(result).toBe(updatedUser);
  });

  it('should update profile successfully when email belongs to same user', async () => {
    // Arrange
    const command = new UpdateUserProfileCommand(1, 'Jane', 'Smith', 'john@example.com');
    const updatedUser = UserAuth.create(1, 'Jane', 'Smith', 'john@example.com', 'hashedpassword', UserType.OWNER);
    
    (mockRepository.findByEmail as any).mockResolvedValue(mockUser);
    (mockRepository.updateProfile as any).mockResolvedValue(updatedUser);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(mockRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockRepository.updateProfile).toHaveBeenCalledWith(1, 'Jane', 'Smith', 'john@example.com');
    expect(result).toBe(updatedUser);
  });

  it('should throw error when email is already taken by different user', async () => {
    // Arrange
    const command = new UpdateUserProfileCommand(1, 'Jane', 'Smith', 'taken@example.com');
    const existingUser = UserAuth.create(2, 'Other', 'User', 'taken@example.com', 'hashedpassword', UserType.OWNER);
    
    (mockRepository.findByEmail as any).mockResolvedValue(existingUser);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Email already exists');
    expect(mockRepository.updateProfile).not.toHaveBeenCalled();
  });
});
