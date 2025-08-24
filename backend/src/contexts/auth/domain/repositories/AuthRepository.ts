import { UserAuth } from '../entities/UserAuth.js';

export interface AuthRepository {
  findByEmail(email: string): Promise<UserAuth | null>;
  findById(id: number): Promise<UserAuth | null>;
  getUserWithDescription(id: number): Promise<{ user: UserAuth; description?: string } | null>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  updateProfile(userId: number, name: string, lastName: string, email: string, description?: string): Promise<UserAuth>;
  updatePassword(userId: number, plainPassword: string): Promise<void>;
  createVolunteerProfile(userId: number, description: string): Promise<void>;
  deleteVolunteerProfile(userId: number): Promise<void>;
  hasVolunteerProfile(userId: number): Promise<boolean>;
}
