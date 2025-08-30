import { CreatePetRequest, EditPetRequest } from "../../../../types/pet.js";
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

  async update(id: number, data: EditPetRequest): Promise<Pet> {
    const editData: EditPetRequest = {};

    if (data.name !== undefined) editData.name = data.name;
    if (data.race !== undefined) editData.race = data.race;
    if (data.birthDate !== undefined) editData.birthDate = data.birthDate;
    if (data.size !== undefined) editData.size = data.size;
    if (data.sex !== undefined) editData.sex = data.sex;
    if (data.hasPassport !== undefined) editData.hasPassport = data.hasPassport;
    if (data.countryOfOrigin !== undefined) editData.countryOfOrigin = data.countryOfOrigin;
    if (data.passportNumber !== undefined) editData.passportNumber = data.passportNumber;
    if (data.notes !== undefined) editData.notes = data.notes;

    const editedPet = await prisma.pet.update({
      where: {
        id: id
      },
      data: {
        name: data.name,
        race: data.race,
        birth_date: data.birthDate,
        size: data.size,
        sex: data.sex,
        has_passport: data.hasPassport,
        country_of_origin: data.countryOfOrigin,
        passport_number: data.passportNumber,
        notes: data.notes
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