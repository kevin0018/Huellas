// Interfaz del repositorio (dominio).
// Similar a IPetRepository pero con métodos acordes a la funcionalidad de posts.

import { VolunteerPost } from "../entities/VolunteerPost.js";
import { CreateVolunteerPostRequest, VolunteerPostListFilters, VolunteerPostListResult} from "../../../../types/volunteerPost.js";

export interface IVolunteerPostRepository {
  // Buscar por id (devuelve entidad o null).
  findById(id: number): Promise<VolunteerPost | null>;

  // Crear un post (en este proyecto lo creamos DIRECTAMENTE publicado).
  create(data: CreateVolunteerPostRequest): Promise<VolunteerPost>;

  // Eliminar por id SOLO si authorId coincide (hard delete).
  deleteById(id: number, authorId: number): Promise<void>;

  // Listado con filtros y paginación. Devuelve items con autor básico.
  list(filters: VolunteerPostListFilters): Promise<VolunteerPostListResult>;
}
