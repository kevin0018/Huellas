import { describe, it, expect } from 'vitest';
import { Owner } from '../../domain/entities/Owner.js';
import { OwnerId } from '../../domain/value-objects/OwnerId.js';

describe('Owner entity', () => {
  it('should create an Owner with valid data', () => {
    const id = new OwnerId(1);
    const owner = new Owner(id, 'Marc', 'Smith', 'marc@email.com', []);
    expect(owner.id.getValue()).toBe(1);
    expect(owner.name).toBe('Marc');
    expect(owner.lastName).toBe('Smith');
    expect(owner.email).toBe('marc@email.com');
    expect(owner.petIds).toEqual([]);
  });
});