import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteOwnerCommandHandler } from '../../../../app/commands/delete/DeleteOwnerCommandHandler.js';
import { DeleteOwnerCommand } from '../../../../app/commands/delete/DeleteOwnerCommand.js';
import { OwnerRepository } from '../../../../domain/repositories/OwnerRepository.js';
import { Owner } from '../../../../domain/entities/Owner.js';
import { OwnerId } from '../../../../domain/value-objects/OwnerId.js';

describe('DeleteOwnerCommandHandler', () => {
  let handler: DeleteOwnerCommandHandler;
  let mockRepository: OwnerRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn()
    };
    handler = new DeleteOwnerCommandHandler(mockRepository);
  });

  describe('execute', () => {
    it('should delete owner successfully when owner exists and user is authorized', async () => {
      // Arrange
      const ownerId = 1;
      const requestingUserId = 1;
      const command = new DeleteOwnerCommand(ownerId, requestingUserId);
      
      const mockOwner = await Owner.create(
        new OwnerId(1),
        'John',
        'Doe',
        'john@example.com',
        'password123'
      );

      vi.mocked(mockRepository.findById).mockResolvedValue(mockOwner);
      vi.mocked(mockRepository.delete).mockResolvedValue();

      const result = await handler.execute(command);

      expect(mockRepository.findById).toHaveBeenCalledWith(new OwnerId(ownerId));
      expect(mockRepository.delete).toHaveBeenCalledWith(new OwnerId(ownerId));
      expect(result).toEqual({
        message: 'Owner account and all related data successfully deleted'
      });
    });

    it('should throw error when owner does not exist', async () => {
      const ownerId = 999;
      const requestingUserId = 1;
      const command = new DeleteOwnerCommand(ownerId, requestingUserId);

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow('Owner not found');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when user tries to delete someone else account', async () => {
      const ownerId = 1;
      const requestingUserId = 2;
      const command = new DeleteOwnerCommand(ownerId, requestingUserId);
      
      const mockOwner = await Owner.create(
        new OwnerId(1),
        'John',
        'Doe',
        'john@example.com',
        'password123'
      );

      vi.mocked(mockRepository.findById).mockResolvedValue(mockOwner);

      await expect(handler.execute(command)).rejects.toThrow('You can only delete your own account');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const ownerId = 1;
      const requestingUserId = 1;
      const command = new DeleteOwnerCommand(ownerId, requestingUserId);
      
      const mockOwner = await Owner.create(
        new OwnerId(1),
        'John',
        'Doe',
        'john@example.com',
        'password123'
      );

      vi.mocked(mockRepository.findById).mockResolvedValue(mockOwner);
      vi.mocked(mockRepository.delete).mockRejectedValue(new Error('Database error'));

      await expect(handler.execute(command)).rejects.toThrow('Database error');
    });
  });
});
