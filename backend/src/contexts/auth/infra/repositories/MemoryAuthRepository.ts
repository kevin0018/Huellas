import { AuthRepository } from '../../domain/repositories/AuthRepository.js';
import { UserAuth } from '../../domain/entities/UserAuth.js';

export class MemoryAuthRepository implements AuthRepository {
  private users: UserAuth[] = [];

  async findByEmail(email: string): Promise<UserAuth | null> {
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async findById(id: number): Promise<UserAuth | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  // Helper methods for testing
  async save(user: UserAuth): Promise<void> {
    const existingIndex = this.users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
  }

  async clear(): Promise<void> {
    this.users = [];
  }

  async getAll(): Promise<UserAuth[]> {
    return [...this.users];
  }
}
