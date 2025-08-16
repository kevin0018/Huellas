import { describe, it, expect } from 'vitest';
import { Owner } from '../../domain/entities/Owner.js';
import { OwnerId } from '../../domain/value-objects/OwnerId.js';

describe('Owner entity', () => {
  it('should create an Owner with valid data', () => {
    const id = new OwnerId(1);
    const owner = Owner.createWithHashedPassword(id, 'Marc', 'Smith', 'marc@email.com', 'hashedPassword123', []);
    expect(owner.id.getValue()).toBe(1);
    expect(owner.name).toBe('Marc');
    expect(owner.lastName).toBe('Smith');
    expect(owner.email).toBe('marc@email.com');
    expect(owner.password).toBe('hashedPassword123');
    expect(owner.petIds).toEqual([]);
  });

  it('should create an Owner with hashed password using factory method', async () => {
    const id = new OwnerId(1);
    const owner = await Owner.create(id, 'Marc', 'Smith', 'marc@email.com', 'plainPassword');
    
    expect(owner.id.getValue()).toBe(1);
    expect(owner.name).toBe('Marc');
    expect(owner.lastName).toBe('Smith');
    expect(owner.email).toBe('marc@email.com');
    expect(owner.password).not.toBe('plainPassword');
    expect(owner.password.length).toBeGreaterThan(50);
    expect(owner.petIds).toEqual([]);
  });
});