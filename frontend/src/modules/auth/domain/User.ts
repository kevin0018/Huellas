export const UserType = {
  OWNER: 'owner' as const,
  VOLUNTEER: 'volunteer' as const
};

export type UserType = typeof UserType[keyof typeof UserType];

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  type: UserType;
  description?: string; // For volunteers
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Helper function to check if user is volunteer
export const isVolunteer = (user: User): boolean => user.type === UserType.VOLUNTEER;
export const isOwner = (user: User): boolean => user.type === UserType.OWNER;
