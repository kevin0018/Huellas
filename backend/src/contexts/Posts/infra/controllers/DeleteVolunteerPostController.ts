import { Response } from "express";
import { VolunteerPostRepository } from "../persistence/VolunteerPostRepository.js";
import { DeleteVolunteerPostUseCase } from "../../app/usecases/DeleteVolunteerPostUseCase.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";

export class DeleteVolunteerPostController {
  private readonly useCase = new DeleteVolunteerPostUseCase(new VolunteerPostRepository());

  // DELETE /volunteers/posts/:id   (requireVolunteer)
  async handle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const authorId = req.user?.userId;
      if (!authorId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: "Id must be a number" });
        return;
      }

      await this.useCase.execute(id, authorId);

      res.status(204).send(); // No Content
    } catch (err: any) {
      console.error("[DeleteVolunteerPostController] Error:", err);
      // El repo lanza "VOLUNTEER_POST_NOT_FOUND_OR_FORBIDDEN" si no existe o no es autor
      if (err?.message === "VOLUNTEER_POST_NOT_FOUND_OR_FORBIDDEN") {
        // Para no filtrar información: puedes elegir 404 genérico
        res.status(404).json({ error: "Volunteer post not found" });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
