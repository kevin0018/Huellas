// Caso de uso para crear un post (creación directa en PUBLISHED).
// Reglas acordadas:
//  - authorId viene del JWT (controller).
//  - expiresAt lo elige el volunteer (opcional).

import { IVolunteerPostRepository } from "../../domain/repositories/IVolunteerPostRepository.js";
import { CreateVolunteerPostRequest } from "../../../../types/volunteerPost.js";
import { VolunteerPost } from "../../domain/entities/VolunteerPost.js";

export class CreateVolunteerPostUseCase {
  constructor(private readonly repo: IVolunteerPostRepository) {}

  async execute(payload: CreateVolunteerPostRequest): Promise<VolunteerPost> {
    // Aquí podrías validar longitud de title/content, etc., si quisieras.
    return this.repo.create(payload);
  }
}
