// src/routes/postsRoutes.ts
import { Router } from "express";
// IMPORTA LOS TIPOS para evitar "any"
import type { Request, Response } from "express";

import { JwtMiddleware } from "../contexts/auth/infra/middleware/JwtMiddleware.js";
import type { AuthenticatedRequest } from "../contexts/auth/infra/middleware/JwtMiddleware.js";

import { GetVolunteerPostsController } from "../contexts/Posts/infra/controllers/GetVolunteerPostsController.js";
import { GetVolunteerPostController } from "../contexts/Posts/infra/controllers/GetVolunteerPostController.js";
import { PostVolunteerPostController } from "../contexts/Posts/infra/controllers/PostVolunteerPostController.js";
import { DeleteVolunteerPostController } from "../contexts/Posts/infra/controllers/DeleteVolunteerPostController.js";

const postsRoutes = Router();

const getListCtrl = new GetVolunteerPostsController();
const getOneCtrl = new GetVolunteerPostController();
const postCtrl = new PostVolunteerPostController();
const delCtrl = new DeleteVolunteerPostController();

// GET /volunteers/posts (auth requerido)
postsRoutes.get(
  "/volunteers/posts",
  JwtMiddleware.requireAuthenticated(),
  (req: Request, res: Response) => getListCtrl.handle(req, res)
);

// GET /volunteers/posts/:id (auth requerido)
postsRoutes.get(
  "/volunteers/posts/:id",
  JwtMiddleware.requireAuthenticated(),
  (req: Request, res: Response) => getOneCtrl.handle(req, res)
);

// POST /volunteers/posts (solo volunteers)
// Nota: requireVolunteer() devuelve un array de middlewares → espárcelo
postsRoutes.post(
  "/volunteers/posts",
  ...JwtMiddleware.requireVolunteer(),
  (req: Request, res: Response) => postCtrl.handle(req as AuthenticatedRequest, res)
);

// DELETE /volunteers/posts/:id (solo volunteers y autor)
postsRoutes.delete(
  "/volunteers/posts/:id",
  ...JwtMiddleware.requireVolunteer(),
  (req: Request, res: Response) => delCtrl.handle(req as AuthenticatedRequest, res)
);

export default postsRoutes;
