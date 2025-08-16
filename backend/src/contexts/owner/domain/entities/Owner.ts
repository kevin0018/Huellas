import { OwnerId } from "../value-objects/OwnerId.js";
import bcrypt from 'bcrypt';

export class Owner {
  private constructor(
    private readonly _id: OwnerId,
    private readonly _name: string,
    private readonly _lastName: string,
    private readonly _email: string,
    private readonly _password: string,
    private readonly _petIds: number[]
  ) {}

  // Getters
  get id(): OwnerId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get lastName(): string {
    return this._lastName;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get petIds(): number[] {
    // Return a copy to prevent external mutation
    return [...this._petIds];
  }

  // Factory method to create Owner with hashed password
  static async create(
    id: OwnerId,
    name: string,
    lastName: string,
    email: string,
    plainPassword: string
  ): Promise<Owner> {
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    return new Owner(id, name, lastName, email, hashedPassword, []);
  }

  // Factory method for testing with pre-hashed password
  static createWithHashedPassword(
    id: OwnerId,
    name: string,
    lastName: string,
    email: string,
    hashedPassword: string,
    petIds: number[] = []
  ): Owner {
    return new Owner(id, name, lastName, email, hashedPassword, petIds);
  }

  // Method to verify password
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._password);
  }

  // Domain methods
  
  // Change password with proper validation and hashing
  async changePassword(currentPassword: string, newPassword: string): Promise<Owner> {
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    return new Owner(this._id, this._name, this._lastName, this._email, hashedNewPassword, this._petIds);
  }

  // Update personal information with validation
  updatePersonalInfo(name: string, lastName: string): Owner {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty');
    }

    return new Owner(this._id, name.trim(), lastName.trim(), this._email, this._password, this._petIds);
  }

  // Update email with validation
  updateEmail(newEmail: string): Owner {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error('Invalid email format');
    }

    return new Owner(this._id, this._name, this._lastName, newEmail, this._password, this._petIds);
  }

  // Add pet to owner
  addPet(petId: number): Owner {
    if (this._petIds.includes(petId)) {
      throw new Error('Pet is already associated with this owner');
    }

    return new Owner(this._id, this._name, this._lastName, this._email, this._password, [...this._petIds, petId]);
  }

  // Remove pet from owner
  removePet(petId: number): Owner {
    const updatedPetIds = this._petIds.filter(id => id !== petId);
    return new Owner(this._id, this._name, this._lastName, this._email, this._password, updatedPetIds);
  }
}