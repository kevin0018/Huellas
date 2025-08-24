import { AuthRepository } from '../../../domain/repositories/AuthRepository.js';
import { ChangePasswordCommand } from './ChangePasswordCommand.js';

export class ChangePasswordCommandHandler {
  constructor(private readonly authRepository: AuthRepository) {}

  async handle(command: ChangePasswordCommand): Promise<void> {
    // Get current user
    const user = await this.authRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.authRepository.verifyPassword(
      command.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    await this.authRepository.updatePassword(command.userId, command.newPassword);
  }
}
