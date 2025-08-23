import { CreatePetRequest } from "../../app/CreatePetUseCase.js";
import { Pet } from "../../domain/entities/Pet.js";
import { IPetRepository } from "../../domain/repositories/IPetRepository.js";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PetRepository implements IPetRepository {
    async findById(id: number): Promise<Pet | null> {
        const pet = await prisma.pet.findUnique({
            where: { id: id },
        });

        if (!pet) {
            return null
        }

        return new Pet(
            pet.id,
            pet.name,
            pet.race,
            pet.type,
            pet.owner_id,
            pet.birth_date,
            pet.size,
            pet.microchip_code,
            pet.sex,
            pet.has_passport,
            pet.country_of_origin,
            pet.passport_number,
            pet.notes
        );
    }


    async save(pet: CreatePetRequest): Promise<Pet> {
        const savedPet = await prisma.pet.create({
            data: {
                name: pet.name,
                race: pet.race,
                type: pet.type,
                owner_id: pet.ownerId,
                birth_date: pet.birthDate,
                size: pet.size,
                microchip_code: pet.microchipCode,
                sex: pet.sex,
                has_passport: pet.hasPassport,
                country_of_origin: pet.countryOfOrigin,
                passport_number: pet.passportNumber,
                notes: pet.notes

            }
        })

        const newPet = new Pet(
            savedPet.id,
            savedPet.name,
            savedPet.race,
            savedPet.type,
            savedPet.owner_id,
            savedPet.birth_date,
            savedPet.size,
            savedPet.microchip_code,
            savedPet.sex,
            savedPet.has_passport,
            savedPet.country_of_origin,
            savedPet.passport_number,
            savedPet.notes
        );

        return newPet;
    }

    async delete(id: number): Promise<void> {
        await prisma.pet.delete({
            where: {
                id: id
            }
        })
    }
}