import jwt from 'jsonwebtoken';
import { AuthRepository } from '../../../domain/repositories/AuthRepository.js';
import { UserType } from '../../../domain/entities/UserAuth.js';
import { LoginCommand } from './LoginCommand.js';
import { GetCurrentProfileQueryHandler } from '../../queries/getCurrentProfile/GetCurrentProfileQueryHandler.js';
import { GetCurrentProfileQuery } from '../../queries/getCurrentProfile/GetCurrentProfileQuery.js';
import { accessForLegacyProfile, type Capability, type UserRole } from '../../../domain/AccessControl.js';

export interface LoginResult {
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    type: UserType;
    description?: string;
    roles: UserRole[];
    capabilities: Capability[];
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
    const access = userProfile?.roles && userProfile.capabilities
      ? { roles: userProfile.roles, capabilities: userProfile.capabilities }
      : accessForLegacyProfile(user.type, Boolean(userProfile?.description));

    // Generate JWT token with secure secret validation
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        type: user.type,
        ...access,
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
        description: userProfile?.description,
        ...access,
      }
    };
  }
}
