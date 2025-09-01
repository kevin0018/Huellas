import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../../domain/repositories/AuthRepository.js';
import { UserAuth, UserType } from '../../domain/entities/UserAuth.js';

interface VolunteerProfile {
  userId: number;
  description: string;
}

export class MemoryAuthRepository implements AuthRepository {
  private users: UserAuth[] = [];
  private volunteerProfiles: VolunteerProfile[] = [];

  async findByEmail(email: string): Promise<UserAuth | null> {
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  async findById(id: number): Promise<UserAuth | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async getUserWithDescription(id: number): Promise<{ user: UserAuth; description?: string } | null> {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      return null;
    }

    const volunteerProfile = this.volunteerProfiles.find(v => v.userId === id);
    return {
      user,
      description: volunteerProfile?.description
    };
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateProfile(userId: number, name: string, lastName: string, email: string, description?: string): Promise<UserAuth> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const existingUser = this.users[userIndex];
    const updatedUser = UserAuth.create(
      userId,
      name,
      lastName,
      email,
      existingUser.password,
      existingUser.type
    );

    this.users[userIndex] = updatedUser;

    // Update volunteer description if provided and user is volunteer
    if (description !== undefined && existingUser.type === UserType.VOLUNTEER) {
      const volunteerIndex = this.volunteerProfiles.findIndex(v => v.userId === userId);
      if (volunteerIndex >= 0) {
        this.volunteerProfiles[volunteerIndex].description = description;
      } else {
        this.volunteerProfiles.push({ userId, description });
      }
    }

    return updatedUser;
  }

  async updatePassword(userId: number, plainPassword: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const existingUser = this.users[userIndex];
    const updatedUser = UserAuth.create(
      userId,
      existingUser.name,
      existingUser.lastName,
      existingUser.email,
      hashedPassword,
      existingUser.type
    );

    this.users[userIndex] = updatedUser;
  }

  async createVolunteerProfile(userId: number, description: string): Promise<void> {
    // Check if volunteer profile already exists
    const existingProfile = this.volunteerProfiles.find(p => p.userId === userId);
    if (existingProfile) {
      throw new Error('User already has a volunteer profile');
    }

    // Create volunteer profile
    this.volunteerProfiles.push({ userId, description });

    // Update user type to volunteer
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const existingUser = this.users[userIndex];
      const updatedUser = UserAuth.create(
        userId,
        existingUser.name,
        existingUser.lastName,
        existingUser.email,
        existingUser.password,
        UserType.VOLUNTEER
      );
      this.users[userIndex] = updatedUser;
    }
  }

  async deleteVolunteerProfile(userId: number): Promise<void> {
    // Check if volunteer profile exists
    const profileIndex = this.volunteerProfiles.findIndex(p => p.userId === userId);
    if (profileIndex === -1) {
      throw new Error('User does not have a volunteer profile');
    }

    // Remove volunteer profile
    this.volunteerProfiles.splice(profileIndex, 1);

    // Update user type back to owner
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const existingUser = this.users[userIndex];
      const updatedUser = UserAuth.create(
        userId,
        existingUser.name,
        existingUser.lastName,
        existingUser.email,
        existingUser.password,
        UserType.OWNER
      );
      this.users[userIndex] = updatedUser;
    }
  }

  async hasVolunteerProfile(userId: number): Promise<boolean> {
    return this.volunteerProfiles.some(p => p.userId === userId);
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
    this.volunteerProfiles = [];
  }

  async getAll(): Promise<UserAuth[]> {
    return [...this.users];
  }

  async getAllVolunteerProfiles(): Promise<VolunteerProfile[]> {
    return [...this.volunteerProfiles];
  }
}
