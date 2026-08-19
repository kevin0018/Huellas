import { Router } from 'express';
import { JwtMiddleware, type AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { HealthModule } from '../contexts/health/index.js';

export function createHealthEventRoutes({ events }: HealthModule): Router {
  const router = Router();
  router.use(JwtMiddleware.requireOwner());
  router.put('/:id', (req, res) => events.update(req as AuthenticatedRequest, res));
  router.delete('/:id', (req, res) => events.delete(req as AuthenticatedRequest, res));
  return router;
}
