import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserType } from '../../domain/entities/UserAuth.js';
import { accessForProfiles, Capability, type UserRole } from '../../domain/AccessControl.js';
import { JwtBlacklist } from '../services/JwtBlacklist.js';

export interface JwtDataSource {
  findUserAccess(userId: number): Promise<{
    type: UserType;
    owner: { id: number } | null;
    volunteer: { id: number } | null;
  } | null>;
  findPetOwner(petId: number): Promise<{ owner_id: number } | null>;
}

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
  private static dataSource: JwtDataSource | null = null;

  static configure(dataSource: JwtDataSource): void {
    JwtMiddleware.dataSource = dataSource;
  }

  private static getDataSource(): JwtDataSource {
    if (!JwtMiddleware.dataSource) throw new Error('JWT middleware data source is not configured');
    return JwtMiddleware.dataSource;
  }

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

        const currentUser = await JwtMiddleware.getDataSource().findUserAccess(decoded.userId);
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

  static requireCapability(capability: Capability) {
    return [
      JwtMiddleware.authenticate(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (req.user.capabilities.includes(capability)) {
          next();
          return;
        }
        res.status(403).json({ error: `Access denied. Missing capability: ${capability}.` });
      }
    ];
  }

  // Legacy alias retained while consumers migrate to explicit capabilities.
  static requireOwner() {
    return JwtMiddleware.requireCapability(Capability.MANAGE_PETS);
  }

  // Middleware to require authentication first, then check volunteer role
  static requireVolunteer() {
    return JwtMiddleware.requireCapability(Capability.PUBLISH_VOLUNTEER_POSTS);
  }

  // Middleware to just require any authenticated user
  static requireAuthenticated() {
    return JwtMiddleware.authenticate();
  }

  static requireOwnPet(capability: Capability = Capability.MANAGE_PETS) {
    return [
      JwtMiddleware.requireCapability(capability),
      async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const ownerId = req.user.userId;
        const petId = req.params.id;
        const parsedPetId = parseInt(petId);

        if (isNaN(parsedPetId)) {
          res.status(400).send({ error: "Id must be a number" });
          return
        }

        const pet = await JwtMiddleware.getDataSource().findPetOwner(parsedPetId);

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
