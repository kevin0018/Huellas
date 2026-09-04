import { Router } from 'express';
import { createOwnerRoutes } from './ownerRoutes.js';
import { createAuthRoutes } from './authRoutes.js';
import { createVolunteerRoutes } from './volunteerRoutes.js';
import { createPetRoutes } from './petRoutes.js';
import { createProcedureRoutes } from './procedureRoutes.js';
import { createCheckupRoutes } from './checkupRoutes.js';
import {createAppointmentRoutes } from './appointmentRoutes.js';
import { createChatRoutes } from './chatRoutes.js';
import { createPostsRoutes } from './postsRoutes.js';
import { createHealthEventRoutes } from './healthEventRoutes.js';
import { createHealthDocumentRoutes } from './healthDocumentRoutes.js';
import { createReminderRoutes } from './reminderRoutes.js';
import { createHealthShareRoutes, createPublicHealthShareRoutes } from './healthShareRoutes.js';
import { createApplicationModules, type ApplicationModules } from '../composition/createApplicationModules.js';

export function createRoutes(modules: ApplicationModules = createApplicationModules()): Router {
  const router = Router();

  // Mount auth routes
  router.use('/auth', createAuthRoutes(modules.identity));

  // Mount owner routes
  router.use('/owners', createOwnerRoutes(modules.petCare, modules.identity));

  // Mount posts routes
  router.use('/volunteers', createPostsRoutes(modules.community));

  // Mount volunteer routes
  router.use('/volunteers', createVolunteerRoutes(modules.identity));

  // Mount pet routes
  router.use('/pets', createPetRoutes(modules.petCare, modules.health));

  // Mount procedure routes
  router.use('/procedures', createProcedureRoutes(modules.petCare));

  // Mount checkup routes
  router.use('/checkups', createCheckupRoutes(modules.petCare));

  // Mount appointment routes
  router.use('/appointments', createAppointmentRoutes(modules.appointments));

  router.use('/health-events', createHealthEventRoutes(modules.health));
  router.use('/health-documents', createHealthDocumentRoutes(modules.health));
  router.use('/reminders', createReminderRoutes(modules.health));
  router.use('/shared-health', createPublicHealthShareRoutes(modules.health));
  router.use('/health-shares', createHealthShareRoutes(modules.health));

  // Mount chat routes
  router.use('/chat', createChatRoutes(modules.chat));

  return router;
}
