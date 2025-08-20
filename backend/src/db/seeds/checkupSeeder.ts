import { PrismaClient } from '@prisma/client';

export async function seedCheckups(prisma: PrismaClient) {
    const pets = await prisma.pet.findMany();
    const procedures = await prisma.procedureSchedule.findMany();

    if (pets.length === 0 || procedures.length === 0) {
        throw new Error('No pets or procedures found. Run pet and procedure seeders first.');
    }

    const checkups = [];

    for (const pet of pets) {
        // Filter procedures by animal type
        const relevantProcedures = procedures.filter(p => p.animal_type === pet.type);

        // Create 2-4 checkups per pet
        const checkupCount = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < checkupCount; i++) {
            const checkupDate = new Date();
            checkupDate.setMonth(checkupDate.getMonth() - (i * 2)); // Every 2 months in the past

            // Pick a random relevant procedure
            const randomProcedure = relevantProcedures[Math.floor(Math.random() * relevantProcedures.length)];

            const notes = generateCheckupNotes(pet, randomProcedure, i);

            const checkup = await prisma.checkup.create({
                data: {
                    pet_id: pet.id,
                    procedure_id: randomProcedure.id,
                    date: checkupDate,
                    notes: notes
                }
            });

            checkups.push(checkup);
        }
    }

    return checkups;
}

function generateCheckupNotes(pet: any, procedure: any, checkupNumber: number): string {
    const notes = [
        `Procedimiento: ${procedure.procedure_name} realizado correctamente en ${pet.name}.`,
        `${pet.name} mostró buen comportamiento durante el ${procedure.procedure_name}.`,
        `Control de rutina - ${procedure.procedure_name}. ${pet.name} en excelente estado.`,
        `${procedure.procedure_name} aplicado sin complicaciones. ${pet.name} tolera bien el tratamiento.`,
        `Revisión general satisfactoria. ${procedure.procedure_name} completado según protocolo.`
    ];

    const additionalNotes = [
        ` Peso estable.`,
        ` Se recomienda seguimiento en 3 meses.`,
        ` Propietario informado sobre cuidados posteriores.`,
        ` Animal reactivo y alerta.`,
        ` Se observa buen estado general de salud.`,
        ` Recomendado mantener rutina de ejercicio.`,
        ` Control de dieta sugerido.`
    ];

    const baseNote = notes[Math.floor(Math.random() * notes.length)];
    const extraNote = additionalNotes[Math.floor(Math.random() * additionalNotes.length)];

    return baseNote + extraNote;
}