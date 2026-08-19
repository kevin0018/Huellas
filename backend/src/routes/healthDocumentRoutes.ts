import { Router } from 'express';
import { JwtMiddleware, type AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { HealthDocumentController } from '../contexts/health/HealthDocumentController.js';

export function createHealthDocumentRoutes(): Router {
  const router = Router();
  const controller = new HealthDocumentController();
  router.use(JwtMiddleware.requireOwner());
  router.get('/:id', (req, res) => controller.download(req as AuthenticatedRequest, res));
  router.delete('/:id', (req, res) => controller.delete(req as AuthenticatedRequest, res));
  return router;
}
