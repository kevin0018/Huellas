// Caso de uso para obtener un post por id (detalle).
// Por ahora devuelve la entidad de dominio "pura".

import { IVolunteerPostRepository } from "../../domain/repositories/IVolunteerPostRepository.js";
import { VolunteerPost } from "../../domain/entities/VolunteerPost.js";

export class GetVolunteerPostUseCase {
  constructor(private readonly repo: IVolunteerPostRepository) {}

  async execute(id: number): Promise<VolunteerPost | null> {
    return this.repo.findById(id);
  }
}
