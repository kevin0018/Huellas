// DTOs / Tipos auxiliares para casos de uso, controllers y repositorio.
// Colocados en /types siguiendo tu patrón (como /types/pet.ts).

import { PostCategory, PostStatus } from "@prisma/client";

// Payload para crear un post. authorId vendrá del JWT en el controller.
export interface CreateVolunteerPostRequest {
  title: string;
  content: string;
  category: PostCategory;
  authorId: number;
  // El volunteer puede o no fijar expiración al crear.
  expiresAt?: Date | null;
}

// Filtros de listado + paginación.
// Por defecto listaremos PUBLISHED y NO expirados (esto se aplica en el repo).
export interface VolunteerPostListFilters {
  status?: PostStatus;          // default: PUBLISHED si no se pasa
  category?: PostCategory;
  authorId?: number;
  from?: Date;                  // rango de fechas (published_at si PUBLISHED; si no, created_at)
  to?: Date;
  includeExpired?: boolean;     // default: false
  includeArchived?: boolean;    // default: false (normalmente PUBLISHED)
  page?: number;                // default: 1
  pageSize?: number;            // default: 12
}

// Autor mínimo para pintar la card sin N+1 en el front.
export interface VolunteerPostAuthorBasic {
  id: number;
  name: string;
  last_name: string;
}

// Estructura de cada item en el listado (incluye autor básico).
export interface VolunteerPostListItem {
  id: number;
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  expiresAt: Date | null;
  author: VolunteerPostAuthorBasic;
}

// Resultado con paginación.
export interface VolunteerPostListResult {
  items: VolunteerPostListItem[];
  total: number;
  page: number;
  pageSize: number;
}
