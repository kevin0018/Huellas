import { Request, Response } from 'express';
import { RegisterOwnerCommand } from "../../app/commands/registerOwner/RegisterOwnerCommand.js";
import { RegisterOwnerCommandHandler } from "../../app/commands/registerOwner/RegisterOwnerCommandHandler.js";

export class RegisterOwnerController {
  constructor(private readonly commandHandler: RegisterOwnerCommandHandler) {}

  async handle(request: Request, response: Response): Promise<void> {
    try {
      const { id, name, lastName, email, password } = request.body;

      if (!id || !name || !lastName || !email || !password) {
        response.status(400).json({ 
          error: 'Missing required fields: id, name, lastName, email, password' 
        });
        return;
      }

      const command = new RegisterOwnerCommand(id, name, lastName, email, password);

      await this.commandHandler.execute(command);

      response.status(201).json({ 
        message: 'Owner registered successfully',
        data: { id, name, lastName, email }
      });

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          response.status(409).json({ error: error.message });
        } else {
          response.status(400).json({ error: error.message });
        }
      } else {
        response.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}