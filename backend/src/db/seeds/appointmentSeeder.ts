import { PrismaClient, AppointmentReason } from '@prisma/client';

export async function seedAppointments(prisma: PrismaClient) {
    const pets = await prisma.pet.findMany();

    if (pets.length === 0) {
        throw new Error('No pets found. Run pet seeder first.');
    }

    const reasons: AppointmentReason[] = [
        'VACCINATION',
        'GENERAL_CHECKUP',
        'ANTI_PARASITIC_PRESCRIPTION',
        'OPERATION',
        'OTHERS'
    ];

    const appointments = [];

    for (const pet of pets) {
        // Create 1-3 appointments per pet (some future, some past)
        const appointmentCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < appointmentCount; i++) {
            const appointmentDate = new Date();

            // Mix of past and future appointments
            if (i % 2 === 0) {
                // Past appointments
                appointmentDate.setDate(appointmentDate.getDate() - Math.floor(Math.random() * 90));
            } else {
                // Future appointments
                appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 60) + 1);
            }

            const reason = reasons[Math.floor(Math.random() * reasons.length)];
            const notes = generateAppointmentNotes(pet, reason, appointmentDate);

            const appointment = await prisma.appointment.create({
                data: {
                    pet_id: pet.id,
                    date: appointmentDate,
                    reason: reason,
                    notes: notes
                }
            });

            appointments.push(appointment);
        }
    }

    return appointments;
}

function generateAppointmentNotes(pet: any, reason: AppointmentReason, date: Date): string {
    const isPast = date < new Date();

    const notesByReason = {
        VACCINATION: isPast
            ? `Vacunación completada para ${pet.name}. Próxima dosis programada según calendario.`
            : `Cita programada para vacunación de ${pet.name}. Traer cartilla sanitaria.`,

        GENERAL_CHECKUP: isPast
            ? `Revisión general completada. ${pet.name} en buen estado de salud.`
            : `Cita de revisión general para ${pet.name}. Chequeo completo programado.`,

        ANTI_PARASITIC_PRESCRIPTION: isPast
            ? `Tratamiento antiparasitario administrado a ${pet.name}. Efectivo y bien tolerado.`
            : `Cita para tratamiento antiparasitario de ${pet.name}. Ayuno de 4 horas previo.`,

        OPERATION: isPast
            ? `Intervención quirúrgica realizada exitosamente en ${pet.name}. Recuperación satisfactoria.`
            : `Cirugía programada para ${pet.name}. Pre-operatorio completo requerido.`,

        OTHERS: isPast
            ? `Consulta específica atendida para ${pet.name}. Tratamiento prescrito según necesidades.`
            : `Cita programada para consulta específica de ${pet.name}. Detalles a evaluar.`
    };

    return notesByReason[reason];
}