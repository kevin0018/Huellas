import { CreateCheckupData, EditCheckupData } from "../../../../types/checkup.js";
import { Checkup } from "../../domain/entities/Checkup.js";
import { ICheckupRepository } from "../../domain/repositories/ICheckupRepository.js";
import { prisma } from '../../../../db/prisma.js';
import { HealthEventSource, HealthEventType } from '@prisma/client';

function inferHealthEventType(name: string): HealthEventType {
  const normalized = name.toLocaleLowerCase('es');
  if (normalized.includes('vacun')) return HealthEventType.VACCINATION;
  if (normalized.includes('test')) return HealthEventType.TEST;
  if (normalized.includes('chequeo') || normalized.includes('revisi')) return HealthEventType.GENERAL_CHECKUP;
  if (normalized.includes('paras')) return HealthEventType.TREATMENT;
  return HealthEventType.OTHER;
}

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
      where: {
        pet_id: petId
      },
      orderBy: {
        date: "desc"
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
    const editedCheckup = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.checkup.update({
        where: { id },
        data: { procedure_id: data.procedureId, date: data.date, notes: data.notes },
        include: { procedure: true, pet: true },
      });
      await transaction.healthEvent.upsert({
        where: { legacy_checkup_id: id },
        update: {
          type: inferHealthEventType(updated.procedure.procedure_name),
          occurred_at: updated.date,
          title: updated.procedure.procedure_name,
          notes: updated.notes,
        },
        create: {
          pet_id: updated.pet_id,
          type: inferHealthEventType(updated.procedure.procedure_name),
          occurred_at: updated.date,
          title: updated.procedure.procedure_name,
          notes: updated.notes,
          entered_by: updated.pet.owner_id,
          source: HealthEventSource.LEGACY_CHECKUP,
          legacy_checkup_id: updated.id,
        },
      });
      return updated;
    });

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
    await prisma.$transaction([
      prisma.healthEvent.deleteMany({ where: { legacy_checkup_id: id } }),
      prisma.checkup.delete({ where: { id } }),
    ]);
  }

  async save(data: CreateCheckupData): Promise<Checkup> {
    const savedCheckup = await prisma.$transaction(async (transaction) => {
      const saved = await transaction.checkup.create({
        data: { pet_id: data.petId, procedure_id: data.procedureId, date: data.date, notes: data.notes },
        include: { procedure: true, pet: true },
      });
      await transaction.healthEvent.create({
        data: {
          pet_id: saved.pet_id,
          type: inferHealthEventType(saved.procedure.procedure_name),
          occurred_at: saved.date,
          title: saved.procedure.procedure_name,
          notes: saved.notes,
          entered_by: saved.pet.owner_id,
          source: HealthEventSource.LEGACY_CHECKUP,
          legacy_checkup_id: saved.id,
        },
      });
      return saved;
    });

    const newCheckup = new Checkup(
      savedCheckup.id,
      savedCheckup.pet_id,
      savedCheckup.procedure_id,
      savedCheckup.date,
      savedCheckup.notes
    );

    return newCheckup;
  }

  async findByPetProcedure(petId: number, procedureId: number): Promise<Checkup | null> {
    const checkup = await prisma.checkup.findFirst({
      where: {
        pet_id: petId,
        procedure_id: procedureId
      }
    });

    if (!checkup) {
      return null;
    }

    return new Checkup(
      checkup.id,
      checkup.pet_id,
      checkup.procedure_id,
      checkup.date,
      checkup.notes
    );
  }
}
