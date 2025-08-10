import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterOwnerCommandHandler } from '../../../../app/commands/registerOwner/RegisterOwnerCommandHandler.js';
import { RegisterOwnerCommand } from '../../../../app/commands/registerOwner/RegisterOwnerCommand.js';
import { MemoryOwnerRepository } from '../../../../infra/persistence/MemoryOwnerRepository.js';
import { OwnerId } from '../../../../domain/value-objects/OwnerId.js';

describe('RegisterOwnerCommandHandler', () => {
  let ownerRepository: MemoryOwnerRepository;
  let handler: RegisterOwnerCommandHandler;

  beforeEach(() => {
    ownerRepository = new MemoryOwnerRepository();
    handler = new RegisterOwnerCommandHandler(ownerRepository);
  });

  it('should create and save a new Owner with valid data', async () => {
    const command = new RegisterOwnerCommand(
      1, // id
      'Marc',
      'Smith',
      'marc@email.com'
    );

    await handler.execute(command);

    const owner = await ownerRepository.findById(new OwnerId(1));
    expect(owner).not.toBeNull();
    expect(owner?.name).toBe('Marc');
    expect(owner?.lastName).toBe('Smith');
    expect(owner?.email).toBe('marc@email.com');
    expect(owner?.petIds).toEqual([]);
  });
});