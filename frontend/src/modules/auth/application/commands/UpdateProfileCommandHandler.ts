import { ClientError } from '../../../../shared/errors/ClientError';
import type { AuthRepository } from '../../domain/AuthRepository';
import type { User } from '../../domain/User';
import { UpdateProfileCommand } from './UpdateProfileCommand';
import { AuthService } from '../../infra/AuthService';

export class UpdateProfileCommandHandler {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async handle(command: UpdateProfileCommand): Promise<User> {
    const token = AuthService.getToken();
    if (!token) {
      throw new ClientError('AUTH_REQUIRED');
    }

    const updatedUser = await this.authRepository.updateProfile(token, {
      name: command.name,
      lastName: command.lastName,
      email: command.email,
      description: command.description
    });

    // Update user data using AuthService
    AuthService.saveAuth(token, updatedUser);

    return updatedUser;
  }
}
