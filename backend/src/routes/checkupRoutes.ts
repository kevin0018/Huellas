import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { PetCareModule } from '../contexts/pet/index.js';

export function createCheckupRoutes({ checkups }: PetCareModule): Router {
  console.log('Creating checkup routes...');
  const router = Router();

  // Routes
  // GET Checkup Route
  router.get('/:id', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await checkups.get.handle(req, res);
  });

  // DELETE Checkup Route
  router.delete('/:id', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await checkups.delete.handle(req, res);
  });

  //UPDATE Checkup Route
  router.patch('/:id', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await checkups.update.handle(req, res);
  });

  return router;
}
