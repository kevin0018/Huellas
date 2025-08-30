import { Request, Response } from "express";
import { VolunteerPostRepository } from "../persistence/VolunteerPostRepository.js";
import { ListVolunteerPostsUseCase } from "../../app/usecases/ListVolunteerPostsUseCase.js";
import { VolunteerPostListFilters } from "../../../../types/volunteerPost.js";

// Helpers simples para parseo de query string → tipos básicos
function parseNumber(v: any, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
function parseBool(v: any, fallback = false): boolean {
  if (v === undefined) return fallback;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "1", "yes", "on"].includes(v.toLowerCase());
  return fallback;
}
function parseDate(v: any): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

export class GetVolunteerPostsController {
  // Inyectamos repositorio vía use case
  private readonly useCase = new ListVolunteerPostsUseCase(new VolunteerPostRepository());

  // GET /volunteers/posts
  async handle(req: Request, res: Response): Promise<void> {
    try {
      // Paginación
      const page = parseNumber(req.query.page, 1);
      const pageSize = parseNumber(req.query.pageSize, 12);

      // Filtros (opcionales). Ojo: aquí no forzamos enums;
      // el repositorio espera valores válidos según Prisma.
      const filters: VolunteerPostListFilters = {
        status: (req.query.status as any) || undefined,        // ej: "PUBLISHED"
        category: (req.query.category as any) || undefined,    // ej: "PET_SITTING"
        authorId: req.query.authorId ? Number(req.query.authorId) : undefined,
        from: parseDate(req.query.from),
        to: parseDate(req.query.to),
        includeExpired: parseBool(req.query.includeExpired, false),
        includeArchived: parseBool(req.query.includeArchived, false),
        page,
        pageSize,
      };

      const result = await this.useCase.execute(filters);

      res.status(200).json(result);
    } catch (err) {
      console.error("[GetVolunteerPostsController] Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
