import { Router } from 'express';
import { createOwnerRoutes } from './ownerRoutes.js';
import { createAuthRoutes } from './authRoutes.js';
import { GetPetController } from '../contexts/pet/infra/controllers/GetPetController.js';
import { volunteerRoutes } from './volunteerRoutes.js';
import { DeletePetController } from '../contexts/pet/infra/controllers/DeletePetController.js';
import { PetRepository } from '../contexts/pet/infra/persistence/PetRepository.js';

export function createRoutes(): Router {
  console.log('Creating main routes...');
  const router = Router();

  // Mount auth routes
  console.log('Mounting auth routes on /auth...');
  router.use('/auth', createAuthRoutes());

  // Mount owner routes
  console.log('Mounting owner routes on /owners...');
  router.use('/owners', createOwnerRoutes());

  // GET Pet Routes
  router.get('/pet/:id', async (req, res) => {
    const petRepository = new PetRepository();
    const getPetController = new GetPetController(petRepository);
    await getPetController.handle(req, res);
  });

  //DELETE Pet Routes
  router.delete('/pet/:id', async (req, res) => {
    const petRepository = new PetRepository();
    const deletePetController = new DeletePetController(petRepository);
    await deletePetController.handle(req, res);
  });

  // Mount volunteer routes
  console.log('Mounting volunteer routes on /volunteers...');
  router.use('/volunteers', volunteerRoutes);

  return router;
}
