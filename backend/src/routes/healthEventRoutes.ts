import { Router } from 'express';
import { JwtMiddleware, type AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { HealthEventController } from '../contexts/health/HealthEventController.js';

export function createHealthEventRoutes(): Router {
  const router = Router();
  const controller = new HealthEventController();
  router.use(JwtMiddleware.requireOwner());
  router.put('/:id', (req, res) => controller.update(req as AuthenticatedRequest, res));
  router.delete('/:id', (req, res) => controller.delete(req as AuthenticatedRequest, res));
  return router;
}
