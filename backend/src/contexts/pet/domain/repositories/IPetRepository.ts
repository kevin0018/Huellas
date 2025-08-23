import { CreatePetRequest } from "../../app/CreatePetUseCase.js";
import { Pet } from "../entities/Pet.js";

export interface IPetRepository {
    findById(id: number): Promise<Pet | null>;
    save(pet: CreatePetRequest): Promise<Pet>;
    delete(id: number): Promise<void>;
}