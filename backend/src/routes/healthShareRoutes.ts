import { Router } from 'express';
import { JwtMiddleware, type AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { HealthShareController } from '../contexts/health/HealthShareController.js';

export function createHealthShareRoutes(): Router {
  const router = Router(); const controller = new HealthShareController(); router.use(JwtMiddleware.requireOwner());
  router.delete('/:id', (req, res) => controller.revoke(req as AuthenticatedRequest, res)); return router;
}

export function createPublicHealthShareRoutes(): Router {
  const router = Router(); const controller = new HealthShareController(); router.get('/:token', (req, res) => controller.publicView(req.params.token, res)); return router;
}
