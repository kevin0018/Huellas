// Caso de uso para listar posts con filtros + paginación.
// Depende de la interfaz de repositorio para mantener el dominio limpio.

import { IVolunteerPostRepository } from "../../domain/repositories/IVolunteerPostRepository.js";
import { VolunteerPostListFilters, VolunteerPostListResult } from "../../../../types/volunteerPost.js";

export class ListVolunteerPostsUseCase {
  constructor(private readonly repo: IVolunteerPostRepository) {}

  async execute(filters: VolunteerPostListFilters): Promise<VolunteerPostListResult> {
    // Aquí podrías añadir reglas de dominio adicionales (p. ej., límites a pageSize).
    return this.repo.list(filters);
  }
}
