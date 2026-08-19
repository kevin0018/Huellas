import { Router } from 'express';
import { JwtMiddleware, AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { IdentityModule } from '../contexts/auth/index.js';

export function createAuthRoutes({ authController, profileController }: IdentityModule): Router {
  const router = Router();

  // Auth routes
  router.post('/login', async (req, res) => {
    await authController.login(req, res);
  });

  router.post('/logout', JwtMiddleware.requireAuthenticated(), async (req, res) => {
    await authController.logout(req, res);
  });

  // Profile routes (authenticated)
  router.get('/profile', JwtMiddleware.requireAuthenticated(), async (req: AuthenticatedRequest, res) => {
    await profileController.getCurrentProfile(req, res);
  });

  router.put('/profile', JwtMiddleware.requireAuthenticated(), async (req: AuthenticatedRequest, res) => {
    await profileController.updateProfile(req, res);
  });

  router.put('/password', JwtMiddleware.requireAuthenticated(), async (req: AuthenticatedRequest, res) => {
    await profileController.changePassword(req, res);
  });

  router.post('/volunteer', JwtMiddleware.requireAuthenticated(), async (req: AuthenticatedRequest, res) => {
    await profileController.createVolunteerProfile(req, res);
  });

  router.delete('/volunteer', JwtMiddleware.requireAuthenticated(), async (req: AuthenticatedRequest, res) => {
    await profileController.deleteVolunteerProfile(req, res);
  });

  return router;
}
