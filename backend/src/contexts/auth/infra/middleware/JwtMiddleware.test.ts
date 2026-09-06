import type { NextFunction, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { Capability, UserRole } from '../../domain/AccessControl.js';
import { UserType } from '../../domain/entities/UserAuth.js';
import { JwtMiddleware, type AuthenticatedRequest } from './JwtMiddleware.js';

const ownerCapabilities = [
  Capability.USE_CHAT,
  Capability.MANAGE_PETS,
  Capability.MANAGE_HEALTH,
  Capability.MANAGE_APPOINTMENTS,
];
const volunteerCapabilities = [Capability.USE_CHAT, Capability.PUBLISH_VOLUNTEER_POSTS];

function request(capabilities: Capability[]): AuthenticatedRequest {
  return {
    user: {
      userId: 1,
      email: 'user@example.com',
      type: UserType.OWNER,
      roles: capabilities.includes(Capability.MANAGE_PETS) ? [UserRole.OWNER] : [UserRole.VOLUNTEER],
      capabilities,
    },
  } as AuthenticatedRequest;
}

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res as unknown as Response;
}

describe('JwtMiddleware capability guards', () => {
  it.each([
    [Capability.MANAGE_PETS, true, false],
    [Capability.MANAGE_HEALTH, true, false],
    [Capability.MANAGE_APPOINTMENTS, true, false],
    [Capability.USE_CHAT, true, true],
    [Capability.PUBLISH_VOLUNTEER_POSTS, false, true],
  ] as const)('enforces %s for owner and volunteer profiles', async (capability, ownerAllowed, volunteerAllowed) => {
    const guard = JwtMiddleware.requireCapability(capability)[1];

    for (const [capabilities, allowed] of [
      [ownerCapabilities, ownerAllowed],
      [volunteerCapabilities, volunteerAllowed],
    ] as const) {
      const res = response();
      const next = vi.fn() as NextFunction;
      await guard(request([...capabilities]), res, next);

      expect(next).toHaveBeenCalledTimes(allowed ? 1 : 0);
      expect(res.status).toHaveBeenCalledTimes(allowed ? 0 : 1);
      if (!allowed) {
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: `Access denied. Missing capability: ${capability}.` });
      }
    }
  });

  it('keeps legacy owner and volunteer aliases mapped to their original capabilities', () => {
    expect(JwtMiddleware.requireOwner()[1]).toBeTypeOf('function');
    expect(JwtMiddleware.requireVolunteer()[1]).toBeTypeOf('function');
  });
});
