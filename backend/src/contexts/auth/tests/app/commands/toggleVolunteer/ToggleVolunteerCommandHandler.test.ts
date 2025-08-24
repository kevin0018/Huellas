import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  CreateVolunteerProfileCommandHandler,
  DeleteVolunteerProfileCommandHandler 
} from '../../../../app/commands/toggleVolunteer/VolunteerCommandHandlers.js';
import { 
  CreateVolunteerProfileCommand,
  DeleteVolunteerProfileCommand 
} from '../../../../app/commands/toggleVolunteer/VolunteerCommands.js';
import { AuthRepository } from '../../../../domain/repositories/AuthRepository.js';

describe('VolunteerCommandHandlers', () => {
  let mockRepository: AuthRepository;

  beforeEach(() => {
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
  });

  describe('CreateVolunteerProfileCommandHandler', () => {
    let handler: CreateVolunteerProfileCommandHandler;

    beforeEach(() => {
      handler = new CreateVolunteerProfileCommandHandler(mockRepository);
    });

    it('should create volunteer profile when user does not have one', async () => {
      // Arrange
      const command = new CreateVolunteerProfileCommand(1, 'Animal lover with 5 years of experience');
      
      (mockRepository.hasVolunteerProfile as any).mockResolvedValue(false);
      (mockRepository.createVolunteerProfile as any).mockResolvedValue(undefined);

      // Act
      await handler.handle(command);

      // Assert
      expect(mockRepository.hasVolunteerProfile).toHaveBeenCalledWith(1);
      expect(mockRepository.createVolunteerProfile).toHaveBeenCalledWith(1, 'Animal lover with 5 years of experience');
    });

    it('should throw error when user already has volunteer profile', async () => {
      // Arrange
      const command = new CreateVolunteerProfileCommand(1, 'Description');
      
      (mockRepository.hasVolunteerProfile as any).mockResolvedValue(true);

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow('User already has a volunteer profile');
      expect(mockRepository.createVolunteerProfile).not.toHaveBeenCalled();
    });
  });

  describe('DeleteVolunteerProfileCommandHandler', () => {
    let handler: DeleteVolunteerProfileCommandHandler;

    beforeEach(() => {
      handler = new DeleteVolunteerProfileCommandHandler(mockRepository);
    });

    it('should delete volunteer profile when user has one', async () => {
      // Arrange
      const command = new DeleteVolunteerProfileCommand(1);
      
      (mockRepository.hasVolunteerProfile as any).mockResolvedValue(true);
      (mockRepository.deleteVolunteerProfile as any).mockResolvedValue(undefined);

      // Act
      await handler.handle(command);

      // Assert
      expect(mockRepository.hasVolunteerProfile).toHaveBeenCalledWith(1);
      expect(mockRepository.deleteVolunteerProfile).toHaveBeenCalledWith(1);
    });

    it('should throw error when user does not have volunteer profile', async () => {
      // Arrange
      const command = new DeleteVolunteerProfileCommand(1);
      
      (mockRepository.hasVolunteerProfile as any).mockResolvedValue(false);

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow('User does not have a volunteer profile');
      expect(mockRepository.deleteVolunteerProfile).not.toHaveBeenCalled();
    });
  });
});
