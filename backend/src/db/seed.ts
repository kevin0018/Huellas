import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/userSeeder.js';
import { seedProcedureSchedules } from './seeds/procedureScheduleSeeder.js';
import { seedPets } from './seeds/petSeeder.js';
import { seedCheckups } from './seeds/checkupSeeder.js';
import { seedAppointments } from './seeds/appointmentSeeder.js';
import { seedVolunteerPosts } from './seeds/postsSeeder.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        // Clear existing data from children to parents so this seed can be rerun.
        await prisma.message.deleteMany();
        await prisma.conversationParticipant.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.volunteerPost.deleteMany();
        await prisma.healthDocument.deleteMany();
        await prisma.healthEvent.deleteMany();
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

        const legacyCheckups = await prisma.checkup.findMany({ include: { procedure: true, pet: true } });
        await prisma.healthEvent.createMany({
            data: legacyCheckups.map((checkup) => {
                const name = checkup.procedure.procedure_name.toLocaleLowerCase('es');
                const type = name.includes('vacun') ? 'VACCINATION'
                    : name.includes('test') ? 'TEST'
                    : name.includes('chequeo') || name.includes('revisi') ? 'GENERAL_CHECKUP'
                    : name.includes('paras') ? 'TREATMENT'
                    : 'OTHER';
                return {
                    pet_id: checkup.pet_id,
                    type,
                    occurred_at: checkup.date,
                    title: checkup.procedure.procedure_name,
                    notes: checkup.notes,
                    entered_by: checkup.pet.owner_id,
                    source: 'LEGACY_CHECKUP' as const,
                    legacy_checkup_id: checkup.id,
                };
            }),
        });

        await seedAppointments(prisma);
        console.log('📅 Appointments seeded');

        await seedVolunteerPosts(prisma);
        console.log('📝 Volunteer posts seeded');

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
