import { Request, Response } from 'express';
import { RegisterVolunteerCommand } from '../../app/commands/register/RegisterVolunteerCommand.js';
import { RegisterVolunteerCommandHandler } from '../../app/commands/register/RegisterVolunteerCommandHandler.js';
import { PrismaVolunteerRepository } from '../persistence/PrismaVolunteerRepository.js';

export class RegisterVolunteerController {
  private commandHandler: RegisterVolunteerCommandHandler;

  constructor() {
    const volunteerRepository = new PrismaVolunteerRepository();
    this.commandHandler = new RegisterVolunteerCommandHandler(volunteerRepository);
  }

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { name, lastName, email, password, description } = req.body;

      // Validate required fields
      if (!name || !lastName || !email || !password || !description) {
        res.status(400).json({
          error: 'All fields are required: name, lastName, email, password, description'
        });
        return;
      }

      const command = new RegisterVolunteerCommand(name, lastName, email, password, description);
      const result = await this.commandHandler.execute(command);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}
