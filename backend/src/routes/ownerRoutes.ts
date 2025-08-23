import { Router } from 'express';
import { RegisterOwnerController } from '../contexts/owner/infra/controllers/RegisterOwnerController.js';
import { RegisterOwnerCommandHandler } from '../contexts/owner/app/commands/registerOwner/RegisterOwnerCommandHandler.js';
import { DeleteOwnerController } from '../contexts/owner/infra/controllers/DeleteOwnerController.js';
import { DeleteOwnerCommandHandler } from '../contexts/owner/app/commands/delete/DeleteOwnerCommandHandler.js';
import { PrismaOwnerRepository } from '../contexts/owner/infra/persistence/PrismaOwnerRepository.js';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { GetMyPetsController } from '../contexts/pet/infra/controllers/GetMyPetsController.js';
import { PetRepository } from '../contexts/pet/infra/persistence/PetRepository.js';

export function createOwnerRoutes(): Router {
  console.log('Creating owner routes...');
  const router = Router();

  // Dependency injection setup
  console.log('Setting up dependencies...');
  const ownerRepository = new PrismaOwnerRepository();
  const petRepository = new PetRepository();

  // Register dependencies
  const registerCommandHandler = new RegisterOwnerCommandHandler(ownerRepository);
  const registerController = new RegisterOwnerController(registerCommandHandler);

  // Delete dependencies
  const deleteCommandHandler = new DeleteOwnerCommandHandler(ownerRepository);
  const deleteController = new DeleteOwnerController(deleteCommandHandler);

  // Get my pets dependencies
  const getMyPetsController = new GetMyPetsController(petRepository);

  // Routes
  console.log('Registering POST /register route...');
  router.post('/register', async (req, res) => {
    console.log('POST /register endpoint');
    await registerController.handle(req, res);
  });

  console.log('Registering DELETE /:id route...');
  router.delete('/:id', ...JwtMiddleware.requireOwner(), async (req, res) => {
    console.log('DELETE /:id endpoint');
    await deleteController.handle(req, res);
  });

  //GET My Pets Route
  router.get('/my-pets', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res) => {
    await getMyPetsController.handle(req, res);
  });

  return router;
}
