import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { PetCareModule } from '../contexts/pet/index.js';
import { Capability } from '../contexts/auth/domain/AccessControl.js';

export function createCheckupRoutes({ checkups }: PetCareModule): Router {
  const router = Router();

  // Routes
  // GET Checkup Route
  router.get('/:id', ...JwtMiddleware.requireCapability(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await checkups.get.handle(req, res);
  });

  // DELETE Checkup Route
  router.delete('/:id', ...JwtMiddleware.requireCapability(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await checkups.delete.handle(req, res);
  });

  //UPDATE Checkup Route
  router.patch('/:id', ...JwtMiddleware.requireCapability(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await checkups.update.handle(req, res);
  });

  return router;
}
