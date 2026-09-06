import { describe, expect, it } from 'vitest';
import { accessForProfiles, Capability, UserRole } from '../../domain/AccessControl.js';

describe('accessForProfiles', () => {
  it.each([
    [{ owner: true, volunteer: false }, [UserRole.OWNER], false],
    [{ owner: false, volunteer: true }, [UserRole.VOLUNTEER], true],
    [{ owner: true, volunteer: true }, [UserRole.OWNER, UserRole.VOLUNTEER], true],
  ])('derives accumulable access for %o', (profiles, roles, canPublish) => {
    const access = accessForProfiles(profiles);

    expect(access.roles).toEqual(roles);
    expect(access.capabilities).toContain(Capability.USE_CHAT);
    expect(access.capabilities.includes(Capability.MANAGE_PETS)).toBe(profiles.owner);
    expect(access.capabilities.includes(Capability.PUBLISH_VOLUNTEER_POSTS)).toBe(canPublish);
  });
});
