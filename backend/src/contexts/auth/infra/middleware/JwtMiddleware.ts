import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserType } from '../../domain/entities/UserAuth.js';
import { JwtBlacklist } from '../services/JwtBlacklist.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    type: UserType;
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
  type: UserType;
  iat: number;
  exp: number;
}

export class JwtMiddleware {
  static authenticate() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
          res.status(401).json({ error: 'Authorization header missing' });
          return;
        }

        if (!authHeader.startsWith('Bearer ')) {
          res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
          return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Check if token is blacklisted (logout)
        const isBlacklisted = await JwtBlacklist.isBlacklisted(token);
        if (isBlacklisted) {
          res.status(401).json({ error: 'Token has been revoked' });
          return;
        }

        const jwtSecret = process.env.JWT_SECRET;
        
        if (!jwtSecret) {
          res.status(500).json({ error: 'Server configuration error' });
          return;
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        // Add user info to request
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          type: decoded.type
        };

        next();

      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          res.status(401).json({ error: 'Token expired' });
        } else if (error instanceof jwt.JsonWebTokenError) {
          res.status(401).json({ error: 'Invalid token' });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };
  }

  // Middleware to require authentication first, then check owner role
  static requireOwner() {
    return [
      JwtMiddleware.authenticate(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (req.user?.type !== UserType.OWNER) {
          res.status(403).json({ error: 'Access denied. Owner role required.' });
          return;
        }
        next();
      }
    ];
  }

  // Middleware to require authentication first, then check volunteer role
  static requireVolunteer() {
    return [
      JwtMiddleware.authenticate(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (req.user?.type !== UserType.VOLUNTEER) {
          res.status(403).json({ error: 'Access denied. Volunteer role required.' });
          return;
        }
        next();
      }
    ];
  }

  // Middleware to just require any authenticated user
  static requireAuthenticated() {
    return JwtMiddleware.authenticate();
  }
}
