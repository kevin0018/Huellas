import { ClientError } from '../../../../shared/errors/ClientError';
import type { AuthRepository } from '../../domain/AuthRepository';
import { ChangePasswordCommand } from './ChangePasswordCommand';
import { AuthService } from '../../infra/AuthService';

export class ChangePasswordCommandHandler {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async handle(command: ChangePasswordCommand): Promise<void> {
    const token = AuthService.getToken();
    if (!token) {
      throw new ClientError('AUTH_REQUIRED');
    }

    // Validate that passwords are different
    if (command.currentPassword === command.newPassword) {
      throw new ClientError('PASSWORD_UNCHANGED');
    }

    await this.authRepository.changePassword(token, {
      currentPassword: command.currentPassword,
      newPassword: command.newPassword
    });
  }
}
