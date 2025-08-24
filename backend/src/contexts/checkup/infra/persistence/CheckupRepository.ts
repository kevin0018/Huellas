import { CreateCheckupData, EditCheckupData } from "../../../../types/checkup.js";
import { Checkup } from "../../domain/entities/Checkup.js";
import { ICheckupRepository } from "../../domain/repositories/ICheckupRepository.js";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CheckupRepository implements ICheckupRepository {
  async findById(id: number): Promise<Checkup | null> {
    const checkup = await prisma.checkup.findUnique({
      where: { id: id },
    });

    if (!checkup) {
      return null
    }

    return new Checkup(
      checkup.id,
      checkup.pet_id,
      checkup.procedure_id,
      checkup.date,
      checkup.notes
    );
  }

  async findByPetId(petId: number): Promise<Checkup[]> {
    const results = await prisma.checkup.findMany({
      where:{
        pet_id: petId
      }
    });

    const petCheckups = results.map((item) => new Checkup(
      item.id,
      item.pet_id,
      item.procedure_id,
      item.date,
      item.notes
    ))

    return petCheckups;
  }

  async update(id: number, data: EditCheckupData): Promise<Checkup> {
    const editedCheckup = await prisma.checkup.update({
      where: {
        id: id
      },
      data: {
        procedure_id: data.procedureId,
        date: data.date,
        notes: data.notes        
      },
    })

    const checkup = new Checkup(
      editedCheckup.id,
      editedCheckup.pet_id,
      editedCheckup.procedure_id,
      editedCheckup.date,
      editedCheckup.notes
    )

    return checkup;
  }

  async delete(id: number): Promise<void> {
    await prisma.checkup.delete({
      where:{
        id: id
      }
    })
  }

  async save(data: CreateCheckupData): Promise<Checkup> {
    const savedCheckup = await prisma.checkup.create({
      data: {
        pet_id: data.petId,
        procedure_id: data.procedureId,
        date: data.date,
        notes: data.notes
      }
    })

    const newCheckup = new Checkup(
      savedCheckup.id,
      savedCheckup.pet_id,
      savedCheckup.procedure_id,
      savedCheckup.date,
      savedCheckup.notes
    );

    return newCheckup;
  }
}