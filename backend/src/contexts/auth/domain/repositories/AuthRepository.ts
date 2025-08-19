import { UserAuth } from '../entities/UserAuth.js';

export interface AuthRepository {
  findByEmail(email: string): Promise<UserAuth | null>;
  findById(id: number): Promise<UserAuth | null>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
