import type { OwnerRepository } from '../../domain/OwnerRepository';
import { Owner } from '../../domain/Owner';
import { RegisterOwnerCommand } from './RegisterOwnerCommand';

export class RegisterOwnerCommandHandler {
  private readonly ownerRepository: OwnerRepository;

  constructor(ownerRepository: OwnerRepository) {
    this.ownerRepository = ownerRepository;
  }

  async execute(command: RegisterOwnerCommand): Promise<void> {
    const owner = Owner.create({
      name: command.name,
      lastName: command.lastName,
      email: command.email,
      password: command.password,
    });
    await this.ownerRepository.register(owner);
  }
}