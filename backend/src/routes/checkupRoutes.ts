import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { CheckupRepository } from '../contexts/checkup/infra/persistence/CheckupRepository.js';
import { GetCheckupByIdController } from '../contexts/checkup/infra/controllers/GetCheckupByIdController.js';
import { PetRepository } from '../contexts/pet/infra/persistence/PetRepository.js';
import { DeleteCheckupController } from '../contexts/checkup/infra/controllers/DeleteCheckupController.js';

export function createCheckupRoutes(): Router {
  console.log('Creating checkup routes...');
  const router = Router();

  // Dependency injection setup
  console.log('Setting up dependencies...');
  const checkupRepository = new CheckupRepository();
  const petRepository = new PetRepository();

  // Controllers
  const getCheckupController = new GetCheckupByIdController(checkupRepository, petRepository);
  const deleteCheckupController = new DeleteCheckupController(checkupRepository, petRepository);

  // Routes
  // GET Checkup Route
  router.get('/:id', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await getCheckupController.handle(req, res);
  });

  // DELETE Checkup Route
  router.delete('/:id', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await deleteCheckupController.handle(req, res);
  });

  return router;
}

