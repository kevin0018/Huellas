import { Request, Response } from 'express';
import { DeleteVolunteerCommand } from '../../app/commands/delete/DeleteVolunteerCommand.js';
import { DeleteVolunteerCommandHandler } from '../../app/commands/delete/DeleteVolunteerCommandHandler.js';
import { PrismaVolunteerRepository } from '../persistence/PrismaVolunteerRepository.js';

export class DeleteVolunteerController {
  private commandHandler: DeleteVolunteerCommandHandler;

  constructor() {
    const volunteerRepository = new PrismaVolunteerRepository();
    this.commandHandler = new DeleteVolunteerCommandHandler(volunteerRepository);
  }

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const volunteerId = parseInt(req.params.id);
      const requestingUserId = (req as any).user?.id;
      if (!requestingUserId) {
        res.status(401).json({
          error: 'Authentication required'
        });
        return;
      }

      if (isNaN(volunteerId)) {
        res.status(400).json({
          error: 'Invalid volunteer ID'
        });
        return;
      }

      const command = new DeleteVolunteerCommand(volunteerId, requestingUserId);
      const result = await this.commandHandler.execute(command);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Volunteer not found' ? 404 : 400;
      res.status(statusCode).json({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}
