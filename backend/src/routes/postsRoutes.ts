import { Router, type Request, type Response } from "express";
import { JwtMiddleware } from "../contexts/auth/infra/middleware/JwtMiddleware.js";
import { GetVolunteerPostsController } from "../contexts/Posts/infra/controllers/GetVolunteerPostsController.js";
import { GetVolunteerPostController } from "../contexts/Posts/infra/controllers/GetVolunteerPostController.js";
import { PostVolunteerPostController } from "../contexts/Posts/infra/controllers/PostVolunteerPostController.js";
import { DeleteVolunteerPostController } from "../contexts/Posts/infra/controllers/DeleteVolunteerPostController.js";
import type { AuthenticatedRequest } from "../contexts/auth/infra/middleware/JwtMiddleware.js";

const postsRoutes = Router();

const getListCtrl = new GetVolunteerPostsController();
const getOneCtrl = new GetVolunteerPostController();
const postCtrl = new PostVolunteerPostController();
const delCtrl = new DeleteVolunteerPostController();

postsRoutes.get(
  "/posts",
  JwtMiddleware.requireAuthenticated(),
  (req: Request, res: Response) => getListCtrl.handle(req, res)
);

postsRoutes.get(
  "/posts/:id",
  JwtMiddleware.requireAuthenticated(),
  (req: Request, res: Response) => getOneCtrl.handle(req, res)
);

postsRoutes.post(
  "/posts",
  ...JwtMiddleware.requireVolunteer(),
  (req: Request, res: Response) => postCtrl.handle(req as AuthenticatedRequest, res)
);

postsRoutes.delete(
  "/posts/:id",
  ...JwtMiddleware.requireVolunteer(),
  (req: Request, res: Response) => delCtrl.handle(req as AuthenticatedRequest, res)
);

export default postsRoutes;
