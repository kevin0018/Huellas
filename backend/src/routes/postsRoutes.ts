import { Router, type Request, type Response } from "express";
import { JwtMiddleware } from "../contexts/auth/infra/middleware/JwtMiddleware.js";
import type { AuthenticatedRequest } from "../contexts/auth/infra/middleware/JwtMiddleware.js";
import type { CommunityModule } from "../contexts/Posts/index.js";
import { Capability } from "../contexts/auth/domain/AccessControl.js";

export function createPostsRoutes({ controllers }: CommunityModule): Router {
  const postsRoutes = Router();

postsRoutes.get(
  "/posts",
  JwtMiddleware.requireAuthenticated(),
  (req: Request, res: Response) => controllers.listPosts.handle(req, res)
);

postsRoutes.get(
  "/posts/:id",
  JwtMiddleware.requireAuthenticated(),
  (req: Request, res: Response) => controllers.getPost.handle(req, res)
);

postsRoutes.post(
  "/posts",
  ...JwtMiddleware.requireCapability(Capability.PUBLISH_VOLUNTEER_POSTS),
  (req: Request, res: Response) => controllers.createPost.handle(req as AuthenticatedRequest, res)
);

postsRoutes.delete(
  "/posts/:id",
  ...JwtMiddleware.requireCapability(Capability.PUBLISH_VOLUNTEER_POSTS),
  (req: Request, res: Response) => controllers.deletePost.handle(req as AuthenticatedRequest, res)
);

  return postsRoutes;
}
