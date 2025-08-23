import { CreatePetRequest, EditPetRequest } from "../../../../types/pet.js";
import { Pet } from "../entities/Pet.js";

export interface IPetRepository {
    findById(id: number): Promise<Pet | null>;
    save(pet: CreatePetRequest): Promise<Pet>;
    delete(id: number): Promise<void>;
    update(id: number, data: EditPetRequest): Promise<Pet>;
    findByOwnerId(ownerId: number): Promise<Pet[]>;
}
