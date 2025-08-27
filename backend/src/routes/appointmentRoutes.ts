import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { AppointmentController } from '../contexts/appointment/infrastructure/controllers/AppointmentController.js';

export function createAppointmentRoutes(): Router {
  const router = Router();
  const prisma = new PrismaClient();
  const appointmentController = new AppointmentController(prisma);

  // All appointment routes require owner authentication
  router.use(JwtMiddleware.requireOwner());

  // GET /appointments - list owner appointments
  router.get('/', async (req, res) => {
    return appointmentController.getAppointmentsByOwner(req, res);
  });

  // GET /appointments/:id
  router.get('/:id', async (req, res) => {
    return appointmentController.getAppointmentById(req, res);
  });

  // POST /appointments
  router.post('/', async (req, res) => {
    return appointmentController.createAppointment(req, res);
  });

  // PUT /appointments/:id
  router.put('/:id', async (req, res) => {
    return appointmentController.updateAppointment(req, res);
  });

  // DELETE /appointments/:id
  router.delete('/:id', async (req, res) => {
    return appointmentController.deleteAppointment(req, res);
  });

  return router;
}