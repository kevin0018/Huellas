import { Router } from 'express';
import { RegisterVolunteerController } from '../contexts/volunteer/infra/controllers/RegisterVolunteerController.js';
import { DeleteVolunteerController } from '../contexts/volunteer/infra/controllers/DeleteVolunteerController.js';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';

const router = Router();
const registerVolunteerController = new RegisterVolunteerController();
const deleteVolunteerController = new DeleteVolunteerController();

// POST /api/volunteers/register - Register new volunteer
router.post('/register', (req, res) => registerVolunteerController.handle(req, res));

// DELETE /api/volunteers/:id - Delete volunteer account (authenticated)
router.delete('/:id', JwtMiddleware.requireAuthenticated(), (req, res) => deleteVolunteerController.handle(req, res));

export { router as volunteerRoutes };
