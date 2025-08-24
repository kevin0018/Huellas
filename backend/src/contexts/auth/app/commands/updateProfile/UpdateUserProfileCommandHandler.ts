import { AuthRepository } from '../../../domain/repositories/AuthRepository.js';
import { UpdateUserProfileCommand } from './UpdateUserProfileCommand.js';
import { UserAuth } from '../../../domain/entities/UserAuth.js';

export class UpdateUserProfileCommandHandler {
  constructor(private readonly authRepository: AuthRepository) {}

  get repository(): AuthRepository {
    return this.authRepository;
  }

  async handle(command: UpdateUserProfileCommand): Promise<UserAuth> {
    // Validate email uniqueness (exclude current user)
    const existingUser = await this.authRepository.findByEmail(command.email);
    if (existingUser && existingUser.id !== command.userId) {
      throw new Error('Email already exists');
    }

    // Update profile
    return await this.authRepository.updateProfile(
      command.userId,
      command.name,
      command.lastName,
      command.email,
      command.description
    );
  }
}
