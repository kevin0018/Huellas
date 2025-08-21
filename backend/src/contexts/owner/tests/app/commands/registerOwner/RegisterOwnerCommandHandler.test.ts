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
      'Marc',
      'Smith',
      'marc@email.com',
      'hashedPassword123'
    );

    const result = await handler.execute(command);

    expect(result.id).toBe(1);
    expect(result.message).toBe('Owner registered successfully');

    const owner = await ownerRepository.findById(new OwnerId(1));
    expect(owner).not.toBeNull();
    expect(owner?.name).toBe('Marc');
    expect(owner?.lastName).toBe('Smith');
    expect(owner?.email).toBe('marc@email.com');
    expect(owner?.password).not.toBe('hashedPassword123');
    expect(owner?.password.length).toBeGreaterThan(50);
    expect(owner?.petIds).toEqual([]);
  });

  it('should throw error if email already exists', async () => {
    const command1 = new RegisterOwnerCommand('Marc', 'Smith', 'marc@email.com', 'password1');
    const command2 = new RegisterOwnerCommand('John', 'Doe', 'marc@email.com', 'password2');

    await handler.execute(command1);

    await expect(handler.execute(command2)).rejects.toThrow('Email already exists');
  });

  it('should auto-generate unique IDs for different owners', async () => {
    const command1 = new RegisterOwnerCommand('Marc', 'Smith', 'marc@email.com', 'password1');
    const command2 = new RegisterOwnerCommand('John', 'Doe', 'john@email.com', 'password2');

    const result1 = await handler.execute(command1);
    const result2 = await handler.execute(command2);

    expect(result1.id).toBe(1);
    expect(result2.id).toBe(2);
    expect(result1.message).toBe('Owner registered successfully');
    expect(result2.message).toBe('Owner registered successfully');
  });

});