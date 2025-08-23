import type { AuthRepository } from '../../domain/AuthRepository';
import type { LoginResponse } from '../../domain/User';
import type { LoginCommand } from './LoginCommand';

export class LoginCommandHandler {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(command: LoginCommand): Promise<LoginResponse> {
    return await this.authRepository.login(command.email, command.password);
  }
}
