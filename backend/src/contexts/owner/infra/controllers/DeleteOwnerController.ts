import { Response } from 'express';
import { DeleteOwnerCommand } from '../../app/commands/delete/DeleteOwnerCommand.js';
import { DeleteOwnerCommandHandler } from '../../app/commands/delete/DeleteOwnerCommandHandler.js';
import { AuthenticatedRequest } from '../../../auth/infra/middleware/JwtMiddleware.js';

export class DeleteOwnerController {
  constructor(private readonly commandHandler: DeleteOwnerCommandHandler) {}

  async handle(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const ownerId = parseInt(request.params.id);
      const requestingUserId = request.user!.userId;

      if (isNaN(ownerId)) {
        response.status(400).json({ 
          error: 'Invalid owner ID' 
        });
        return;
      }

      const command = new DeleteOwnerCommand(ownerId, requestingUserId);

      const result = await this.commandHandler.execute(command);

      response.status(200).json(result);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          response.status(404).json({ error: error.message });
        } else if (error.message.includes('can only delete your own')) {
          response.status(403).json({ error: error.message });
        } else {
          response.status(400).json({ error: error.message });
        }
      } else {
        response.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
