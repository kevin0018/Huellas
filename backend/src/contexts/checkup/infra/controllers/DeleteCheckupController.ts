import { Response } from 'express';
import { ICheckupRepository } from '../../domain/repositories/ICheckupRepository.js';
import { AuthenticatedRequest } from '../../../auth/infra/middleware/JwtMiddleware.js';
import { CheckupAccessService } from '../../app/CheckupAccessService.js';

export class DeleteCheckupController {
  private checkupRepository: ICheckupRepository;
  private accessService: CheckupAccessService;

  constructor(checkupRepository: ICheckupRepository, accessService: CheckupAccessService) {
    this.checkupRepository = checkupRepository;
    this.accessService = accessService;
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.userId;

      const checkupId = parseInt(req.params.id);
      await this.accessService.requireOwnedCheckup(checkupId, userId);

      await this.checkupRepository.delete(checkupId);

      return res.status(204).send();
    } catch {
      return res.status(404).send({ error: 'Resource not found' });
    }
  }
}
