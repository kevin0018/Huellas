import { Request, Response } from 'express';
import { ICheckupRepository } from '../../domain/repositories/ICheckupRepository.js';
import { IPetRepository } from '../../../pet/domain/repositories/IPetRepository.js';

export class DeleteCheckupController {
  private checkupRepository: ICheckupRepository;
  private petRepository: IPetRepository;

  constructor(checkupRepository: ICheckupRepository, petRepository: IPetRepository,) {
    this.checkupRepository = checkupRepository;
    this.petRepository = petRepository;
  }

  async handle(req: Request, res: Response) {
    try {
      const userId = req.user.userId;

      const checkupId = parseInt(req.params.id);
      const checkup = await this.checkupRepository.findById(checkupId);

      if (!checkup) {
        return res.status(404).send({ error: "This checkup does not exist" })
      }

      const petId = checkup?.getPetId() as number;
      const pet = await this.petRepository.findById(petId);
      const petOwnerId = pet?.getOwnerId() as number;

      if (petOwnerId !== userId) {
        return res.status(403).send({ error: "You cannot delete chekups for this pet" })
      }

      await this.checkupRepository.delete(checkupId);

      return res.status(204).send();
    } catch (error) {
      return res.status(500).send({ error: 'Internal server error' });
    }
  }
}