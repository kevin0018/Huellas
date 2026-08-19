import { describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../auth/infra/middleware/JwtMiddleware.js';
import type { IPetRepository } from '../../domain/repositories/IPetRepository.js';
import { Pet } from '../../domain/entities/Pet.js';
import { PostPetController } from '../../infra/controllers/PostPetController.js';
import { PatchPetController } from '../../infra/controllers/PatchPetController.js';

function responseMock(): Response {
  const response = { status: vi.fn(), send: vi.fn() };
  response.status.mockReturnValue(response);
  response.send.mockReturnValue(response);
  return response as unknown as Response;
}

const savedPet = new Pet(1, 'Luna', null, 'dog', 7, new Date('2020-01-01'), 'medium', null, 'female', false, null, null, null);

describe('pet create and update contracts', () => {
  it('creates a pet without known breed or microchip', async () => {
    const repository = { save: vi.fn().mockResolvedValue(savedPet) } as unknown as IPetRepository;
    const request = {
      user: { userId: 7, email: 'owner@example.com', type: 'owner' },
      body: {
        name: 'Luna', race: '', type: 'dog', birthDate: '2020-01-01', size: 'medium',
        microchipCode: '', sex: 'female', hasPassport: false,
      },
    } as AuthenticatedRequest;
    const response = responseMock();

    await new PostPetController(repository).handle(request, response);

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      ownerId: 7,
      race: null,
      microchipCode: null,
    }));
    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('updates type, microchip and clears optional fields', async () => {
    const repository = { update: vi.fn().mockResolvedValue(savedPet) } as unknown as IPetRepository;
    const request = {
      params: { id: '1' },
      body: {
        type: 'cat', microchipCode: '', race: '', countryOfOrigin: null,
        passportNumber: null, notes: null,
      },
    } as unknown as AuthenticatedRequest;
    const response = responseMock();

    await new PatchPetController(repository).handle(request, response);

    expect(repository.update).toHaveBeenCalledWith(1, expect.objectContaining({
      type: 'cat',
      microchipCode: null,
      race: null,
      countryOfOrigin: null,
      passportNumber: null,
      notes: null,
    }));
    expect(response.status).toHaveBeenCalledWith(200);
  });
});
