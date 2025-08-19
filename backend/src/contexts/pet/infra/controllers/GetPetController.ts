import { Request, Response } from 'express';
import { PetRepository } from '../persistence/PetRepository.js';
import { IPetRepository } from '../../domain/repositories/IPetRepository.js';

export class GetPetController {
    private petRepository: IPetRepository;

    constructor(petRepository: IPetRepository) {
        this.petRepository = petRepository;
    }

    async handle(req: Request, res: Response) {
        const petId = req.params.id;
        const parsedPetId = parseInt(petId);

        if (isNaN(parsedPetId)) {
            res.status(400).send({ error: "Id must be a number" });
            return
        }

        try {
            const pet = await this.petRepository.findById(parsedPetId);

            if (!pet) {
                res.status(404).send({ error: "Pet not found" });
                return
            }

            res.send(pet);
        } catch (error) {
            return res.status(500).send({ error: 'Internal server error' });
        }
    }
}