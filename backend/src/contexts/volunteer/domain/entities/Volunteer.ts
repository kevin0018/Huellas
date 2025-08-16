import { VolunteerId } from "../value-objects/VolunteerId.js";
import bcrypt from 'bcrypt';

export class Volunteer {
  constructor(
    private readonly id: VolunteerId,
    private readonly name: string,
    private readonly lastName: string,
    private readonly email: string,
    private readonly password: string,
    private readonly description: string,
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