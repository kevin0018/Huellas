import { Router } from 'express';
import { JwtMiddleware, type AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { HealthModule } from '../contexts/health/index.js';
import { Capability } from '../contexts/auth/domain/AccessControl.js';

export function createHealthDocumentRoutes({ documents }: HealthModule): Router {
  const router = Router();
  router.use(JwtMiddleware.requireCapability(Capability.MANAGE_HEALTH));
  router.get('/:id', (req, res) => documents.download(req as AuthenticatedRequest, res));
  router.delete('/:id', (req, res) => documents.delete(req as AuthenticatedRequest, res));
  return router;
}
