import type { LoginResponse, User } from '../domain/User';

export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(token: string, profileData: {
    name: string;
    lastName: string;
    email: string;
    description?: string;
  }): Promise<User>;
  changePassword(token: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void>;
  toggleVolunteer(token: string, volunteerData?: {
    description: string;
  }): Promise<User>;
}
