import { describe, expect, it } from 'vitest';
import { Capability, hasCapability, isOwner, isVolunteer, type User } from '../domain/User';

const baseUser = { id: 1, name: 'Test', lastName: 'User', email: 'test@example.com', type: 'owner' as const };

describe('user capabilities', () => {
  it.each([
    [{ ...baseUser, roles: ['owner'], capabilities: [Capability.MANAGE_PETS] }, true, false],
    [{ ...baseUser, type: 'volunteer', roles: ['volunteer'], capabilities: [Capability.PUBLISH_VOLUNTEER_POSTS] }, false, true],
    [{ ...baseUser, roles: ['owner', 'volunteer'], capabilities: [Capability.MANAGE_PETS, Capability.PUBLISH_VOLUNTEER_POSTS] }, true, true],
  ] as Array<[User, boolean, boolean]>)('uses the backend access contract for %#', (user, owner, volunteer) => {
    expect(isOwner(user)).toBe(owner);
    expect(isVolunteer(user)).toBe(volunteer);
    expect(hasCapability(user, Capability.MANAGE_PETS)).toBe(owner);
    expect(hasCapability(user, Capability.PUBLISH_VOLUNTEER_POSTS)).toBe(volunteer);
  });
});
