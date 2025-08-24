import { PetType } from "@prisma/client";
import { Procedure } from "../entities/Procedure.js";

export interface IProcedureRepository{
    findByPetType(type: PetType): Promise<Procedure[]>
    findById(id: number): Promise<Procedure | null>
}