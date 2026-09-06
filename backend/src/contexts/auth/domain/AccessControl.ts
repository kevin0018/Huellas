import { UserType } from './entities/UserAuth.js';

export enum UserRole {
  OWNER = 'owner',
  VOLUNTEER = 'volunteer',
}

export enum Capability {
  MANAGE_PETS = 'manage:pets',
  MANAGE_HEALTH = 'manage:health',
  MANAGE_APPOINTMENTS = 'manage:appointments',
  PUBLISH_VOLUNTEER_POSTS = 'publish:volunteer-posts',
  USE_CHAT = 'use:chat',
}

export interface UserAccess {
  roles: UserRole[];
  capabilities: Capability[];
}

export function accessForProfiles(profiles: { owner: boolean; volunteer: boolean }): UserAccess {
  const roles: UserRole[] = [];
  const capabilities = new Set<Capability>([Capability.USE_CHAT]);

  if (profiles.owner) {
    roles.push(UserRole.OWNER);
    capabilities.add(Capability.MANAGE_PETS);
    capabilities.add(Capability.MANAGE_HEALTH);
    capabilities.add(Capability.MANAGE_APPOINTMENTS);
  }
  if (profiles.volunteer) {
    roles.push(UserRole.VOLUNTEER);
    capabilities.add(Capability.PUBLISH_VOLUNTEER_POSTS);
  }

  return { roles, capabilities: [...capabilities] };
}

export function accessForLegacyProfile(type: UserType, hasVolunteerProfile: boolean): UserAccess {
  return accessForProfiles({
    owner: type === UserType.OWNER,
    volunteer: type === UserType.VOLUNTEER || hasVolunteerProfile,
  });
}
