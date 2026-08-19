import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserType } from '../../domain/entities/UserAuth.js';
import { accessForProfiles, Capability, type UserRole } from '../../domain/AccessControl.js';
import { JwtBlacklist } from '../services/JwtBlacklist.js';
import { prisma } from '../../../../db/prisma.js';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    type: UserType;
    roles: UserRole[];
    capabilities: Capability[];
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
  type: UserType;
  roles?: UserRole[];
  capabilities?: Capability[];
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

        const currentUser = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { type: true, owner: { select: { id: true } }, volunteer: { select: { id: true } } },
        });
        if (!currentUser) {
          res.status(401).json({ error: 'User no longer exists' });
          return;
        }
        const access = accessForProfiles({
          owner: currentUser.owner !== null,
          volunteer: currentUser.volunteer !== null,
        });

        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          type: currentUser.type as UserType,
          ...access,
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
      async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        if (req.user.capabilities.includes(Capability.MANAGE_PETS)) {
          next();
          return;
        }
        res.status(403).json({ error: 'Access denied. Owner role required.' });
      }
    ];
  }

  // Middleware to require authentication first, then check volunteer role
  static requireVolunteer() {
    return [
      JwtMiddleware.authenticate(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user.capabilities.includes(Capability.PUBLISH_VOLUNTEER_POSTS)) {
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

  static requireOwnPet() {
    return [
      JwtMiddleware.requireOwner(),
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const ownerId = req.user.userId;
        const petId = req.params.id;
        const parsedPetId = parseInt(petId);

        if (isNaN(parsedPetId)) {
          res.status(400).send({ error: "Id must be a number" });
          return
        }

        const pet = await prisma.pet.findUnique({ where: { id: parsedPetId }, select: { owner_id: true } });

        if (!pet) {
          res.status(404).send({ error: "Pet not found" });
          return
        }

        if (pet.owner_id !== ownerId) {
          res.status(403).send({ error: "You don't have access to this pet" });
          return
        }
        
        next();
      }
    ];
  }
}
