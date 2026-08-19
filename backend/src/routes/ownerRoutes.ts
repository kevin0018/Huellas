import { Router } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { PetCareModule } from '../contexts/pet/index.js';
import type { IdentityModule } from '../contexts/auth/index.js';

export function createOwnerRoutes({ pets }: PetCareModule, { ownerAccounts }: IdentityModule): Router {
  console.log('Creating owner routes...');
  const router = Router();

  // Routes
  console.log('Registering POST /register route...');
  router.post('/register', async (req, res) => {
    console.log('POST /register endpoint');
    await ownerAccounts.register.handle(req, res);
  });

  console.log('Registering DELETE /:id route...');
  router.delete('/:id', ...JwtMiddleware.requireOwner(), async (req, res) => {
    console.log('DELETE /:id endpoint');
    await ownerAccounts.delete.handle(req, res);
  });

  //GET My Pets Route
  router.get('/my-pets', ...JwtMiddleware.requireOwner(), async (req: AuthenticatedRequest, res) => {
    await pets.listMine.handle(req, res);
  });

  return router;
}
