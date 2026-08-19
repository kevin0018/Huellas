import { Router } from 'express';
import { createOwnerRoutes } from './ownerRoutes.js';
import { createAuthRoutes } from './authRoutes.js';
import { createVolunteerRoutes } from './volunteerRoutes.js';
import { createPetRoutes } from './petRoutes.js';
import { createProcedureRoutes } from './procedureRoutes.js';
import { createCheckupRoutes } from './checkupRoutes.js';
import {createAppointmentRoutes } from './appointmentRoutes.js';
import chatRoutes from './chatRoutes.js';
import postsRoutes from "./postsRoutes.js";
import { createHealthEventRoutes } from './healthEventRoutes.js';
import { createHealthDocumentRoutes } from './healthDocumentRoutes.js';
import { createReminderRoutes } from './reminderRoutes.js';
import { createHealthShareRoutes, createPublicHealthShareRoutes } from './healthShareRoutes.js';
import { createApplicationModules, type ApplicationModules } from '../composition/createApplicationModules.js';

export function createRoutes(modules: ApplicationModules = createApplicationModules()): Router {
  console.log('Creating main routes...');
  const router = Router();

  // Mount auth routes
  console.log('Mounting auth routes on /auth...');
  router.use('/auth', createAuthRoutes(modules.identity));

  // Mount owner routes
  console.log('Mounting owner routes on /owners...');
  router.use('/owners', createOwnerRoutes(modules.petCare, modules.identity));

  // Mount posts routes
  console.log('Mounting posts routes on /posts...');
  router.use('/volunteers', postsRoutes);

  // Mount volunteer routes
  console.log('Mounting volunteer routes on /volunteers...');
  router.use('/volunteers', createVolunteerRoutes(modules.identity));

  // Mount pet routes
  console.log('Mounting pet routes on /pets...');
  router.use('/pets', createPetRoutes(modules.petCare, modules.health));

  // Mount procedure routes
  console.log('Mounting procedure routes on /procedures...');
  router.use('/procedures', createProcedureRoutes(modules.petCare));

  // Mount checkup routes
  console.log('Mounting checkup routes on /checkup...');
  router.use('/checkups', createCheckupRoutes(modules.petCare));

  // Mount appointment routes
  console.log('Mounting appointment routes on /appointments...');
  router.use('/appointments', createAppointmentRoutes(modules.appointments));

  router.use('/health-events', createHealthEventRoutes(modules.health));
  router.use('/health-documents', createHealthDocumentRoutes(modules.health));
  router.use('/reminders', createReminderRoutes(modules.health));
  router.use('/shared-health', createPublicHealthShareRoutes(modules.health));
  router.use('/health-shares', createHealthShareRoutes(modules.health));

  // Mount chat routes
  console.log('Mounting chat routes on /chat...');
  router.use('/chat', chatRoutes);

  return router;
}
