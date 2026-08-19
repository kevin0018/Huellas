import { Router } from 'express';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { AppointmentModule } from '../contexts/appointment/index.js';

export function createAppointmentRoutes({ controller }: AppointmentModule): Router {
  const router = Router();

  // All appointment routes require owner authentication
  router.use(JwtMiddleware.requireOwner());

  // GET /appointments - list owner appointments
  router.get('/', async (req, res) => {
    return controller.getAppointmentsByOwner(req, res);
  });

  // GET /appointments/:id
  router.get('/:id', async (req, res) => {
    return controller.getAppointmentById(req, res);
  });

  // POST /appointments
  router.post('/', async (req, res) => {
    return controller.createAppointment(req, res);
  });

  // PUT /appointments/:id
  router.put('/:id', async (req, res) => {
    return controller.updateAppointment(req, res);
  });

  // DELETE /appointments/:id
  router.delete('/:id', async (req, res) => {
    return controller.deleteAppointment(req, res);
  });

  return router;
}
