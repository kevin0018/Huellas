import { Response } from 'express';
import { AuthenticatedRequest } from '../../../auth/infra/middleware/JwtMiddleware.js';
import { CheckupAccessService } from '../../app/CheckupAccessService.js';

export class GetCheckupByIdController {
  private accessService: CheckupAccessService;

  constructor(accessService: CheckupAccessService) {
    this.accessService = accessService;
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      // Check access to the pet
      const userId = req.user.userId;

      const checkupId = parseInt(req.params.id);
      const { checkup } = await this.accessService.requireOwnedCheckup(checkupId, userId);

      return res.send(checkup);
    } catch {
      return res.status(404).send({ error: 'Resource not found' });
    }
  }
}
