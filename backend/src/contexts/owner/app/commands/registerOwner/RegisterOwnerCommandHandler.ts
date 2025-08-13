import { OwnerRepository } from '../../../domain/repositories/OwnerRepository.js';
import { Owner } from '../../../domain/entities/Owner.js';
import { OwnerId } from '../../../domain/value-objects/OwnerId.js';
import { RegisterOwnerCommand } from './RegisterOwnerCommand.js';

export class RegisterOwnerCommandHandler {
  constructor(private readonly ownerRepository: OwnerRepository) {}

  async execute(command: RegisterOwnerCommand): Promise<void> {
    const owner = await Owner.create(
      new OwnerId(command.id),
      command.name,
      command.lastName,
      command.email,
      command.password
    );
    
    await this.ownerRepository.save(owner);
  }
}