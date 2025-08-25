import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserType } from '../../domain/entities/UserAuth.js';
import { JwtBlacklist } from '../services/JwtBlacklist.js';
import { PetRepository } from '../../../pet/infra/persistence/PetRepository.js';

// Simple cache for owner profile checks to avoid repeated DB queries
const ownerProfileCache = new Map<number, boolean>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface AuthenticatedRequest extends Request {
  user: {
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
      async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        // Allow if user type is OWNER
        if (req.user.type === UserType.OWNER) {
          next();
          return;
        }

        // If user is VOLUNTEER, check if they also have an owner profile
        if (req.user.type === UserType.VOLUNTEER) {
          try {
            const userId = req.user.userId;
            
            // Check cache first
            const cached = ownerProfileCache.get(userId);
            if (cached !== undefined) {
              if (cached) {
                next();
                return;
              } else {
                res.status(403).json({ error: 'Access denied. Owner role required.' });
                return;
              }
            }

            // Cache miss - check database
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient();
            
            const ownerProfile = await prisma.owner.findUnique({
              where: { id: userId }
            });

            const hasOwnerProfile = !!ownerProfile;
            
            // Cache the result
            ownerProfileCache.set(userId, hasOwnerProfile);
            
            // Clear cache after TTL
            setTimeout(() => {
              ownerProfileCache.delete(userId);
            }, CACHE_TTL);

            if (hasOwnerProfile) {
              next();
              return;
            }
          } catch (error) {
            console.error('Error checking owner profile:', error);
          }
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
        if (req.user.type !== UserType.VOLUNTEER) {
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

        const petRepository = new PetRepository();
        const pet = await petRepository.findById(parsedPetId);

        if (!pet) {
          res.status(404).send({ error: "Pet not found" });
          return
        }

        if (pet.getOwnerId() !== ownerId) {
          res.status(403).send({ error: "You don't have access to this pet" });
          return
        }
        
        next();
      }
    ];
  }
}
