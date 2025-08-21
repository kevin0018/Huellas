import { OwnerRepository } from '../../../domain/repositories/OwnerRepository.js';
import { Owner } from '../../../domain/entities/Owner.js';
import { OwnerId } from '../../../domain/value-objects/OwnerId.js';
import { RegisterOwnerCommand } from './RegisterOwnerCommand.js';

export class RegisterOwnerCommandHandler {
  constructor(private readonly ownerRepository: OwnerRepository) {}

  async execute(command: RegisterOwnerCommand): Promise<{ id: number; message: string }> {
    const owner = await Owner.create(
      new OwnerId(1),
      command.name,
      command.lastName,
      command.email,
      command.password
    );
    
    const generatedId = await this.ownerRepository.save(owner);

    return {
      id: generatedId,
      message: 'Owner registered successfully'
    };
  }
}