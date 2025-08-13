import { Router } from 'express';
import { createOwnerRoutes } from './ownerRoutes.js';

export function createRoutes(): Router {
  console.log('Creating main routes...');
  const router = Router();

  // Mount owner routes
  console.log('Mounting owner routes on /owners...');
  router.use('/owners', createOwnerRoutes());

  return router;
}
