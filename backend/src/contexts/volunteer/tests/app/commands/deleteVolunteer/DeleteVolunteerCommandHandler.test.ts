import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteVolunteerCommandHandler } from '../../../../app/commands/delete/DeleteVolunteerCommandHandler.js';
import { DeleteVolunteerCommand } from '../../../../app/commands/delete/DeleteVolunteerCommand.js';
import { VolunteerRepository } from '../../../../domain/repositories/VolunteerRepository.js';
import { Volunteer } from '../../../../domain/entities/Volunteer.js';
import { VolunteerId } from '../../../../domain/value-objects/VolunteerId.js';

describe('DeleteVolunteerCommandHandler', () => {
  let handler: DeleteVolunteerCommandHandler;
  let mockRepository: VolunteerRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn().mockResolvedValue(1),
      delete: vi.fn()
    };
    handler = new DeleteVolunteerCommandHandler(mockRepository);
  });

  describe('execute', () => {
    it('should delete volunteer successfully when volunteer exists and user is authorized', async () => {
      const volunteerId = 1;
      const requestingUserId = 1;
      const command = new DeleteVolunteerCommand(volunteerId, requestingUserId);
      
      const mockVolunteer = Volunteer.create(
        new VolunteerId(1),
        'Jane',
        'Smith',
        'jane@example.com',
        'password123',
        'I love helping animals'
      );

      vi.mocked(mockRepository.findById).mockResolvedValue(mockVolunteer);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      const result = await handler.execute(command);

      expect(mockRepository.findById).toHaveBeenCalledWith(new VolunteerId(volunteerId));
      expect(mockRepository.delete).toHaveBeenCalledWith(new VolunteerId(volunteerId));
      expect(result).toEqual({
        message: 'Volunteer account successfully deleted'
      });
    });

    it('should throw error when volunteer does not exist', async () => {
      const volunteerId = 999;
      const requestingUserId = 1;
      const command = new DeleteVolunteerCommand(volunteerId, requestingUserId);

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow('Volunteer not found');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when user tries to delete someone else account', async () => {
      const volunteerId = 1;
      const requestingUserId = 2;
      const command = new DeleteVolunteerCommand(volunteerId, requestingUserId);
      
      const mockVolunteer = Volunteer.create(
        new VolunteerId(1),
        'Jane',
        'Smith',
        'jane@example.com',
        'password123',
        'I love helping animals'
      );

      vi.mocked(mockRepository.findById).mockResolvedValue(mockVolunteer);

      await expect(handler.execute(command)).rejects.toThrow('You can only delete your own account');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const volunteerId = 1;
      const requestingUserId = 1;
      const command = new DeleteVolunteerCommand(volunteerId, requestingUserId);
      
      const mockVolunteer = Volunteer.create(
        new VolunteerId(1),
        'Jane',
        'Smith',
        'jane@example.com',
        'password123',
        'I love helping animals'
      );

      vi.mocked(mockRepository.findById).mockResolvedValue(mockVolunteer);
      vi.mocked(mockRepository.delete).mockRejectedValue(new Error('Database error'));

      await expect(handler.execute(command)).rejects.toThrow('Database error');
    });
  });
});
