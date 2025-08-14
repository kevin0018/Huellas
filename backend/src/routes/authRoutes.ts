import { Router } from 'express';
import { AuthController } from '../contexts/auth/infra/controllers/AuthController.js';
import { LoginCommandHandler } from '../contexts/auth/app/commands/login/LoginCommandHandler.js';
import { LogoutCommandHandler } from '../contexts/auth/app/commands/logout/LogoutCommandHandler.js';
import { PrismaAuthRepository } from '../contexts/auth/infra/repositories/PrismaAuthRepository.js';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';

export function createAuthRoutes(): Router {
  const router = Router();

  // Dependency injection setup
  const authRepository = new PrismaAuthRepository();
  const loginHandler = new LoginCommandHandler(authRepository);
  const logoutHandler = new LogoutCommandHandler();
  const controller = new AuthController(loginHandler, logoutHandler);

  // Routes
  router.post('/login', async (req, res) => {
    await controller.login(req, res);
  });

  router.post('/logout', JwtMiddleware.requireAuthenticated(), async (req, res) => {
    await controller.logout(req, res);
  });

  return router;
}
