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
    // Memory repository doesn't need to do anything for logout
  }

  async updateProfile(token: string, profileData: {
    name: string;
    lastName: string;
    email: string;
  }): Promise<User> {
    // Extract user ID from token (simple mock implementation)
    const userIdMatch = token.match(/token-(\d+)-/);
    if (!userIdMatch) {
      throw new Error('Invalid token');
    }
    
    const userId = parseInt(userIdMatch[1]);
    const userIndex = this.users.findIndex(u => u.user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Check if email is already taken by another user
    const emailExists = this.users.some(u => u.user.id !== userId && u.user.email === profileData.email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Update user data
    this.users[userIndex].user = {
      ...this.users[userIndex].user,
      name: profileData.name,
      lastName: profileData.lastName,
      email: profileData.email
    };
    this.users[userIndex].email = profileData.email;

    return this.users[userIndex].user;
  }

  async changePassword(token: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    // Extract user ID from token
    const userIdMatch = token.match(/token-(\d+)-/);
    if (!userIdMatch) {
      throw new Error('Invalid token');
    }
    
    const userId = parseInt(userIdMatch[1]);
    const userIndex = this.users.findIndex(u => u.user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Verify current password
    if (this.users[userIndex].password !== passwordData.currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    this.users[userIndex].password = passwordData.newPassword;
  }

  async toggleVolunteer(token: string, volunteerData?: {
    description: string;
  }): Promise<User> {
    // Extract user ID from token
    const userIdMatch = token.match(/token-(\d+)-/);
    if (!userIdMatch) {
      throw new Error('Invalid token');
    }
    
    const userId = parseInt(userIdMatch[1]);
    const userIndex = this.users.findIndex(u => u.user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const currentUser = this.users[userIndex].user;
    
    if (volunteerData) {
      // Becoming a volunteer
      if (currentUser.type === UserType.VOLUNTEER) {
        throw new Error('User is already a volunteer');
      }
      
      this.users[userIndex].user = {
        ...currentUser,
        type: UserType.VOLUNTEER
      };
    } else {
      // Stopping being a volunteer
      if (currentUser.type !== UserType.VOLUNTEER) {
        throw new Error('User is not a volunteer');
      }
      
      this.users[userIndex].user = {
        ...currentUser,
        type: UserType.OWNER
      };
    }

    return this.users[userIndex].user;
  }
}
