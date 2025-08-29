import { Request, Response } from "express";
import { VolunteerPostRepository } from "../persistence/VolunteerPostRepository.js";
import { GetVolunteerPostUseCase } from "../../app/usecases/GetVolunteerPostUseCase.js";

export class GetVolunteerPostController {
  private readonly useCase = new GetVolunteerPostUseCase(new VolunteerPostRepository());

  // GET /volunteers/posts/:id
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: "Id must be a number" });
        return;
      }

      const post = await this.useCase.execute(id);
      if (!post) {
        res.status(404).json({ error: "Volunteer post not found" });
        return;
      }

      // Devolvemos la entidad "plana". Si quieres incluir autor aquí,
      // podemos extender el repo más adelante con `findByIdWithAuthor`.
      res.status(200).json({
        id: post.getId(),
        title: post.getTitle(),
        content: post.getContent(),
        authorId: post.getAuthorId(),
        category: post.getCategory(),
        status: post.getStatus(),
        createdAt: post.getCreatedAt(),
        updatedAt: post.getUpdatedAt(),
        publishedAt: post.getPublishedAt(),
        expiresAt: post.getExpiresAt(),
      });
    } catch (err) {
      console.error("[GetVolunteerPostController] Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
