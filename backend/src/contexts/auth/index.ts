import { ChangePasswordCommandHandler } from './app/commands/changePassword/ChangePasswordCommandHandler.js';
import { LoginCommandHandler } from './app/commands/login/LoginCommandHandler.js';
import { LogoutCommandHandler } from './app/commands/logout/LogoutCommandHandler.js';
import { CreateVolunteerProfileCommandHandler, DeleteVolunteerProfileCommandHandler } from './app/commands/toggleVolunteer/VolunteerCommandHandlers.js';
import { UpdateUserProfileCommandHandler } from './app/commands/updateProfile/UpdateUserProfileCommandHandler.js';
import { GetCurrentProfileQueryHandler } from './app/queries/getCurrentProfile/GetCurrentProfileQueryHandler.js';
import { AuthController } from './infra/controllers/AuthController.js';
import { ProfileController } from './infra/controllers/ProfileController.js';
import { PrismaAuthRepository } from './infra/repositories/PrismaAuthRepository.js';
import { RegisterOwnerCommandHandler } from '../owner/app/commands/registerOwner/RegisterOwnerCommandHandler.js';
import { DeleteOwnerCommandHandler } from '../owner/app/commands/delete/DeleteOwnerCommandHandler.js';
import { RegisterOwnerController } from '../owner/infra/controllers/RegisterOwnerController.js';
import { DeleteOwnerController } from '../owner/infra/controllers/DeleteOwnerController.js';
import { PrismaOwnerRepository } from '../owner/infra/persistence/PrismaOwnerRepository.js';
import { RegisterVolunteerCommandHandler } from '../volunteer/app/commands/register/RegisterVolunteerCommandHandler.js';
import { DeleteVolunteerCommandHandler } from '../volunteer/app/commands/delete/DeleteVolunteerCommandHandler.js';
import { RegisterVolunteerController } from '../volunteer/infra/controllers/RegisterVolunteerController.js';
import { DeleteVolunteerController } from '../volunteer/infra/controllers/DeleteVolunteerController.js';
import { PrismaVolunteerRepository } from '../volunteer/infra/persistence/PrismaVolunteerRepository.js';

export interface IdentityModule {
  authController: AuthController;
  profileController: ProfileController;
  ownerAccounts: {
    register: RegisterOwnerController;
    delete: DeleteOwnerController;
  };
  volunteerAccounts: {
    register: RegisterVolunteerController;
    delete: DeleteVolunteerController;
  };
}

export function createIdentityModule(): IdentityModule {
  const repository = new PrismaAuthRepository();
  const getCurrentProfile = new GetCurrentProfileQueryHandler(repository);
  const owners = new PrismaOwnerRepository();
  const volunteers = new PrismaVolunteerRepository();

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
    ownerAccounts: {
      register: new RegisterOwnerController(new RegisterOwnerCommandHandler(owners)),
      delete: new DeleteOwnerController(new DeleteOwnerCommandHandler(owners)),
    },
    volunteerAccounts: {
      register: new RegisterVolunteerController(new RegisterVolunteerCommandHandler(volunteers)),
      delete: new DeleteVolunteerController(new DeleteVolunteerCommandHandler(volunteers)),
    },
  };
}
