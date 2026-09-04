import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { PetCareModule } from '../contexts/pet/index.js';
import type { HealthModule } from '../contexts/health/index.js';
import { Capability } from '../contexts/auth/domain/AccessControl.js';

export function createPetRoutes({ pets, checkups, procedures }: PetCareModule, health: HealthModule): Router {
  const router = Router();

  // Routes
  // GET Pet Route
  router.get('/:id', ...JwtMiddleware.requireOwnPet(), async (req: AuthenticatedRequest, res: Response) => {
    await pets.get.handle(req, res);
  });

  // DELETE Pet Route
  router.delete('/:id', ...JwtMiddleware.requireOwnPet(), async (req: AuthenticatedRequest, res: Response) => {
    await pets.delete.handle(req, res);
  });

  // POST Pet Route
  router.post('/', ...JwtMiddleware.requireCapability(Capability.MANAGE_PETS), async (req: AuthenticatedRequest, res: Response) => {
    await pets.create.handle(req, res);
  });

  // PATCH Pet Route
  router.patch('/:id', ...JwtMiddleware.requireOwnPet(), async (req: AuthenticatedRequest, res: Response) => {
    await pets.update.handle(req, res);
  });

 // POST Checkup Route
  router.post('/:id/checkup', ...JwtMiddleware.requireOwnPet(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await checkups.create.handle(req, res);
  });

  // Get Pet Checkups Route 
  router.get('/:id/checkups', ...JwtMiddleware.requireOwnPet(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await checkups.listByPet.handle(req, res);
  });

  //Get Pet Procedures Status Route
  router.get('/:id/procedures', ... JwtMiddleware.requireOwnPet(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await procedures.getStatusByPet.handle(req, res);
  });

  router.get('/:id/health-events', ...JwtMiddleware.requireOwnPet(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await health.events.list(req, res);
  });

  router.post('/:id/health-events', ...JwtMiddleware.requireOwnPet(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await health.events.create(req, res);
  });

  router.post('/:id/health-documents', ...JwtMiddleware.requireOwnPet(Capability.MANAGE_HEALTH), async (req: AuthenticatedRequest, res: Response) => {
    await health.documents.create(req, res);
  });
  router.post('/:id/health-export', ...JwtMiddleware.requireOwnPet(Capability.MANAGE_HEALTH), (req: AuthenticatedRequest, res: Response) => health.shares.export(req, res));
  router.post('/:id/health-shares', ...JwtMiddleware.requireOwnPet(Capability.MANAGE_HEALTH), (req: AuthenticatedRequest, res: Response) => health.shares.create(req, res));
  router.get('/:id/health-shares', ...JwtMiddleware.requireOwnPet(Capability.MANAGE_HEALTH), (req: AuthenticatedRequest, res: Response) => health.shares.list(req, res));

  return router;
}
