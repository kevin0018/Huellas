import { LogoutCommand } from "./LogoutCommand.js";
import { JwtBlacklist } from '../../../infra/services/JwtBlacklist.js';

export class LogoutCommandHandler {
  
  async execute(command: LogoutCommand): Promise<{ message: string }> {
    // Add token to blacklist
    await JwtBlacklist.addToken(command.token);
    
    return {
      message: 'Logout successful'
    };
  }
}