import { PetType, PrismaClient } from "@prisma/client";
import { Procedure } from "../../domain/entities/Procedure.js";
import { IProcedureRepository } from "../../domain/repositories/IProcedureRepository.js";

const prisma = new PrismaClient();

export class ProcedureRepository implements IProcedureRepository {
  async findByPetType(type: PetType): Promise<Procedure[]> {
    const results = await prisma.procedureSchedule.findMany({
      where: {
        animal_type: type,
      },
      orderBy: {
        recommended_vaccines_age: "asc"
      }
    })

    console.log(results[0]);

    const procedures = results.map((item) => new Procedure(
      item.id,
      item.animal_type,
      item.procedure_name,
      item.recommended_vaccines_age,
      item.notes
    ))

    return procedures;
  }

  async findById(id: number): Promise<Procedure | null> {
    const procedure = await prisma.procedureSchedule.findUnique({
      where: { id: id },
    });

    if (!procedure) {
      return null
    }

    return new Procedure(
      procedure.id,
      procedure.animal_type,
      procedure.procedure_name,
      procedure.recommended_vaccines_age,
      procedure.notes
    );
  }
}