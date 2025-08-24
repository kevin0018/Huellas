import type { AuthRepository } from '../../domain/AuthRepository';
import type { LogoutCommand } from './LogoutCommand';

export class LogoutCommandHandler {
  private readonly authRepository: AuthRepository;
  
  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handle(_command: LogoutCommand): Promise<void> {
    await this.authRepository.logout();
  }
}
