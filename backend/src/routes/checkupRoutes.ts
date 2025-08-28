import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { CheckupRepository } from '../contexts/checkup/infra/persistence/CheckupRepository.js';
import { GetCheckupByIdController } from '../contexts/checkup/infra/controllers/GetCheckupByIdController.js';
import { PetRepository } from '../contexts/pet/infra/persistence/PetRepository.js';
import { DeleteCheckupController } from '../contexts/checkup/infra/controllers/DeleteCheckupController.js';
import { PatchCheckupController } from '../contexts/checkup/infra/controllers/PatchCheckupController.js';
import { ProcedureRepository } from '../contexts/procedure/infra/persistence/ProcedureRepository.js';

export function createCheckupRoutes(): Router {
  console.log('Creating checkup routes...');
  const router = Router();

  // Dependency injection setup
  console.log('Setting up dependencies...');
  const checkupRepository = new CheckupRepository();
  const petRepository = new PetRepository();
  const procedureRepository = new ProcedureRepository();


  // Controllers
  const getCheckupController = new GetCheckupByIdController(checkupRepository, petRepository);
  const deleteCheckupController = new DeleteCheckupController(checkupRepository, petRepository);
  const patchCheckupController = new PatchCheckupController(checkupRepository, petRepository, procedureRepository);

  // Routes
  // GET Checkup Route
  router.get('/:id', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await getCheckupController.handle(req, res);
  });

  // DELETE Checkup Route
  router.delete('/:id', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await deleteCheckupController.handle(req, res);
  });

  //UPDATE Checkup Route
  router.patch('/:id', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await patchCheckupController.handle(req, res);
  });

  return router;
}

