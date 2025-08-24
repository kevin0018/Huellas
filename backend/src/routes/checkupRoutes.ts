import { Router, Response } from 'express';
import { AuthenticatedRequest, JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import { CheckupRepository } from '../contexts/checkup/infra/persistence/CheckupRepository.js';
import { PostCheckupController } from '../contexts/checkup/infra/controllers/PostCheckupController.js';

export function createCheckupRoutes(): Router {
  console.log('Creating checkup routes...');
  const router = Router();

  // Dependency injection setup
  console.log('Setting up dependencies...');
  const checkupRepository = new CheckupRepository();

  // Controllers
  const createCheckupController = new PostCheckupController(checkupRepository);

  // Routes
 

  return router;
}

