import { CreatePetRequest, EditPetRequest } from "../../../../types/pet.js";
import { Pet } from "../../domain/entities/Pet.js";
import { IPetRepository } from "../../domain/repositories/IPetRepository.js";
import { prisma } from '../../../../db/prisma.js';

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
        race: pet.race ?? null,
        type: pet.type,
        owner_id: pet.ownerId,
        birth_date: pet.birthDate,
        size: pet.size,
        microchip_code: pet.microchipCode ?? null,
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

  async update(id: number, data: EditPetRequest): Promise<Pet> {
    const editedPet = await prisma.pet.update({
      where: {
        id: id
      },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.race !== undefined && { race: data.race }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.birthDate !== undefined && { birth_date: data.birthDate }),
        ...(data.size !== undefined && { size: data.size }),
        ...(data.microchipCode !== undefined && { microchip_code: data.microchipCode }),
        ...(data.sex !== undefined && { sex: data.sex }),
        ...(data.hasPassport !== undefined && { has_passport: data.hasPassport }),
        ...(data.countryOfOrigin !== undefined && { country_of_origin: data.countryOfOrigin }),
        ...(data.passportNumber !== undefined && { passport_number: data.passportNumber }),
        ...(data.notes !== undefined && { notes: data.notes })
      },
    })

    const pet = new Pet(
      editedPet.id,
      editedPet.name,
      editedPet.race,
      editedPet.type,
      editedPet.owner_id,
      editedPet.birth_date,
      editedPet.size,
      editedPet.microchip_code,
      editedPet.sex,
      editedPet.has_passport,
      editedPet.country_of_origin,
      editedPet.passport_number,
      editedPet.notes
    )

    return pet;
  }

  async findByOwnerId(ownerId: number): Promise<Pet[]> {
    const results = await prisma.pet.findMany({
      where: {
        owner_id: ownerId
      }
    });

    const pets = results.map((item) => new Pet(
      item.id,
      item.name,
      item.race,
      item.type,
      item.owner_id,
      item.birth_date,
      item.size,
      item.microchip_code,
      item.sex,
      item.has_passport,
      item.country_of_origin,
      item.passport_number,
      item.notes
    ))

    return pets;
  }
}
