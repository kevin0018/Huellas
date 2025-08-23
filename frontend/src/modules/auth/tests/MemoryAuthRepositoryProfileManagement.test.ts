import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryAuthRepository } from '../infra/MemoryAuthRepository';
import { UserType } from '../domain/User';

describe('MemoryAuthRepository - Profile Management', () => {
  let repository: MemoryAuthRepository;
  let userToken: string;

  beforeEach(async () => {
    repository = new MemoryAuthRepository();
    
    // Login to get a token for testing
    const loginResponse = await repository.login('owner@example.com', 'password123');
    userToken = loginResponse.token;
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      // Act
      const updatedUser = await repository.updateProfile(userToken, {
        name: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
      });

      // Assert
      expect(updatedUser.name).toBe('Jane');
      expect(updatedUser.lastName).toBe('Smith');
      expect(updatedUser.email).toBe('jane.smith@example.com');
      expect(updatedUser.type).toBe(UserType.OWNER);
    });

    it('should throw error with invalid token', async () => {
      // Act & Assert
      await expect(
        repository.updateProfile('invalid-token', {
          name: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
        })
      ).rejects.toThrow('Invalid token');
    });

    it('should throw error when email is already taken', async () => {
      // Act & Assert
      await expect(
        repository.updateProfile(userToken, {
          name: 'John',
          lastName: 'Doe',
          email: 'volunteer@example.com' // Email already exists
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should allow updating to same user email', async () => {
      // Act
      const updatedUser = await repository.updateProfile(userToken, {
        name: 'John Updated',
        lastName: 'Doe Updated',
        email: 'owner@example.com' // Same email
      });

      // Assert
      expect(updatedUser.name).toBe('John Updated');
      expect(updatedUser.lastName).toBe('Doe Updated');
      expect(updatedUser.email).toBe('owner@example.com');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Act
      await repository.changePassword(userToken, {
        currentPassword: 'password123',
        newPassword: 'newPassword456'
      });

      // Assert - Try to login with new password
      const loginResponse = await repository.login('owner@example.com', 'newPassword456');
      expect(loginResponse.user.email).toBe('owner@example.com');
    });

    it('should throw error with invalid token', async () => {
      // Act & Assert
      await expect(
        repository.changePassword('invalid-token', {
          currentPassword: 'password123',
          newPassword: 'newPassword456'
        })
      ).rejects.toThrow('Invalid token');
    });

    it('should throw error with incorrect current password', async () => {
      // Act & Assert
      await expect(
        repository.changePassword(userToken, {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword456'
        })
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should verify old password no longer works after change', async () => {
      // Arrange
      await repository.changePassword(userToken, {
        currentPassword: 'password123',
        newPassword: 'newPassword456'
      });

      // Act & Assert
      await expect(
        repository.login('owner@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('toggleVolunteer', () => {
    it('should create volunteer profile successfully', async () => {
      // Act
      const updatedUser = await repository.toggleVolunteer(userToken, {
        description: 'I love animals and want to help'
      });

      // Assert
      expect(updatedUser.type).toBe(UserType.VOLUNTEER);
      expect(updatedUser.email).toBe('owner@example.com');
    });

    it('should delete volunteer profile successfully', async () => {
      // Arrange - First become a volunteer
      await repository.toggleVolunteer(userToken, {
        description: 'I love animals'
      });

      // Act - Then stop being a volunteer
      const updatedUser = await repository.toggleVolunteer(userToken);

      // Assert
      expect(updatedUser.type).toBe(UserType.OWNER);
    });

    it('should throw error with invalid token', async () => {
      // Act & Assert
      await expect(
        repository.toggleVolunteer('invalid-token', {
          description: 'Description'
        })
      ).rejects.toThrow('Invalid token');
    });

    it('should throw error when already a volunteer', async () => {
      // Arrange - First become a volunteer
      await repository.toggleVolunteer(userToken, {
        description: 'I love animals'
      });

      // Act & Assert
      await expect(
        repository.toggleVolunteer(userToken, {
          description: 'Another description'
        })
      ).rejects.toThrow('User is already a volunteer');
    });

    it('should throw error when not a volunteer and trying to delete', async () => {
      // Act & Assert
      await expect(
        repository.toggleVolunteer(userToken)
      ).rejects.toThrow('User is not a volunteer');
    });
  });

  describe('end-to-end workflow', () => {
    it('should handle complete user profile management workflow', async () => {
      // 1. Update basic profile
      const updatedProfile = await repository.updateProfile(userToken, {
        name: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
      });
      expect(updatedProfile.name).toBe('Jane');

      // 2. Change password
      await repository.changePassword(userToken, {
        currentPassword: 'password123',
        newPassword: 'newSecurePassword'
      });

      // 3. Become a volunteer
      const volunteerUser = await repository.toggleVolunteer(userToken, {
        description: 'Passionate about animal welfare'
      });
      expect(volunteerUser.type).toBe(UserType.VOLUNTEER);

      // 4. Verify login with new password works
      const newLoginResponse = await repository.login('jane.smith@example.com', 'newSecurePassword');
      expect(newLoginResponse.user.type).toBe(UserType.VOLUNTEER);

      // 5. Stop being a volunteer
      const ownerUser = await repository.toggleVolunteer(newLoginResponse.token);
      expect(ownerUser.type).toBe(UserType.OWNER);
    });
  });
});
