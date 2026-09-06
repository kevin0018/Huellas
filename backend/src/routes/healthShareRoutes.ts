import { Router } from 'express';
import { JwtMiddleware, type AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { HealthModule } from '../contexts/health/index.js';
import { Capability } from '../contexts/auth/domain/AccessControl.js';

export function createHealthShareRoutes({ shares }: HealthModule): Router {
  const router = Router(); router.use(JwtMiddleware.requireCapability(Capability.MANAGE_HEALTH));
  router.delete('/:id', (req, res) => shares.revoke(req as AuthenticatedRequest, res)); return router;
}

export function createPublicHealthShareRoutes({ shares }: HealthModule): Router {
  const router = Router(); router.get('/:token', (req, res) => shares.publicView(req.params.token, res)); return router;
}
