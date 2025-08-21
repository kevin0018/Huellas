import { Request, Response } from 'express';
import { IPetRepository } from '../../domain/repositories/IPetRepository.js';

export class GetPetController {
    private petRepository: IPetRepository;

    constructor(petRepository: IPetRepository) {
        this.petRepository = petRepository;
    }

    async handle(req: Request, res: Response) {
        const petId = req.params.id;

        try {
            const pet = await this.petRepository.findById(parseInt(petId));

            return res.send(pet);
        } catch (error) {
            return res.status(500).send({ error: 'Internal server error' });
        }
    }
}