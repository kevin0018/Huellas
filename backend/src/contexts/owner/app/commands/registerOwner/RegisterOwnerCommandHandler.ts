import { CommandHandler, RegisterCommandHandler } from '../../../../../shared/application/CommandHandler.js';
import { RegisterOwnerCommand } from './RegisterOwnerCommand.js';
import { OwnerRepository } from '../../../domain/repositories/OwnerRepository.js';
import { Owner } from '../../../domain/entities/Owner.js';
import { OwnerId } from '../../../domain/value-objects/OwnerId.js';

@RegisterCommandHandler('register_owner')
export class RegisterOwnerCommandHandler implements CommandHandler<RegisterOwnerCommand> {
  constructor(private readonly ownerRepository: OwnerRepository) {}

  async execute(command: RegisterOwnerCommand): Promise<void> {
    const owner = new Owner(
      new OwnerId(command.id),
      command.name,
      command.lastName,
      command.email,
      []
    );
    await this.ownerRepository.save(owner);
  }
}