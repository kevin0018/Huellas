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
}

export interface LoginResponse {
  token: string;
  user: User;
}
