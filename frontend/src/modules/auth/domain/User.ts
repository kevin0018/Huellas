export const UserType = {
  OWNER: 'owner' as const,
  VOLUNTEER: 'volunteer' as const
};

export type UserType = typeof UserType[keyof typeof UserType];

export const Capability = {
  MANAGE_PETS: 'manage:pets',
  MANAGE_HEALTH: 'manage:health',
  MANAGE_APPOINTMENTS: 'manage:appointments',
  PUBLISH_VOLUNTEER_POSTS: 'publish:volunteer-posts',
  USE_CHAT: 'use:chat',
} as const;

export type Capability = typeof Capability[keyof typeof Capability];

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  type: UserType;
  description?: string; // For volunteers
  roles?: UserType[];
  capabilities?: Capability[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Helper function to check if user is volunteer
// A user is considered a volunteer if:
// 1. Their type is VOLUNTEER (pure volunteer), OR
// 2. Their type is OWNER but they have a description (owner with volunteer profile)
export const isVolunteer = (user: User): boolean => 
  user.roles?.includes(UserType.VOLUNTEER) ??
  (user.type === UserType.VOLUNTEER || (user.type === UserType.OWNER && !!user.description));

// Helper function to check if user is owner
export const isOwner = (user: User): boolean =>
  user.roles?.includes(UserType.OWNER) ?? user.type === UserType.OWNER;

export const hasCapability = (user: User | null, capability: Capability): boolean => {
  if (!user) return false;
  if (user.capabilities) return user.capabilities.includes(capability);
  if (capability === Capability.PUBLISH_VOLUNTEER_POSTS) return isVolunteer(user);
  if (capability === Capability.USE_CHAT) return true;
  return isOwner(user);
};
