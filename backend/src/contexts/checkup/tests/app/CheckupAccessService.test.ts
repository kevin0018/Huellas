import { describe, expect, it, vi } from 'vitest';
import { CheckupAccessService } from '../../app/CheckupAccessService.js';
import { Checkup } from '../../domain/entities/Checkup.js';
import { Pet } from '../../../pet/domain/entities/Pet.js';
import type { ICheckupRepository } from '../../domain/repositories/ICheckupRepository.js';
import type { IPetRepository } from '../../../pet/domain/repositories/IPetRepository.js';

function createPet(id: number, ownerId: number): Pet {
  return new Pet(id, 'Luna', 'Mixed', 'dog', ownerId, new Date('2020-01-01'), 'medium', 'chip', 'female', false, null, null, null);
}

describe('CheckupAccessService', () => {
  it('allows the owner to access a checkup', async () => {
    const checkup = new Checkup(5, 10, 2, new Date(), null);
    const checkups = { findById: vi.fn().mockResolvedValue(checkup) } as unknown as ICheckupRepository;
    const pets = { findById: vi.fn().mockResolvedValue(createPet(10, 1)) } as unknown as IPetRepository;

    const result = await new CheckupAccessService(checkups, pets).requireOwnedCheckup(5, 1);

    expect(result.checkup).toBe(checkup);
  });

  it('hides a checkup that belongs to another owner', async () => {
    const checkup = new Checkup(5, 10, 2, new Date(), null);
    const checkups = { findById: vi.fn().mockResolvedValue(checkup) } as unknown as ICheckupRepository;
    const pets = { findById: vi.fn().mockResolvedValue(createPet(10, 2)) } as unknown as IPetRepository;

    await expect(
      new CheckupAccessService(checkups, pets).requireOwnedCheckup(5, 1)
    ).rejects.toThrow('Resource not found');
  });

  it('uses the same response for a missing checkup', async () => {
    const checkups = { findById: vi.fn().mockResolvedValue(null) } as unknown as ICheckupRepository;
    const pets = { findById: vi.fn() } as unknown as IPetRepository;

    await expect(
      new CheckupAccessService(checkups, pets).requireOwnedCheckup(999, 1)
    ).rejects.toThrow('Resource not found');
    expect(pets.findById).not.toHaveBeenCalled();
  });
});
