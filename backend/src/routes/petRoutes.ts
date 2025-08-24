import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { PetRepository } from '../contexts/pet/infra/persistence/PetRepository.js';
import { DeletePetController } from '../contexts/pet/infra/controllers/DeletePetController.js';
import { GetPetController } from '../contexts/pet/infra/controllers/GetPetController.js';
import { PatchPetController } from '../contexts/pet/infra/controllers/PatchPetController.js';
import { PostPetController } from '../contexts/pet/infra/controllers/PostPetController.js';
import { CheckupRepository } from '../contexts/checkup/infra/persistence/CheckupRepository.js';
import { PostCheckupController } from '../contexts/checkup/infra/controllers/PostCheckupController.js';
import { ProcedureRepository } from '../contexts/procedure/infra/persistence/ProcedureRepository.js';

export function createPetRoutes(): Router {
  console.log('Creating pet routes...');
  const router = Router();

  // Dependency injection setup
  console.log('Setting up dependencies...');
  const petRepository = new PetRepository();
  const checkupRepository = new CheckupRepository();
  const procedureRepository = new ProcedureRepository();

  // Controllers
  const getPetController = new GetPetController(petRepository);
  const deletePetController = new DeletePetController(petRepository);
  const createPetController = new PostPetController(petRepository);
  const editPetController = new PatchPetController(petRepository);
  const createCheckupController = new PostCheckupController(checkupRepository, petRepository, procedureRepository);

  // Routes
  // GET Pet Route
  router.get('/:id', ...JwtMiddleware.requireOwnPet(), async (req: AuthenticatedRequest, res: Response) => {
    await getPetController.handle(req, res);
  });

  // DELETE Pet Route
  router.delete('/:id', ...JwtMiddleware.requireOwnPet(), async (req: AuthenticatedRequest, res: Response) => {
    await deletePetController.handle(req, res);
  });

  // POST Pet Route
  router.post('/', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    await createPetController.handle(req, res);
  });

  // PATCH Pet Route
  router.patch('/:id', ...JwtMiddleware.requireOwnPet(), async (req: AuthenticatedRequest, res: Response) => {
    await editPetController.handle(req, res);
  });

 //POST Checkup Route
  router.post('/:id/checkup', ...JwtMiddleware.requireOwnPet(), async (req: AuthenticatedRequest, res: Response) => {
    await createCheckupController.handle(req, res);
  });

  return router;
}

