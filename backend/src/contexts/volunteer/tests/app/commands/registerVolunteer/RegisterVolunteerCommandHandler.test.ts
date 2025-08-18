import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterVolunteerCommandHandler } from '../../../../app/commands/register/RegisterVolunteerCommandHandler.js';
import { RegisterVolunteerCommand } from '../../../../app/commands/register/RegisterVolunteerCommand.js';
import { VolunteerRepository } from '../../../../domain/repositories/VolunteerRepository.js';
import { Volunteer } from '../../../../domain/entities/Volunteer.js';

describe('RegisterVolunteerCommandHandler', () => {
  let handler: RegisterVolunteerCommandHandler;
  let mockRepository: VolunteerRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn().mockResolvedValue(123),
      delete: vi.fn()
    };
    handler = new RegisterVolunteerCommandHandler(mockRepository);
  });

  describe('execute', () => {
    it('should register volunteer successfully with valid data', async () => {
      const command = new RegisterVolunteerCommand(
        'Jane',
        'Smith',
        'jane@example.com',
        'securePassword123',
        'I love helping animals and have veterinary experience'
      );

      vi.mocked(mockRepository.save).mockResolvedValue(123);

      const result = await handler.execute(command);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(result.message).toBe('Volunteer registered successfully');
      expect(result.id).toBe(123); // Should return the mocked generated ID
      expect(typeof result.id).toBe('number');
    });

    it('should throw error with invalid email format', async () => {
      const command = new RegisterVolunteerCommand(
        'Jane',
        'Smith',
        'invalid-email',
        'securePassword123',
        'I love helping animals'
      );

      await expect(handler.execute(command)).rejects.toThrow('Invalid email format');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error with short password', async () => {
      const command = new RegisterVolunteerCommand(
        'Jane',
        'Smith',
        'jane@example.com',
        '123',
        'I love helping animals'
      );

      await expect(handler.execute(command)).rejects.toThrow('Password must be at least 8 characters long');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error with empty name', async () => {
      const command = new RegisterVolunteerCommand(
        '',
        'Smith',
        'jane@example.com',
        'securePassword123',
        'I love helping animals'
      );

      await expect(handler.execute(command)).rejects.toThrow('Name is required');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error with empty last name', async () => {
      const command = new RegisterVolunteerCommand(
        'Jane',
        '',
        'jane@example.com',
        'securePassword123',
        'I love helping animals'
      );

      await expect(handler.execute(command)).rejects.toThrow('Last name is required');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error with empty description', async () => {
      const command = new RegisterVolunteerCommand(
        'Jane',
        'Smith',
        'jane@example.com',
        'securePassword123',
        ''
      );

      await expect(handler.execute(command)).rejects.toThrow('Description is required');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should trim and lowercase email', async () => {
      const command = new RegisterVolunteerCommand(
        'Jane',
        'Smith',
        '  jane@example.com  ',
        'securePassword123',
        'I love helping animals'
      );

      let savedVolunteer: Volunteer | undefined;
      vi.mocked(mockRepository.save).mockImplementation(async (volunteer: Volunteer) => {
        savedVolunteer = volunteer;
        return 123; // Return a generated ID
      });

      await handler.execute(command);

      expect(savedVolunteer).toBeDefined();
      expect(savedVolunteer!.email).toBe('jane@example.com');
    });

    it('should propagate repository errors', async () => {
      const command = new RegisterVolunteerCommand(
        'Jane',
        'Smith',
        'jane@example.com',
        'securePassword123',
        'I love helping animals'
      );

      vi.mocked(mockRepository.save).mockRejectedValue(new Error('Database error'));

      await expect(handler.execute(command)).rejects.toThrow('Database error');
    });
  });
});
