import type { AuthRepository } from '../../domain/AuthRepository';
import { ChangePasswordCommand } from './ChangePasswordCommand';

export class ChangePasswordCommandHandler {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async handle(command: ChangePasswordCommand): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Validate that passwords are different
    if (command.currentPassword === command.newPassword) {
      throw new Error('New password must be different from current password');
    }

    await this.authRepository.changePassword(token, {
      currentPassword: command.currentPassword,
      newPassword: command.newPassword
    });
  }
}
