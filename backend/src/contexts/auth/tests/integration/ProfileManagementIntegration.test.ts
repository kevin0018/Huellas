import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAuthRepository } from '../../infra/repositories/MemoryAuthRepository.js';
import { UpdateUserProfileCommandHandler } from '../../app/commands/updateProfile/UpdateUserProfileCommandHandler.js';
import { ChangePasswordCommandHandler } from '../../app/commands/changePassword/ChangePasswordCommandHandler.js';
import { 
  CreateVolunteerProfileCommandHandler,
  DeleteVolunteerProfileCommandHandler 
} from '../../app/commands/toggleVolunteer/VolunteerCommandHandlers.js';
import { UpdateUserProfileCommand } from '../../app/commands/updateProfile/UpdateUserProfileCommand.js';
import { ChangePasswordCommand } from '../../app/commands/changePassword/ChangePasswordCommand.js';
import { 
  CreateVolunteerProfileCommand,
  DeleteVolunteerProfileCommand 
} from '../../app/commands/toggleVolunteer/VolunteerCommands.js';
import { UserAuth, UserType } from '../../domain/entities/UserAuth.js';
import bcrypt from 'bcrypt';

describe('Profile Management Integration Tests', () => {
  let repository: MemoryAuthRepository;
  let updateProfileHandler: UpdateUserProfileCommandHandler;
  let changePasswordHandler: ChangePasswordCommandHandler;
  let createVolunteerHandler: CreateVolunteerProfileCommandHandler;
  let deleteVolunteerHandler: DeleteVolunteerProfileCommandHandler;
  let testUser: UserAuth;

  beforeEach(async () => {
    repository = new MemoryAuthRepository();
    updateProfileHandler = new UpdateUserProfileCommandHandler(repository);
    changePasswordHandler = new ChangePasswordCommandHandler(repository);
    createVolunteerHandler = new CreateVolunteerProfileCommandHandler(repository);
    deleteVolunteerHandler = new DeleteVolunteerProfileCommandHandler(repository);

    // Create a test user with hashed password
    const hashedPassword = await bcrypt.hash('testPassword123', 10);
    testUser = UserAuth.create(
      1,
      'John',
      'Doe',
      'john@example.com',
      hashedPassword,
      UserType.OWNER
    );
    await repository.save(testUser);
  });

  describe('Profile Update Integration', () => {
    it('should update user profile successfully', async () => {
      // Act
      const updatedUser = await updateProfileHandler.handle(
        new UpdateUserProfileCommand(1, 'Jane', 'Smith', 'jane@example.com')
      );

      // Assert
      expect(updatedUser.name).toBe('Jane');
      expect(updatedUser.lastName).toBe('Smith');
      expect(updatedUser.email).toBe('jane@example.com');

      // Verify the user is actually updated in repository
      const storedUser = await repository.findById(1);
      expect(storedUser).toEqual(updatedUser);
    });

    it('should prevent email conflicts during update', async () => {
      // Arrange: Create another user with a different email
      const otherUser = UserAuth.create(
        2,
        'Other',
        'User',
        'other@example.com',
        'hashedpassword',
        UserType.OWNER
      );
      await repository.save(otherUser);

      // Act & Assert
      await expect(
        updateProfileHandler.handle(
          new UpdateUserProfileCommand(1, 'Jane', 'Smith', 'other@example.com')
        )
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('Password Change Integration', () => {
    it('should change password successfully', async () => {
      // Act
      await changePasswordHandler.handle(
        new ChangePasswordCommand(1, 'testPassword123', 'newPassword456')
      );

      // Assert: Verify the password was actually changed
      const updatedUser = await repository.findById(1);
      expect(updatedUser).not.toBeNull();
      
      // Verify old password no longer works
      const oldPasswordValid = await repository.verifyPassword('testPassword123', updatedUser!.password);
      expect(oldPasswordValid).toBe(false);

      // Verify new password works
      const newPasswordValid = await repository.verifyPassword('newPassword456', updatedUser!.password);
      expect(newPasswordValid).toBe(true);
    });

    it('should reject incorrect current password', async () => {
      // Act & Assert
      await expect(
        changePasswordHandler.handle(
          new ChangePasswordCommand(1, 'wrongPassword', 'newPassword456')
        )
      ).rejects.toThrow('Current password is incorrect');

      // Verify password was not changed
      const user = await repository.findById(1);
      const passwordValid = await repository.verifyPassword('testPassword123', user!.password);
      expect(passwordValid).toBe(true);
    });
  });

  describe('Volunteer Profile Integration', () => {
    it('should create and delete volunteer profile successfully', async () => {
      // Act: Create volunteer profile
      await createVolunteerHandler.handle(
        new CreateVolunteerProfileCommand(1, 'Animal lover with 5 years of experience')
      );

      // Assert: Verify volunteer profile was created
      expect(await repository.hasVolunteerProfile(1)).toBe(true);
      
      // Verify user type remains OWNER (users don't change type when becoming volunteers)
      const userAfterCreate = await repository.findById(1);
      expect(userAfterCreate!.type).toBe(UserType.OWNER);

      // Act: Delete volunteer profile
      await deleteVolunteerHandler.handle(
        new DeleteVolunteerProfileCommand(1)
      );

      // Assert: Verify volunteer profile was deleted
      expect(await repository.hasVolunteerProfile(1)).toBe(false);
      
      // Verify user type remains OWNER
      const userAfterDelete = await repository.findById(1);
      expect(userAfterDelete!.type).toBe(UserType.OWNER);
    });

    it('should prevent creating duplicate volunteer profiles', async () => {
      // Arrange: Create volunteer profile first
      await createVolunteerHandler.handle(
        new CreateVolunteerProfileCommand(1, 'Initial description')
      );

      // Act & Assert: Try to create another profile
      await expect(
        createVolunteerHandler.handle(
          new CreateVolunteerProfileCommand(1, 'Duplicate description')
        )
      ).rejects.toThrow('User already has a volunteer profile');
    });

    it('should prevent deleting non-existent volunteer profile', async () => {
      // Act & Assert
      await expect(
        deleteVolunteerHandler.handle(
          new DeleteVolunteerProfileCommand(1)
        )
      ).rejects.toThrow('User does not have a volunteer profile');
    });
  });

  describe('End-to-End User Lifecycle', () => {
    it('should handle complete user profile management workflow', async () => {
      // 1. Update basic profile
      const updatedUser = await updateProfileHandler.handle(
        new UpdateUserProfileCommand(1, 'Jane', 'Smith', 'jane.smith@example.com')
      );
      expect(updatedUser.name).toBe('Jane');
      expect(updatedUser.email).toBe('jane.smith@example.com');

      // 2. Change password
      await changePasswordHandler.handle(
        new ChangePasswordCommand(1, 'testPassword123', 'newSecurePassword')
      );

      // 3. Become a volunteer
      await createVolunteerHandler.handle(
        new CreateVolunteerProfileCommand(1, 'Passionate about animal welfare')
      );
      expect(await repository.hasVolunteerProfile(1)).toBe(true);

      // 4. Update profile again (should still work)
      const finalUser = await updateProfileHandler.handle(
        new UpdateUserProfileCommand(1, 'Jane', 'Wilson', 'jane.wilson@example.com')
      );
      expect(finalUser.lastName).toBe('Wilson');
      expect(finalUser.type).toBe(UserType.OWNER); // User remains OWNER even with volunteer profile

      // 5. Stop being a volunteer
      await deleteVolunteerHandler.handle(
        new DeleteVolunteerProfileCommand(1)
      );
      
      const finalUserState = await repository.findById(1);
      expect(finalUserState!.type).toBe(UserType.OWNER); // Still OWNER
      expect(finalUserState!.lastName).toBe('Wilson');
      expect(await repository.hasVolunteerProfile(1)).toBe(false);
    });
  });
});
