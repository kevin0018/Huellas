import { VolunteerId } from "../value-objects/VolunteerId.js";

export class Volunteer {
  private constructor(
    private readonly _id: VolunteerId,
    private readonly _name: string,
    private readonly _lastName: string,
    private readonly _email: string,
    private readonly _password: string,
    private readonly _description: string,
  ) {}

  // Getters
  get id(): VolunteerId {
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

  get description(): string {
    return this._description;
  }

  // Factory method to create Volunteer
  static create(
    id: VolunteerId,
    name: string,
    lastName: string,
    email: string,
    password: string,
    description: string,
  ): Volunteer {
    Volunteer.validateName(name);
    Volunteer.validateLastName(lastName);
    Volunteer.validateEmail(email);
    Volunteer.validatePassword(password);
    Volunteer.validateDescription(description);

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();
    const trimmedLastName = lastName.trim();
    const trimmedDescription = description.trim();

    return new Volunteer(id, trimmedName, trimmedLastName, normalizedEmail, password, trimmedDescription);
  }

  // Validation methods
  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
  }

  private static validateLastName(lastName: string): void {
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
  }

  private static validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Invalid email format');
    }
  }

  private static validatePassword(password: string): void {
    if (!password) {
      throw new Error('Password is required');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  private static validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Description is required');
    }
  }

  // Factory method for testing
  static createWithHashedPassword(
    id: VolunteerId,
    name: string,
    lastName: string,
    email: string,
    hashedPassword: string,
    description: string
  ): Volunteer {
    return new Volunteer(id, name, lastName, email, hashedPassword, description);
  }

  // Domain method to check if user can delete this volunteer account
  canBeDeletedBy(requestingUserId: number): boolean {
    return this.id.getValue() === requestingUserId;
  }
}