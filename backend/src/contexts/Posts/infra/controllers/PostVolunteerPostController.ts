import { Response } from "express";
import { VolunteerPostRepository } from "../persistence/VolunteerPostRepository.js";
import { CreateVolunteerPostUseCase } from "../../app/usecases/CreateVolunteerPostUseCase.js";
import { CreateVolunteerPostRequest } from "../../../../types/volunteerPost.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";

// Validaciones mínimas (sin libs):
function isNonEmptyString(v: any): v is string {
  return typeof v === "string" && v.trim().length > 0;
}
function parseDateOrNull(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export class PostVolunteerPostController {
  private readonly useCase = new CreateVolunteerPostUseCase(new VolunteerPostRepository());

  // POST /volunteers/posts   (requireVolunteer)
  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // authorId desde JWT (ya autenticado por middleware)
      const authorId = req.user?.userId;
      if (!authorId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Campos requeridos en body
      const { title, content, category, expiresAt } = req.body || {};

      if (!isNonEmptyString(title) || !isNonEmptyString(content) || !isNonEmptyString(category)) {
        res.status(400).json({ error: "Missing or invalid fields: title, content, category are required" });
        return;
      }

      // Construimos payload para el caso de uso
      const payload: CreateVolunteerPostRequest = {
        title: title.trim(),
        content: content.trim(),
        category: category as any, // el repo espera un valor válido (enum Prisma)
        authorId,
        expiresAt: parseDateOrNull(expiresAt),
      };

      const created = await this.useCase.execute(payload);

      res.status(201).json({
        id: created.getId(),
        title: created.getTitle(),
        content: created.getContent(),
        authorId: created.getAuthorId(),
        category: created.getCategory(),
        status: created.getStatus(),
        createdAt: created.getCreatedAt(),
        updatedAt: created.getUpdatedAt(),
        publishedAt: created.getPublishedAt(),
        expiresAt: created.getExpiresAt(),
      });
    } catch (err) {
      console.error("[PostVolunteerPostController] Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
