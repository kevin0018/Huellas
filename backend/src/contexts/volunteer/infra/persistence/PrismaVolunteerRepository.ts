import { VolunteerRepository } from '../../domain/repositories/VolunteerRepository.js';
import { Volunteer } from '../../domain/entities/Volunteer.js';
import { VolunteerId } from '../../domain/value-objects/VolunteerId.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class PrismaVolunteerRepository implements VolunteerRepository {
  async findById(id: VolunteerId): Promise<Volunteer | null> {
    const volunteerRecord = await prisma.volunteer.findUnique({
      where: { id: id.getValue() },
      include: {
        user: true
      }
    });

    if (!volunteerRecord || !volunteerRecord.user) return null;

    return Volunteer.createWithHashedPassword(
      new VolunteerId(volunteerRecord.id),
      volunteerRecord.user.name,
      volunteerRecord.user.last_name,
      volunteerRecord.user.email,
      volunteerRecord.user.password,
      volunteerRecord.description
    );
  }

  async save(volunteer: Volunteer): Promise<number> {
    // Check if email is unique
    const existingUser = await prisma.user.findUnique({
      where: { email: volunteer.email }
    });

    if (existingUser) {
      throw new Error('Volunteer with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(volunteer.password, 12);

    // Create user and volunteer
    const createdUser = await prisma.user.create({
      data: {
        name: volunteer.name,
        last_name: volunteer.lastName,
        email: volunteer.email,
        password: hashedPassword,
        type: 'volunteer',
        volunteer: {
          create: {
            description: volunteer.description
          }
        }
      }
    });

    return createdUser.id;
  }

  async delete(id: VolunteerId): Promise<void> {
    await prisma.user.delete({
      where: { id: id.getValue() }
    });
  }
}
