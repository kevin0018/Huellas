import { PrismaClient } from '@prisma/client';

export async function seedPets(prisma: PrismaClient) {
    const owners = await prisma.owner.findMany({
        include: { user: true }
    });

    if (owners.length === 0) {
        throw new Error('No owners found. Run user seeder first.');
    }

    const pets = await Promise.all([
        // Pets para Juan García
        prisma.pet.create({
            data: {
                name: 'Luna',
                race: 'Golden Retriever',
                type: 'dog',
                owner_id: owners[0].id,
                birth_date: new Date('2022-03-15'),
                size: 'large',
                microchip_code: 'ES982000000000001',
                sex: 'female',
                has_passport: true,
                country_of_origin: 'Spain',
                passport_number: 'ESP001234',
                notes: 'Muy amigable y activa. Le encanta jugar con otros perros.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Charlie',
                race: 'Beagle',
                type: 'dog',
                owner_id: owners[0].id,
                birth_date: new Date('2020-12-03'),
                size: 'medium',
                microchip_code: 'ES982000000000002',
                sex: 'male',
                has_passport: false,
                notes: 'Le encanta comer, tendencia al sobrepeso. Necesita dieta controlada.'
            }
        }),

        // Pets para María López
        prisma.pet.create({
            data: {
                name: 'Max',
                race: 'Pastor Alemán',
                type: 'dog',
                owner_id: owners[1].id,
                birth_date: new Date('2021-07-22'),
                size: 'large',
                microchip_code: 'ES982000000000003',
                sex: 'male',
                has_passport: false,
                notes: 'Perro guardián muy inteligente. Necesita ejercicio intenso diario.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Sophie',
                race: 'Hurón Doméstico',
                type: 'ferret',
                owner_id: owners[1].id,
                birth_date: new Date('2023-05-20'),
                size: 'small',
                microchip_code: 'ES982000000000004',
                sex: 'female',
                has_passport: false,
                notes: 'Muy juguetona y curiosa. Requiere vigilancia constante.'
            }
        }),

        // Pets para Carlos Rodríguez
        prisma.pet.create({
            data: {
                name: 'Mia',
                race: 'Siamés',
                type: 'cat',
                owner_id: owners[2].id,
                birth_date: new Date('2023-01-10'),
                size: 'small',
                microchip_code: 'ES982000000000005',
                sex: 'female',
                has_passport: true,
                country_of_origin: 'Thailand',
                passport_number: 'THA567890',
                notes: 'Gata muy independiente y vocal. Descendiente de línea tailandesa.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Chloe',
                race: 'Persa',
                type: 'cat',
                owner_id: owners[2].id,
                birth_date: new Date('2021-04-25'),
                size: 'medium',
                microchip_code: 'ES982000000000006',
                sex: 'female',
                has_passport: false,
                notes: 'Requiere cepillado diario. Pelo largo, propensa a bolas de pelo.'
            }
        }),

        // Pets adicionales distribuidas entre owners
        prisma.pet.create({
            data: {
                name: 'Rocky',
                race: 'Bulldog Francés',
                type: 'dog',
                owner_id: owners[0].id,
                birth_date: new Date('2022-11-05'),
                size: 'medium',
                microchip_code: 'ES982000000000007',
                sex: 'male',
                has_passport: false,
                notes: 'Problemas respiratorios leves típicos de la raza. Evitar ejercicio intenso.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Bella',
                race: 'Maine Coon',
                type: 'cat',
                owner_id: owners[1].id,
                birth_date: new Date('2021-09-18'),
                size: 'large',
                microchip_code: 'ES982000000000008',
                sex: 'female',
                has_passport: true,
                country_of_origin: 'USA',
                passport_number: 'USA123456',
                notes: 'Gata de gran tamaño, muy sociable con otros animales.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Zeus',
                race: 'Rottweiler',
                type: 'dog',
                owner_id: owners[2].id,
                birth_date: new Date('2020-06-30'),
                size: 'large',
                microchip_code: 'ES982000000000009',
                sex: 'male',
                has_passport: true,
                country_of_origin: 'Germany',
                passport_number: 'GER789012',
                notes: 'Muy protector y leal. Entrenamiento en obediencia avanzada.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Toby',
                race: 'Labrador Chocolate',
                type: 'dog',
                owner_id: owners[0].id,
                birth_date: new Date('2022-08-14'),
                size: 'large',
                microchip_code: 'ES982000000000010',
                sex: 'male',
                has_passport: true,
                country_of_origin: 'Canada',
                passport_number: 'CAN345678',
                notes: 'Excelente nadador. Le encanta el agua y recuperar objetos.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Nina',
                race: 'Border Collie',
                type: 'dog',
                owner_id: owners[0].id,
                birth_date: new Date('2021-05-12'),
                size: 'medium',
                microchip_code: 'ES982000000000011',
                sex: 'female',
                has_passport: true,
                country_of_origin: 'Spain',
                passport_number: 'ESP001235',
                notes: 'Muy inteligente y activa, le encanta correr y aprender trucos.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Simba',
                race: 'Bengalí',
                type: 'cat',
                owner_id: owners[0].id,
                birth_date: new Date('2023-02-20'),
                size: 'medium',
                microchip_code: 'ES982000000000012',
                sex: 'male',
                has_passport: false,
                notes: 'Gato curioso y juguetón, con pelaje moteado.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Milo',
                race: 'Hurón Albino',
                type: 'ferret',
                owner_id: owners[0].id,
                birth_date: new Date('2022-09-01'),
                size: 'small',
                microchip_code: 'ES982000000000013',
                sex: 'male',
                has_passport: false,
                notes: 'Hurón muy sociable, le gusta explorar y dormir en lugares escondidos.'
            }
        }),

        prisma.pet.create({
            data: {
                name: 'Lola',
                race: 'Shih Tzu',
                type: 'dog',
                owner_id: owners[0].id,
                birth_date: new Date('2020-04-18'),
                size: 'small',
                microchip_code: 'ES982000000000014',
                sex: 'female',
                has_passport: true,
                country_of_origin: 'Portugal',
                passport_number: 'PT123456',
                notes: 'Perra pequeña y cariñosa, ideal para compañía en casa.'
            }
        }),
    ]);

    return pets;
}