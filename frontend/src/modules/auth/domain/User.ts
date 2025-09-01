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
// A user is considered a volunteer if:
// 1. Their type is VOLUNTEER (pure volunteer), OR
// 2. Their type is OWNER but they have a description (owner with volunteer profile)
export const isVolunteer = (user: User): boolean => 
  user.type === UserType.VOLUNTEER || (user.type === UserType.OWNER && !!user.description);

// Helper function to check if user is owner
export const isOwner = (user: User): boolean => user.type === UserType.OWNER;
