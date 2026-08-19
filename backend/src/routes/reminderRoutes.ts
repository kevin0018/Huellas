import { Router } from 'express';
import { JwtMiddleware, type AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { ReminderController } from '../contexts/reminder/ReminderController.js';

export function createReminderRoutes(): Router {
  const router = Router(); const controller = new ReminderController();
  router.use(JwtMiddleware.requireOwner());
  router.get('/', (req, res) => controller.list(req as AuthenticatedRequest, res));
  router.patch('/preferences', (req, res) => controller.preferences(req as AuthenticatedRequest, res));
  router.patch('/:id', (req, res) => controller.action(req as AuthenticatedRequest, res));
  return router;
}
