// Caso de uso para eliminar un post (hard delete).
// Reglas: sólo el autor puede borrar (el repo ya lo hace cumplir).

import { IVolunteerPostRepository } from "../../domain/repositories/IVolunteerPostRepository.js";

export class DeleteVolunteerPostUseCase {
  constructor(private readonly repo: IVolunteerPostRepository) {}

  async execute(id: number, authorId: number): Promise<void> {
    await this.repo.deleteById(id, authorId);
  }
}
