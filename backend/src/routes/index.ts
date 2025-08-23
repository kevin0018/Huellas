import { Router, Response } from 'express';
import { createOwnerRoutes } from './ownerRoutes.js';
import { createAuthRoutes } from './authRoutes.js';
import { GetPetController } from '../contexts/pet/infra/controllers/GetPetController.js';
import { volunteerRoutes } from './volunteerRoutes.js';
import { DeletePetController } from '../contexts/pet/infra/controllers/DeletePetController.js';
import { PetRepository } from '../contexts/pet/infra/persistence/PetRepository.js';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { PostPetController } from '../contexts/pet/infra/controllers/PostPetController.js';

export function createRoutes(): Router {
  console.log('Creating main routes...');
  const router = Router();

  // Mount auth routes
  console.log('Mounting auth routes on /auth...');
  router.use('/auth', createAuthRoutes());

  // Mount owner routes
  console.log('Mounting owner routes on /owners...');
  router.use('/owners', createOwnerRoutes());

  // GET Pet Route
  router.get('/pet/:id', ...JwtMiddleware.requireOwnPet(), async (req: AuthenticatedRequest, res: Response) => {
    const petRepository = new PetRepository();
    const getPetController = new GetPetController(petRepository);
    await getPetController.handle(req, res);
  });

  //DELETE Pet Route
  router.delete('/pet/:id', ...JwtMiddleware.requireOwnPet(), async (req: AuthenticatedRequest, res: Response) => {
    const petRepository = new PetRepository();
    const deletePetController = new DeletePetController(petRepository);
    await deletePetController.handle(req, res);
  });

  //POST Pet Route
  router.post('/pet', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res: Response) => {
    const petRepository = new PetRepository();
    const createPetController = new PostPetController(petRepository);
    await createPetController.handle(req, res);
  })

  // Mount volunteer routes
  console.log('Mounting volunteer routes on /volunteers...');
  router.use('/volunteers', volunteerRoutes);

  return router;
}
