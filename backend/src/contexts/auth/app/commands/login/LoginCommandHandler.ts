import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../../../domain/repositories/AuthRepository.js';
import { UserType } from '../../../domain/entities/UserAuth.js';
import { LoginCommand } from './LoginCommand.js';

export interface LoginResult {
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    type: UserType;
  };
}

export class LoginCommandHandler {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const user = await this.authRepository.findByEmail(command.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(command.password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

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
        type: user.type
      }
    };
  }
}
