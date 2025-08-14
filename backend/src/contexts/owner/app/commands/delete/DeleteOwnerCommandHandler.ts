import { DeleteOwnerCommand } from './DeleteOwnerCommand.js';
import { OwnerRepository } from '../../../domain/repositories/OwnerRepository.js';
import { OwnerId } from '../../../domain/value-objects/OwnerId.js';

export class DeleteOwnerCommandHandler {
  constructor(private readonly ownerRepository: OwnerRepository) {}

  async execute(command: DeleteOwnerCommand): Promise<{ message: string }> {
    const ownerId = new OwnerId(command.ownerId);
    
    // Verify that the owner exists
    const owner = await this.ownerRepository.findById(ownerId);
    
    if (!owner) {
      throw new Error('Owner not found');
    }

    // Only the owner can delete themselves
    if (owner.id.getValue() !== command.requestingUserId) {
      throw new Error('You can only delete your own account');
    }

    await this.ownerRepository.delete(ownerId);

    return {
      message: 'Owner account and all related data successfully deleted'
    };
  }
}
