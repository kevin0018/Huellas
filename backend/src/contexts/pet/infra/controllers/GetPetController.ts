import { Request, Response } from 'express';
import { PetRepository } from '../persistence/PetRepository.js';

export class GetPetController {
    async handle(req: Request, res: Response) {
        const petId = req.params.id;
        const parsedPetId = parseInt(petId);

        if (isNaN(parsedPetId)) {
            res.status(400).send({ error: "Id must be a number" });
            return
        }

        const repository = new PetRepository();

        const pet = await repository.findById(parsedPetId);

        if (!pet) {
            res.status(404).send({ error: "Pet not found" });
            return
        }

        res.send(pet);
    }
}