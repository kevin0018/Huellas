import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/userSeeder.js';
import { seedProcedureSchedules } from './seeds/procedureScheduleSeeder.js';
import { seedPets } from './seeds/petSeeder.js';
import { seedCheckups } from './seeds/checkupSeeder.js';
import { seedAppointments } from './seeds/appointmentSeeder.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        // Clear existing data (in correct order to respect foreign keys)
        await prisma.checkup.deleteMany();
        await prisma.appointment.deleteMany();
        await prisma.pet.deleteMany();
        await prisma.procedureSchedule.deleteMany();
        await prisma.owner.deleteMany();
        await prisma.volunteer.deleteMany();
        await prisma.user.deleteMany();

        console.log('🗑️ Cleared existing data');

        // Seed in correct order (respecting foreign keys)
        await seedUsers(prisma);
        console.log('👥 Users seeded');

        await seedProcedureSchedules(prisma);
        console.log('💉 Procedure schedules seeded');

        await seedPets(prisma);
        console.log('🐕 Pets seeded');

        await seedCheckups(prisma);
        console.log('🩺 Checkups seeded');

        await seedAppointments(prisma);
        console.log('📅 Appointments seeded');

        console.log('✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });