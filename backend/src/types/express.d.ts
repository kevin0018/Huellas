import { UserType } from '../contexts/auth/domain/entities/UserAuth.js';

// Express type extensions
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: number;
        email: string;
        type: UserType;
      };
    }
  }
}

export {};
