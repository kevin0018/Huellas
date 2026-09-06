import { Router } from 'express';
import { JwtMiddleware, type AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { HealthModule } from '../contexts/health/index.js';
import { Capability } from '../contexts/auth/domain/AccessControl.js';

export function createReminderRoutes({ reminders }: HealthModule): Router {
  const router = Router();
  router.use(JwtMiddleware.requireCapability(Capability.MANAGE_HEALTH));
  router.get('/', (req, res) => reminders.list(req as AuthenticatedRequest, res));
  router.patch('/preferences', (req, res) => reminders.preferences(req as AuthenticatedRequest, res));
  router.patch('/:id', (req, res) => reminders.action(req as AuthenticatedRequest, res));
  return router;
}
