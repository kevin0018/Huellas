import { OwnerId } from "../value-objects/OwnerId.js";
import bcrypt from 'bcrypt';

export class Owner {
  constructor(
    public readonly id: OwnerId,
    public readonly name: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly petIds: number[]
  ) {}

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
}