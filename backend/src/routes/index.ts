import { Router } from 'express';
import { createOwnerRoutes } from './ownerRoutes.js';
import { createAuthRoutes } from './authRoutes.js';
import { GetPetController } from '../contexts/pet/infra/controllers/GetPetController.js';

export function createRoutes(): Router {
  console.log('Creating main routes...');
  const router = Router();

  // Mount auth routes
  console.log('Mounting auth routes on /auth...');
  router.use('/auth', createAuthRoutes());

  // Mount owner routes
  console.log('Mounting owner routes on /owners...');
  router.use('/owners', createOwnerRoutes());

  // Pet Routes
  router.get('/pet/:id', async (req, res) => {
    const getPetController = new GetPetController();
    await getPetController.handle(req, res);
  })

  return router;
}
