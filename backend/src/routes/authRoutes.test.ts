import type { Request, Response, Router } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { IdentityModule } from '../contexts/auth/index.js';
import { createAuthRoutes } from './authRoutes.js';

describe('auth routes composition', () => {
  it('delegates login HTTP requests to the injected identity module', async () => {
    const login = vi.fn(async (_request, response) => {
      response.status(200).json({ token: 'token' });
    });
    const identity = {
      authController: { login },
      profileController: {},
    } as unknown as IdentityModule;
    const router = createAuthRoutes(identity) as Router & {
      stack: Array<{
        route?: {
          path: string;
          stack: Array<{ handle: (request: Request, response: Response) => Promise<void> }>;
        };
      }>;
    };
    const route = router.stack.find((layer) => layer.route?.path === '/login')?.route;
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    await route!.stack.at(-1)!.handle({} as Request, response, vi.fn());

    expect(login).toHaveBeenCalledOnce();
    expect(response.status).toHaveBeenCalledWith(200);
  });
});
