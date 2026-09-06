import { Router } from 'express';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { IdentityModule } from '../contexts/auth/index.js';

export function createVolunteerRoutes({ volunteerAccounts }: IdentityModule): Router {
const router = Router();

// POST /api/volunteers/register - Register new volunteer
router.post('/register', (req, res) => volunteerAccounts.register.handle(req, res));

// DELETE /api/volunteers/:id - Delete volunteer account (authenticated)
router.delete('/:id', JwtMiddleware.requireAuthenticated(), (req, res) => volunteerAccounts.delete.handle(req, res));

return router;
}
