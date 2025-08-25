import { Pet } from '../../domain/Pet';
import type { PetRepository } from '../../domain/PetRepository';
import { UpdatePetCommand } from './UpdatePetCommand';

export class UpdatePetCommandHandler {
  private readonly repo: PetRepository;

  constructor(repo: PetRepository) {
    this.repo = repo;
  }

  async execute(command: UpdatePetCommand) {
    const pet = Pet.create({ id: command.id, ...command.data });
    return await this.repo.update(command.id, pet);
  }
}
