import { Request, Response } from 'express';
import { LoginCommand } from '../../app/commands/login/LoginCommand.js';
import { LoginCommandHandler } from '../../app/commands/login/LoginCommandHandler.js';
import { LogoutCommand } from '../../app/commands/logout/LogoutCommand.js';
import { LogoutCommandHandler } from '../../app/commands/logout/LogoutCommandHandler.js';
import { AuthenticatedRequest } from '../middleware/JwtMiddleware.js';

export class AuthController {
  constructor(
    private readonly loginHandler: LoginCommandHandler,
    private readonly logoutHandler: LogoutCommandHandler
  ) {}

  async login(request: Request, response: Response): Promise<void> {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        response.status(400).json({ 
          error: 'Missing required fields: email, password' 
        });
        return;
      }

      const command = new LoginCommand(email, password);
      const result = await this.loginHandler.execute(command);

      response.status(200).json(result);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid email or password')) {
          response.status(401).json({ error: error.message });
        } else {
          response.status(400).json({ error: error.message });
        }
      } else {
        response.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async logout(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        response.status(401).json({ error: 'Authorization header missing' });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const command = new LogoutCommand(request.user!.userId.toString(), token);
      
      const result = await this.logoutHandler.execute(command);
      response.status(200).json(result);

    } catch (error) {
      if (error instanceof Error) {
        response.status(400).json({ error: error.message });
      } else {
        response.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
