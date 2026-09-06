import { ChangePasswordCommand } from '../../modules/auth/application/commands/ChangePasswordCommand';
import { ChangePasswordCommandHandler } from '../../modules/auth/application/commands/ChangePasswordCommandHandler';
import { LoginCommand } from '../../modules/auth/application/commands/LoginCommand';
import { LoginCommandHandler } from '../../modules/auth/application/commands/LoginCommandHandler';
import { LogoutCommand } from '../../modules/auth/application/commands/LogoutCommand';
import { LogoutCommandHandler } from '../../modules/auth/application/commands/LogoutCommandHandler';
import { ToggleVolunteerCommand } from '../../modules/auth/application/commands/ToggleVolunteerCommand';
import { ToggleVolunteerCommandHandler } from '../../modules/auth/application/commands/ToggleVolunteerCommandHandler';
import { UpdateProfileCommand } from '../../modules/auth/application/commands/UpdateProfileCommand';
import { UpdateProfileCommandHandler } from '../../modules/auth/application/commands/UpdateProfileCommandHandler';
import type { LoginResponse, User } from '../../modules/auth/domain/User';
import { ApiAuthRepository } from '../../modules/auth/infra/ApiAuthRepository';
import { AuthService } from '../../modules/auth/infra/AuthService';

const repository = new ApiAuthRepository();
const loginHandler = new LoginCommandHandler(repository);
const logoutHandler = new LogoutCommandHandler(repository);
const updateProfileHandler = new UpdateProfileCommandHandler(repository);
const changePasswordHandler = new ChangePasswordCommandHandler(repository);
const toggleVolunteerHandler = new ToggleVolunteerCommandHandler(repository);

export const authActions = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await loginHandler.execute(new LoginCommand(email, password));
    AuthService.saveAuth(response.token, response.user);
    return response;
  },

  currentUser(): Promise<User | null> {
    return repository.getCurrentUser();
  },

  updateProfile(data: { name: string; lastName: string; email: string; description?: string }): Promise<User> {
    return updateProfileHandler.handle(new UpdateProfileCommand(data.name, data.lastName, data.email, data.description));
  },

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return changePasswordHandler.handle(new ChangePasswordCommand(currentPassword, newPassword));
  },

  toggleVolunteer(isBecomingVolunteer: boolean, description?: string): Promise<User> {
    return toggleVolunteerHandler.handle(new ToggleVolunteerCommand(isBecomingVolunteer, description));
  },

  logout(): Promise<void> {
    return logoutHandler.handle(new LogoutCommand());
  },
};
