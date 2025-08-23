import { Router, Response } from 'express';
import { createOwnerRoutes } from './ownerRoutes.js';
import { createAuthRoutes } from './authRoutes.js';
import { volunteerRoutes } from './volunteerRoutes.js';
import { createPetRoutes } from './petRoutes.js';

export function createRoutes(): Router {
  console.log('Creating main routes...');
  const router = Router();

  // Mount auth routes
  console.log('Mounting auth routes on /auth...');
  router.use('/auth', createAuthRoutes());

  // Mount owner routes
  console.log('Mounting owner routes on /owners...');
  router.use('/owners', createOwnerRoutes());

  // Mount volunteer routes
  console.log('Mounting volunteer routes on /volunteers...');
  router.use('/volunteers', volunteerRoutes);

  // Mount pet routes
  console.log('Mounting pet routes on /pets...');
  router.use('/pets', createPetRoutes());

  return router;
}
