// userSeeder.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  // password: huellas123
  const hashedPassword =
    '$2a$12$LmoCNYhqu6KY1ifSr4pbF.PVzJtwcdpaDisgKn/ZGWYkk4EM..Hk.';

  // Create owners
  const owners = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Juan',
        last_name: 'García',
        email: 'juan@email.com',
        password: hashedPassword,
        type: 'owner',
        owner: { create: {} },
      },
      include: { owner: true },
    }),
    prisma.user.create({
      data: {
        name: 'María',
        last_name: 'López',
        email: 'maria@email.com',
        password: hashedPassword,
        type: 'owner',
        owner: { create: {} },
      },
      include: { owner: true },
    }),
    prisma.user.create({
      data: {
        name: 'Carlos',
        last_name: 'Rodríguez',
        email: 'carlos@email.com',
        password: hashedPassword,
        type: 'owner',
        owner: { create: {} },
      },
      include: { owner: true },
    }),
    // Added (present in DB, missing in file)
    prisma.user.create({
      data: {
        name: 'Fernanda',
        last_name: 'Montalvan',
        email: 'test@test.com',
        password: hashedPassword,
        type: 'owner',
        owner: { create: {} },
      },
      include: { owner: true },
    }),
    prisma.user.create({
      data: {
        name: 'Jordi',
        last_name: 'Hernandez',
        email: 'test2@test.com',
        password: hashedPassword,
        type: 'owner',
        owner: { create: {} },
      },
      include: { owner: true },
    }),
  ]);

  // Create volunteers
  const volunteers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ana',
        last_name: 'Martínez',
        email: 'ana@volunteer.com',
        password: hashedPassword,
        type: 'volunteer',
        volunteer: {
          create: {
            description: 'Veterinaria especializada en felinos',
          },
        },
      },
      include: { volunteer: true },
    }),
    prisma.user.create({
      data: {
        name: 'Luis',
        last_name: 'Sánchez',
        email: 'luis@volunteer.com',
        password: hashedPassword,
        type: 'volunteer',
        volunteer: {
          create: {
            description: 'Entrenador canino profesional',
          },
        },
      },
      include: { volunteer: true },
    }),
  ]);

  return { owners, volunteers };
}