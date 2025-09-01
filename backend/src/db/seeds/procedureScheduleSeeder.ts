import { PrismaClient } from '@prisma/client';

export async function seedProcedureSchedules(prisma: PrismaClient) {
    const procedures = await Promise.all([
        // ---------------- DOG ----------------
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Desparasitación interna',
                recommended_vaccines_age: 2,
                notes: 'Primera desparasitación interna, repetir cada 2 semanas hasta los 3 meses'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Desparasitación externa',
                recommended_vaccines_age: 6,
                notes: 'Inicio de control antiparasitario externo'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Vacuna polivalente (1ª dosis)',
                recommended_vaccines_age: 8,
                notes: 'Moquillo, hepatitis, parvovirosis, parainfluenza'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Vacuna tos de las perreras',
                recommended_vaccines_age: 10,
                notes: 'Protección contra Bordetella y parainfluenza'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Vacuna polivalente (2ª dosis)',
                recommended_vaccines_age: 12,
                notes: 'Refuerzo de la vacuna polivalente'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Vacuna antirrábica',
                recommended_vaccines_age: 12,
                notes: 'Vacuna obligatoria contra la rabia (según legislación local)'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Vacuna polivalente (3ª dosis)',
                recommended_vaccines_age: 16,
                notes: 'Último refuerzo de cachorro para inmunidad completa'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Chequeo dental',
                recommended_vaccines_age: 24,
                notes: 'Revisión de dientes y encías, limpieza si es necesario'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Test de filaria',
                recommended_vaccines_age: 36,
                notes: 'Prueba anual para detectar filariosis canina'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'dog',
                procedure_name: 'Vacuna leishmaniosis',
                recommended_vaccines_age: 20,
                notes: 'Vacuna preventiva contra la leishmaniosis'
            }
        }),

        // ---------------- CAT ----------------
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Desparasitación interna',
                recommended_vaccines_age: 2,
                notes: 'Primera desparasitación interna, repetir cada 2 semanas hasta los 3 meses'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Desparasitación externa',
                recommended_vaccines_age: 6,
                notes: 'Control inicial contra pulgas y garrapatas'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Vacuna trivalente felina (1ª dosis)',
                recommended_vaccines_age: 8,
                notes: 'Panleucopenia, calicivirus, rinotraqueítis'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Vacuna leucemia felina (1ª dosis)',
                recommended_vaccines_age: 9,
                notes: 'Protección contra el virus de la leucemia felina (FeLV), especialmente en gatos de exterior'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Vacuna trivalente felina (2ª dosis)',
                recommended_vaccines_age: 12,
                notes: 'Refuerzo para asegurar inmunidad'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Vacuna leucemia felina (2ª dosis)',
                recommended_vaccines_age: 12,
                notes: 'Refuerzo de leucemia felina'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Vacuna antirrábica',
                recommended_vaccines_age: 16,
                notes: 'Vacuna contra la rabia (obligatoria en muchas regiones)'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Chequeo renal',
                recommended_vaccines_age: 24,
                notes: 'Revisión de función renal, especialmente en gatos mayores'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Test de inmunodeficiencia felina (FIV)',
                recommended_vaccines_age: 18,
                notes: 'Prueba para detectar el virus de inmunodeficiencia felina'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'cat',
                procedure_name: 'Test de leucemia felina (FeLV)',
                recommended_vaccines_age: 18,
                notes: 'Prueba para detectar el virus de la leucemia felina'
            }
        }),

        // ---------------- FERRET ----------------
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Desparasitación interna',
                recommended_vaccines_age: 4,
                notes: 'Inicio de control contra parásitos intestinales, repetir regularmente'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Vacuna contra moquillo (1ª dosis)',
                recommended_vaccines_age: 8,
                notes: 'Es esencial, el moquillo es altamente mortal en hurones'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Vacuna contra moquillo (refuerzo)',
                recommended_vaccines_age: 12,
                notes: 'Segundo refuerzo para completar la inmunización'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Vacuna contra rabia',
                recommended_vaccines_age: 12,
                notes: 'Vacuna obligatoria contra la rabia en hurones'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Vacuna contra moquillo (último refuerzo)',
                recommended_vaccines_age: 16,
                notes: 'Última dosis de la serie inicial de moquillo'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Chequeo anual completo',
                recommended_vaccines_age: 52,
                notes: 'Revisión general de salud, peso y estado físico'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Desparasitación externa',
                recommended_vaccines_age: 8,
                notes: 'Control de pulgas y garrapatas, especialmente en primavera'
            }
        }),
        prisma.procedureSchedule.create({
            data: {
                animal_type: 'ferret',
                procedure_name: 'Chequeo dental',
                recommended_vaccines_age: 24,
                notes: 'Revisión de dientes y encías'
            }
        }),
    ]);

    return procedures;
}
