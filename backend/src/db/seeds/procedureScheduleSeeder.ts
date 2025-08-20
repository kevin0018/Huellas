import { PrismaClient } from '@prisma/client';

export async function seedProcedureSchedules(prisma: PrismaClient) {
    const procedures = await Promise.all([
        // Dog procedures
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Vacuna polivalente',
                recommended_vaccines_age: 8,
                notes: 'Primera dosis de vacuna polivalente contra moquillo, hepatitis, parvovirosis'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Vacuna antirrábica',
                recommended_vaccines_age: 12,
                notes: 'Vacuna obligatoria contra la rabia'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Desparasitación interna',
                recommended_vaccines_age: 6,
                notes: 'Tratamiento contra parásitos intestinales'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Desparasitación externa',
                recommended_vaccines_age: 8,
                notes: 'Tratamiento contra pulgas, garrapatas y otros parásitos externos'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Vacuna tos de las perreras',
                recommended_vaccines_age: 10,
                notes: 'Protección contra traqueobronquitis infecciosa'
            }
        }),

        // Cat procedures
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Vacuna trivalente felina',
                recommended_vaccines_age: 9,
                notes: 'Vacuna contra panleucopenia, rinotraqueítis y calicivirus'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Vacuna leucemia felina',
                recommended_vaccines_age: 12,
                notes: 'Protección contra el virus de la leucemia felina'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Desparasitación felina',
                recommended_vaccines_age: 6,
                notes: 'Tratamiento específico para parásitos en gatos'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Vacuna antirrábica felina',
                recommended_vaccines_age: 16,
                notes: 'Vacuna contra la rabia para gatos'
            }
        }),

        // Ferret procedures
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Vacuna moquillo hurón',
                recommended_vaccines_age: 8,
                notes: 'Vacuna específica contra moquillo en hurones'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Vacuna rabia hurón',
                recommended_vaccines_age: 12,
                notes: 'Vacuna antirrábica para hurones'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Desparasitación hurón',
                recommended_vaccines_age: 6,
                notes: 'Tratamiento antiparasitario específico para hurones'
            }
        })
    ]);

    return procedures;
}