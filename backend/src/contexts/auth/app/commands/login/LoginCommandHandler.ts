import jwt from 'jsonwebtoken';
import { AuthRepository } from '../../../domain/repositories/AuthRepository.js';
import { UserType } from '../../../domain/entities/UserAuth.js';
import { LoginCommand } from './LoginCommand.js';
import { GetCurrentProfileQueryHandler } from '../../queries/getCurrentProfile/GetCurrentProfileQueryHandler.js';
import { GetCurrentProfileQuery } from '../../queries/getCurrentProfile/GetCurrentProfileQuery.js';

export interface LoginResult {
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    type: UserType;
    description?: string;
  };
}

export class LoginCommandHandler {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly getCurrentProfileHandler: GetCurrentProfileQueryHandler
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const user = await this.authRepository.findByEmail(command.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await this.authRepository.verifyPassword(command.password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Get complete user profile including description if volunteer
    const query = new GetCurrentProfileQuery(user.id);
    const userProfile = await this.getCurrentProfileHandler.handle(query);

    // Generate JWT token with secure secret validation
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        type: user.type
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        type: user.type,
        description: userProfile?.description
      }
    };
  }
}
