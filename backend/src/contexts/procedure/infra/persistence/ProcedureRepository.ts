import { PetType, PrismaClient } from "@prisma/client";
import { Procedure } from "../../domain/entities/Procedure.js";
import { IProcedureRepository } from "../../domain/repository/IProcedureRepository.js";

const prisma = new PrismaClient();

export class ProcedureRepository implements IProcedureRepository {
  async findByPetType(type: PetType): Promise<Procedure[]> {
    const results = await prisma.procedureSchedule.findMany({
      where:{
        animal_type: type
      },
      orderBy:{
        recommended_vaccines_age: "asc"
      }
    })

    const procedures = results.map((item) => new Procedure(
      item.id,
      item.animal_type,
      item.procedure_name,
      item.recommended_vaccines_age,
      item.notes
    ))

    return procedures;
  }
}