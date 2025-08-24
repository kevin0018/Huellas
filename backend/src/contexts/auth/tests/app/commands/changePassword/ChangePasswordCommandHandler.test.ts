import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChangePasswordCommandHandler } from '../../../../app/commands/changePassword/ChangePasswordCommandHandler.js';
import { ChangePasswordCommand } from '../../../../app/commands/changePassword/ChangePasswordCommand.js';
import { AuthRepository } from '../../../../domain/repositories/AuthRepository.js';
import { UserAuth, UserType } from '../../../../domain/entities/UserAuth.js';

describe('ChangePasswordCommandHandler', () => {
  let handler: ChangePasswordCommandHandler;
  let mockRepository: AuthRepository;
  let mockUser: UserAuth;

  beforeEach(() => {
    mockUser = UserAuth.create(
      1,
      'John',
      'Doe',
      'john@example.com',
      'hashedCurrentPassword',
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

    handler = new ChangePasswordCommandHandler(mockRepository);
  });

  it('should change password successfully when current password is correct', async () => {
    // Arrange
    const command = new ChangePasswordCommand(1, 'oldPassword', 'newPassword123');
    
    (mockRepository.findById as any).mockResolvedValue(mockUser);
    (mockRepository.verifyPassword as any).mockResolvedValue(true);
    (mockRepository.updatePassword as any).mockResolvedValue(undefined);

    // Act
    await handler.handle(command);

    // Assert
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(mockRepository.verifyPassword).toHaveBeenCalledWith('oldPassword', 'hashedCurrentPassword');
    expect(mockRepository.updatePassword).toHaveBeenCalledWith(1, 'newPassword123');
  });

  it('should throw error when user not found', async () => {
    // Arrange
    const command = new ChangePasswordCommand(1, 'oldPassword', 'newPassword123');
    
    (mockRepository.findById as any).mockResolvedValue(null);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('User not found');
    expect(mockRepository.verifyPassword).not.toHaveBeenCalled();
    expect(mockRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('should throw error when current password is incorrect', async () => {
    // Arrange
    const command = new ChangePasswordCommand(1, 'wrongPassword', 'newPassword123');
    
    (mockRepository.findById as any).mockResolvedValue(mockUser);
    (mockRepository.verifyPassword as any).mockResolvedValue(false);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow('Current password is incorrect');
    expect(mockRepository.updatePassword).not.toHaveBeenCalled();
  });
});
