import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { PetCareModule } from '../contexts/pet/index.js';

export function createProcedureRoutes({ procedures }: PetCareModule): Router {
  console.log('Creating procedure routes...');
  const router = Router();

  // Routes
  // GET Procedure Route
  router.get('/:type', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await procedures.getByType.handle(req, res);
  });

  return router;
}
