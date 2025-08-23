import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { ProcedureRepository } from '../contexts/procedure/infra/persistence/ProcedureRepository.js';
import { GetProceduresController } from '../contexts/procedure/infra/controllers/GetProceduresController.js';

export function createProcedureRoutes(): Router {
  console.log('Creating procedure routes...');
  const router = Router();

  // Dependency injection setup
  console.log('Setting up dependencies...');
  const procedureRepository = new ProcedureRepository();

  // Controllers
  const getProceduresController = new GetProceduresController(procedureRepository);

  // Routes
  // GET Procedure Route
  router.get('/:type', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await getProceduresController.handle(req, res);
  });

  return router;
}

