import type { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Capability } from '../contexts/auth/domain/AccessControl.js';
import { JwtMiddleware } from '../contexts/auth/infra/middleware/JwtMiddleware.js';
import type { AppointmentModule } from '../contexts/appointment/index.js';
import type { ChatModule } from '../contexts/chat/index.js';
import type { HealthModule } from '../contexts/health/index.js';
import type { PetCareModule } from '../contexts/pet/index.js';
import { createAppointmentRoutes } from './appointmentRoutes.js';
import { createChatRoutes } from './chatRoutes.js';
import { createHealthDocumentRoutes } from './healthDocumentRoutes.js';
import { createHealthEventRoutes } from './healthEventRoutes.js';
import { createHealthShareRoutes } from './healthShareRoutes.js';
import { createPetRoutes } from './petRoutes.js';
import { createReminderRoutes } from './reminderRoutes.js';

const pass = (_req: Request, _res: Response, next: NextFunction) => next();

describe('route capability wiring', () => {
  afterEach(() => vi.restoreAllMocks());

  it('protects appointment and chat modules with their dedicated capabilities', () => {
    const capability = vi.spyOn(JwtMiddleware, 'requireCapability').mockReturnValue([pass] as never);

    createAppointmentRoutes({ controller: {} } as AppointmentModule);
    createChatRoutes({ controller: {} } as ChatModule);

    expect(capability).toHaveBeenCalledWith(Capability.MANAGE_APPOINTMENTS);
    expect(capability).toHaveBeenCalledWith(Capability.USE_CHAT);
  });

  it('separates pet administration from health-record operations on pet routes', () => {
    const capability = vi.spyOn(JwtMiddleware, 'requireCapability').mockReturnValue([pass] as never);
    const ownPet = vi.spyOn(JwtMiddleware, 'requireOwnPet').mockReturnValue([pass] as never);

    createPetRoutes({ pets: {}, checkups: {}, procedures: {} } as PetCareModule, {} as HealthModule);

    expect(capability).toHaveBeenCalledWith(Capability.MANAGE_PETS);
    expect(ownPet).toHaveBeenCalledWith(Capability.MANAGE_HEALTH);
  });

  it('protects standalone health routes with MANAGE_HEALTH', () => {
    const capability = vi.spyOn(JwtMiddleware, 'requireCapability').mockReturnValue([pass] as never);
    const health = { documents: {}, events: {}, reminders: {}, shares: {} } as HealthModule;

    createHealthDocumentRoutes(health);
    createHealthEventRoutes(health);
    createHealthShareRoutes(health);
    createReminderRoutes(health);

    expect(capability).toHaveBeenCalledTimes(4);
    expect(capability).toHaveBeenCalledWith(Capability.MANAGE_HEALTH);
  });
});
