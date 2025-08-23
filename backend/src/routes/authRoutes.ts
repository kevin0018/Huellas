import { Router } from 'express';
import { AuthController } from '../contexts/auth/infra/controllers/AuthController.js';
import { ProfileController } from '../contexts/auth/infra/controllers/ProfileController.js';
import { LoginCommandHandler } from '../contexts/auth/app/commands/login/LoginCommandHandler.js';
import { LogoutCommandHandler } from '../contexts/auth/app/commands/logout/LogoutCommandHandler.js';
import { UpdateUserProfileCommandHandler } from '../contexts/auth/app/commands/updateProfile/UpdateUserProfileCommandHandler.js';
import { ChangePasswordCommandHandler } from '../contexts/auth/app/commands/changePassword/ChangePasswordCommandHandler.js';
import { CreateVolunteerProfileCommandHandler, DeleteVolunteerProfileCommandHandler } from '../contexts/auth/app/commands/toggleVolunteer/VolunteerCommandHandlers.js';
import { PrismaAuthRepository } from '../contexts/auth/infra/repositories/PrismaAuthRepository.js';
import { JwtMiddleware, AuthenticatedRequest } from '../contexts/auth/infra/middleware/JwtMiddleware.js';

export function createAuthRoutes(): Router {
  const router = Router();

  // Dependency injection setup
  const authRepository = new PrismaAuthRepository();
  
  // Auth handlers
  const loginHandler = new LoginCommandHandler(authRepository);
  const logoutHandler = new LogoutCommandHandler();
  const authController = new AuthController(loginHandler, logoutHandler);

  // Profile handlers
  const updateProfileHandler = new UpdateUserProfileCommandHandler(authRepository);
  const changePasswordHandler = new ChangePasswordCommandHandler(authRepository);
  const createVolunteerHandler = new CreateVolunteerProfileCommandHandler(authRepository);
  const deleteVolunteerHandler = new DeleteVolunteerProfileCommandHandler(authRepository);
  const profileController = new ProfileController(
    updateProfileHandler, 
    changePasswordHandler, 
    createVolunteerHandler, 
    deleteVolunteerHandler
  );

  // Auth routes
  router.post('/login', async (req, res) => {
    await authController.login(req, res);
  });

  router.post('/logout', JwtMiddleware.requireAuthenticated(), async (req, res) => {
    await authController.logout(req, res);
  });

  // Profile routes (authenticated)
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
