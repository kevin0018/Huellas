import { Request, Response } from 'express';
import { PetRepository } from '../persistence/PetRepository.js';
import { IPetRepository } from '../../domain/repositories/IPetRepository.js';

export class DeletePetController {
    private petRepository: IPetRepository;
    constructor(petRepository: IPetRepository) {
        this.petRepository = petRepository;
    }
    async handle(req: Request, res: Response) {
        const petId = req.params.id;
        const parsedPetId = parseInt(petId);

        if (isNaN(parsedPetId)) {
            return res.status(400).send({ error: 'Invalid pet ID' });
        }

        try {
            const petExists = await this.petRepository.findById(parsedPetId);

            if (!petExists) {
                return res.status(404).send({ error: 'Pet not found' });
            }

            await this.petRepository.delete(parsedPetId);
            return res.status(204)

        } catch (error) {
            return res.status(500).send({ error: 'Internal server error' });
        }
    }
}