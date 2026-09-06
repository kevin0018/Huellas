import { Router } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { PetCareModule } from '../contexts/pet/index.js';
import type { IdentityModule } from '../contexts/auth/index.js';
import { Capability } from '../contexts/auth/domain/AccessControl.js';

export function createOwnerRoutes({ pets }: PetCareModule, { ownerAccounts }: IdentityModule): Router {
  const router = Router();

  // Routes
  router.post('/register', async (req, res) => {
    await ownerAccounts.register.handle(req, res);
  });

  router.delete('/:id', ...JwtMiddleware.requireCapability(Capability.MANAGE_PETS), async (req, res) => {
    await ownerAccounts.delete.handle(req, res);
  });

  //GET My Pets Route
  router.get('/my-pets', ...JwtMiddleware.requireCapability(Capability.MANAGE_PETS), async (req: AuthenticatedRequest, res) => {
    await pets.listMine.handle(req, res);
  });

  return router;
}
