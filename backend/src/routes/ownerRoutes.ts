import { Router } from 'express';
import { RegisterOwnerController } from '../contexts/owner/infra/controllers/RegisterOwnerController.js';
import { RegisterOwnerCommandHandler } from '../contexts/owner/app/commands/registerOwner/RegisterOwnerCommandHandler.js';
import { PrismaOwnerRepository } from '../contexts/owner/infra/persistence/PrismaOwnerRepository.js';

export function createOwnerRoutes(): Router {
  console.log('Creating owner routes...');
  const router = Router();

  // Dependency injection setup
  console.log('Setting up dependencies...');
  const ownerRepository = new PrismaOwnerRepository();
  const commandHandler = new RegisterOwnerCommandHandler(ownerRepository);
  const controller = new RegisterOwnerController(commandHandler);

  // Routes
  console.log('Registering POST /register route...');
  router.post('/register', async (req, res) => {
    console.log('POST /register endpoint hit!');
    await controller.handle(req, res);
  });

  return router;
}
