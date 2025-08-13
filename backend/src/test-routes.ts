import { Router } from 'express';
import { JwtMiddleware, AuthenticatedRequest } from './contexts/auth/infra/middleware/JwtMiddleware.js';

const router = Router();

/**
 * Test routes for manual JWT testing
 * Use with the JWT token from the login endpoint
*/

// Protected route example - requires authentication
router.get('/protected', JwtMiddleware.requireAuthenticated(), (req: AuthenticatedRequest, res) => {
  const { userId, email, type } = req.user!;
  
  res.json({
    message: 'Access granted to protected route',
    user: {
      id: userId,
      email,
      type
    },
    timestamp: new Date().toISOString()
  });
});

// Owners-only route example
router.get('/owners-only', ...JwtMiddleware.requireOwner(), (req: AuthenticatedRequest, res) => {
  const { userId, email } = req.user!;
  
  res.json({
    message: 'This route is for owners only',
    owner: {
      id: userId,
      email
    },
    adminAccess: true,
    timestamp: new Date().toISOString()
  });
});

// Example public route
router.get('/public', (req, res) => {
  res.json({
    message: 'Esta es una ruta pública',
    status: 'accessible to everyone',
    timestamp: new Date().toISOString()
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test routes are working',
    timestamp: new Date().toISOString()
  });
});

export { router as testRoutes };
