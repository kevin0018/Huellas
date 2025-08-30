// Implementación Prisma del repositorio.
// NOTAS de negocio:
//  - Crear: directamente como PUBLISHED y published_at = now().
//  - Listado: por defecto PUBLISHED + no expirados, ordenado por published_at DESC, luego created_at DESC.
//  - Borrado: hard delete y SÓLO si author_id coincide con el userId del JWT.
//  - Incluimos autor básico (id, name, last_name) para evitar N+1 en el front.

import {  Prisma } from "@prisma/client";
import { PrismaClient, VolunteerPost as PrismaVolunteerPost, PostStatus} from "@prisma/client";
import { IVolunteerPostRepository } from "../../domain/repositories/IVolunteerPostRepository.js";
import { VolunteerPost } from "../../domain/entities/VolunteerPost.js";
import { CreateVolunteerPostRequest, VolunteerPostListFilters, VolunteerPostListItem, VolunteerPostListResult} from "../../../../types/volunteerPost.js";

const prisma = new PrismaClient();

export class VolunteerPostRepository implements IVolunteerPostRepository {
  // Mapeo de fila Prisma → entidad de dominio
  private mapToEntity(row: PrismaVolunteerPost): VolunteerPost {
    return new VolunteerPost(
      row.id,
      row.title,
      row.content,
      row.author_id,
      row.category,
      row.status,
      row.created_at,
      row.updated_at,
      row.published_at,
      row.expires_at
    );
  }

  // --- CRUD ---

  async findById(id: number): Promise<VolunteerPost | null> {
    const row = await prisma.volunteerPost.findUnique({ where: { id } });
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async create(data: CreateVolunteerPostRequest): Promise<VolunteerPost> {
    const now = new Date();

    const row = await prisma.volunteerPost.create({
      data: {
        title: data.title,
        content: data.content,
        author_id: data.authorId,
        category: data.category,
        status: PostStatus.PUBLISHED, // crear directamente publicado (según tu decisión)
        published_at: now,
        expires_at: data.expiresAt ?? null,
      },
    });

    return this.mapToEntity(row);
  }

  async deleteById(id: number, authorId: number): Promise<void> {
    // Seguridad: borramos SOLO si el autor coincide (hard delete).
    const result = await prisma.volunteerPost.deleteMany({
      where: { id, author_id: authorId },
    });

    if (result.count === 0) {
      // Si no se borró nada: o no existe, o el user no es el autor.
      console.warn(
        `[VolunteerPostRepository] deleteById -> not found or forbidden (id=${id}, authorId=${authorId})`
      );
      // Lanzamos error controlado para que el controller responda 404/403 según convenga.
      throw new Error("VOLUNTEER_POST_NOT_FOUND_OR_FORBIDDEN");
    }
  }

  // --- Listado con filtros y paginación ---
  async list(filters: VolunteerPostListFilters): Promise<VolunteerPostListResult> {
    // Paginación (page 1-based; pageSize con límite sano).
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.max(1, Math.min(100, filters.pageSize ?? 12));
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Si no nos pasan status, usamos PUBLISHED por defecto.
    const effectiveStatus = filters.status ?? PostStatus.PUBLISHED;

    // Construcción del WHERE incremental
    const AND: any[] = [{ status: effectiveStatus }];

    if (filters.category) AND.push({ category: filters.category });
    if (typeof filters.authorId === "number") AND.push({ author_id: filters.authorId });

    // Por defecto NO incluimos expirados.
    if (!filters.includeExpired) {
      AND.push({
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      });
    }

    // Rango de fechas: si estamos en PUBLISHED filtramos por published_at; si no, por created_at.
    if (filters.from || filters.to) {
      const field = effectiveStatus === PostStatus.PUBLISHED ? "published_at" : "created_at";
      const dateCond: any = {};
      if (filters.from) dateCond.gte = filters.from;
      if (filters.to) dateCond.lte = filters.to;
      AND.push({ [field]: dateCond });
    }

    // Si quisieras permitir ARCHIVED sin cambiar status, podríamos gestionar includeArchived aquí.
    // Con el diseño actual, basta con pasar status=ARCHIVED desde el controller.

    const where = { AND };

    // Consulta en paralelo: total y filas (incluyendo autor básico para el front)
    const [total, rows] = await Promise.all([
      prisma.volunteerPost.count({ where }),
      prisma.volunteerPost.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, last_name: true } },
        },
        orderBy: [
          { published_at: "desc" }, // si es null, cae al siguiente criterio
          { created_at: "desc" },
        ],
        skip,
        take,
      }),
    ]);

    // Mapeo a estructura amigable para el front (con autor básico).
    const items: VolunteerPostListItem[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      category: r.category,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      publishedAt: r.published_at,
      expiresAt: r.expires_at,
      author: {
        id: r.author.id,
        name: r.author.name,
        last_name: r.author.last_name,
      },
    }));

    return { items, total, page, pageSize };
  }
}