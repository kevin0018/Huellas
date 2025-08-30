// Tipos de dominio alineados con el backend (schema.prisma / API)

export type PostStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED"
  | "EXPIRED";

export type PostCategory =
  | "GENERAL"
  | "WALKING_EXERCISE"
  | "PET_SITTING"
  | "VET_TRANSPORT"
  | "FOSTER_CARE"
  | "TRAINING_BEHAVIOR"
  | "SHELTER_SUPPORT"
  | "GROOMING_HYGIENE"
  | "MEDICAL_SUPPORT"
  | "ADOPTION_REHOMING"
  | "LOST_AND_FOUND";

export interface VolunteerPostAuthorBasic {
  id: number;
  name: string;
  last_name: string;
}

export interface VolunteerPostListItem {
  id: number;
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  createdAt: string;   // llega como ISO string del backend
  updatedAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  author: VolunteerPostAuthorBasic;
}

export interface VolunteerPostListResult {
  items: VolunteerPostListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VolunteerPost {            // <- respuesta del POST (controller devuelve authorId)
  id: number;
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  authorId: number;
}