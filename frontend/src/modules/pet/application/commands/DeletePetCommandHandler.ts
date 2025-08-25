import type { PetRepository } from '../../domain/PetRepository';
import { DeletePetCommand } from './DeletePetCommand';

export class DeletePetCommandHandler {
  private readonly repo: PetRepository;

  constructor(repo: PetRepository) {
    this.repo = repo;
  }

  async execute(command: DeletePetCommand) {
    await this.repo.delete(command.id);
  }
}