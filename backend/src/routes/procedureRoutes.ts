import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { PetCareModule } from '../contexts/pet/index.js';
import { Capability } from '../contexts/auth/domain/AccessControl.js';

export function createProcedureRoutes({ procedures }: PetCareModule): Router {
  const router = Router();

  // Routes
  // GET Procedure Route
  router.get('/:type', ...JwtMiddleware.requireCapability(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await procedures.getByType.handle(req, res);
  });

  return router;
}
