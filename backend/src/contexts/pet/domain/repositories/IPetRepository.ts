import { Pet } from "../entities/Pet.js";

export interface IPetRepository {
    findById(id: number): Promise<Pet | null>;
    save(pet: Pet): Promise<Pet>;
    delete(id: number): Promise<void>;
}