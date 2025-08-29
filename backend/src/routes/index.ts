import { Router } from 'express';
import { createOwnerRoutes } from './ownerRoutes.js';
import { createAuthRoutes } from './authRoutes.js';
import { volunteerRoutes } from './volunteerRoutes.js';
import { createPetRoutes } from './petRoutes.js';
import { createProcedureRoutes } from './procedureRoutes.js';
import { createCheckupRoutes } from './checkupRoutes.js';
import {createAppointmentRoutes } from './appointmentRoutes.js';
import chatRoutes from './chatRoutes.js';

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

  // Mount procedure routes
  console.log('Mounting procedure routes on /procedures...');
  router.use('/procedures', createProcedureRoutes());

  // Mount checkup routes
  console.log('Mounting checkup routes on /checkup...');
  router.use('/checkups', createCheckupRoutes());

  // Mount appointment routes
  console.log('Mounting appointment routes on /appointments...');
  router.use('/appointments', createAppointmentRoutes());

  // Mount chat routes
  console.log('Mounting chat routes on /chat...');
  router.use('/chat', chatRoutes);

  return router;
}
