import { VolunteerId } from "../value-objects/VolunteerId.js";
import bcrypt from 'bcrypt';

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

  // Factory method to create Volunteer with hashed password
  static async create(
    id: VolunteerId,
    name: string,
    lastName: string,
    email: string,
    plainPassword: string,
    description: string,
  ): Promise<Volunteer> {
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    return new Volunteer(id, name, lastName, email, hashedPassword, description);
  }

  // Factory method for testing with pre-hashed password
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

  // Method to verify password
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._password);
  }
}