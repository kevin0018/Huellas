import { UserType } from '../contexts/auth/domain/entities/UserAuth.js';
import type { Capability, UserRole } from '../contexts/auth/domain/AccessControl.js';

// Express type extensions
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: number;
        email: string;
        type: UserType;
        roles: UserRole[];
        capabilities: Capability[];
      };
    }
  }
}

export {};
