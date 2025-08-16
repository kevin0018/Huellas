import { VolunteerId } from "../value-objects/VolunteerId.js";
import bcrypt from 'bcrypt';

export class Volunteer {
  constructor(
    public readonly id: VolunteerId,
    public readonly name: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly description: string,
  ) {}

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
}