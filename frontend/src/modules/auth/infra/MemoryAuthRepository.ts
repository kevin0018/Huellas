import type { AuthRepository } from '../domain/AuthRepository';
import type { LoginResponse, User } from '../domain/User';
import { UserType } from '../domain/User';

export class MemoryAuthRepository implements AuthRepository {
  private users: Array<{ email: string; password: string; user: User }> = [
    {
      email: 'owner@example.com',
      password: 'password123',
      user: {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'owner@example.com',
        type: UserType.OWNER
      }
    },
    {
      email: 'volunteer@example.com', 
      password: 'password456',
      user: {
        id: 2,
        name: 'Jane',
        lastName: 'Smith',
        email: 'volunteer@example.com',
        type: UserType.VOLUNTEER
      }
    }
  ];

  async login(email: string, password: string): Promise<LoginResponse> {
    const foundUser = this.users.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    return {
      token: `token-${foundUser.user.id}-${Date.now()}`,
      user: foundUser.user
    };
  }

  async logout(): Promise<void> {
    // In memory implementation - nothing to do on server side
    // Local storage will be cleared by the application layer
  }
}
