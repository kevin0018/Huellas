import { Request, Response } from 'express';
import { IPetRepository } from '../../domain/repositories/IPetRepository.js';

export class DeletePetController {
  private petRepository: IPetRepository;

  constructor(petRepository: IPetRepository) {
    this.petRepository = petRepository;
  }

  async handle(req: Request, res: Response) {
    const petId = parseInt(req.params.id);

    try {
      await this.petRepository.delete(petId);

      return res.status(204).send();
    } catch (error) {
      return res.status(500).send({ error: 'Internal server error' });
    }
  }
}