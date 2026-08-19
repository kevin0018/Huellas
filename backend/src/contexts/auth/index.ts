import { ChangePasswordCommandHandler } from './app/commands/changePassword/ChangePasswordCommandHandler.js';
import { LoginCommandHandler } from './app/commands/login/LoginCommandHandler.js';
import { LogoutCommandHandler } from './app/commands/logout/LogoutCommandHandler.js';
import { CreateVolunteerProfileCommandHandler, DeleteVolunteerProfileCommandHandler } from './app/commands/toggleVolunteer/VolunteerCommandHandlers.js';
import { UpdateUserProfileCommandHandler } from './app/commands/updateProfile/UpdateUserProfileCommandHandler.js';
import { GetCurrentProfileQueryHandler } from './app/queries/getCurrentProfile/GetCurrentProfileQueryHandler.js';
import { AuthController } from './infra/controllers/AuthController.js';
import { ProfileController } from './infra/controllers/ProfileController.js';
import { PrismaAuthRepository } from './infra/repositories/PrismaAuthRepository.js';

export interface IdentityModule {
  authController: AuthController;
  profileController: ProfileController;
}

export function createIdentityModule(): IdentityModule {
  const repository = new PrismaAuthRepository();
  const getCurrentProfile = new GetCurrentProfileQueryHandler(repository);

  return {
    authController: new AuthController(
      new LoginCommandHandler(repository, getCurrentProfile),
      new LogoutCommandHandler(),
    ),
    profileController: new ProfileController(
      new UpdateUserProfileCommandHandler(repository),
      new ChangePasswordCommandHandler(repository),
      new CreateVolunteerProfileCommandHandler(repository),
      new DeleteVolunteerProfileCommandHandler(repository),
      getCurrentProfile,
    ),
  };
}
