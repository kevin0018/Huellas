import { Router } from 'express';
import { AuthController } from '../contexts/auth/infra/controllers/AuthController.js';
import { LoginCommandHandler } from '../contexts/auth/app/commands/login/LoginCommandHandler.js';
import { PrismaAuthRepository } from '../contexts/auth/infra/repositories/PrismaAuthRepository.js';

export function createAuthRoutes(): Router {
  const router = Router();

  // Dependency injection setup
  const authRepository = new PrismaAuthRepository();
  const loginHandler = new LoginCommandHandler(authRepository);
  const controller = new AuthController(loginHandler);

  // Routes
  router.post('/login', async (req, res) => {
    await controller.login(req, res);
  });

  return router;
}
