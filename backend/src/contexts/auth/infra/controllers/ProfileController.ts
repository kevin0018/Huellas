import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/JwtMiddleware.js';
import { UpdateUserProfileCommand } from '../../app/commands/updateProfile/UpdateUserProfileCommand.js';
import { UpdateUserProfileCommandHandler } from '../../app/commands/updateProfile/UpdateUserProfileCommandHandler.js';
import { ChangePasswordCommand } from '../../app/commands/changePassword/ChangePasswordCommand.js';
import { ChangePasswordCommandHandler } from '../../app/commands/changePassword/ChangePasswordCommandHandler.js';
import { CreateVolunteerProfileCommand, DeleteVolunteerProfileCommand } from '../../app/commands/toggleVolunteer/VolunteerCommands.js';
import { CreateVolunteerProfileCommandHandler, DeleteVolunteerProfileCommandHandler } from '../../app/commands/toggleVolunteer/VolunteerCommandHandlers.js';
import { GetCurrentProfileQuery } from '../../app/queries/getCurrentProfile/GetCurrentProfileQuery.js';
import { GetCurrentProfileQueryHandler } from '../../app/queries/getCurrentProfile/GetCurrentProfileQueryHandler.js';

export class ProfileController {
  constructor(
    private readonly updateProfileHandler: UpdateUserProfileCommandHandler,
    private readonly changePasswordHandler: ChangePasswordCommandHandler,
    private readonly createVolunteerHandler: CreateVolunteerProfileCommandHandler,
    private readonly deleteVolunteerHandler: DeleteVolunteerProfileCommandHandler,
    private readonly getCurrentProfileHandler: GetCurrentProfileQueryHandler
  ) {}

  async getCurrentProfile(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const userId = request.user!.userId;
      
      const query = new GetCurrentProfileQuery(userId);
      const userProfile = await this.getCurrentProfileHandler.handle(query);
      
      if (!userProfile) {
        response.status(404).json({ error: 'User not found' });
        return;
      }

      response.status(200).json({
        user: userProfile
      });

    } catch (error) {
      console.error('Error getting current profile:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProfile(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const { name, lastName, email, description } = request.body;
      const userId = request.user!.userId;

      if (!name || !lastName || !email) {
        response.status(400).json({ 
          error: 'Missing required fields: name, lastName, email' 
        });
        return;
      }

      const command = new UpdateUserProfileCommand(userId, name, lastName, email, description);
      const updatedUser = await this.updateProfileHandler.handle(command);

      // Get full user info including description if volunteer using query
      const query = new GetCurrentProfileQuery(updatedUser.id);
      const userProfile = await this.getCurrentProfileHandler.handle(query);

      response.status(200).json({
        message: 'Profile updated successfully',
        user: userProfile
      });

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Email already exists')) {
          response.status(409).json({ error: 'Email already exists' });
        } else {
          response.status(400).json({ error: error.message });
        }
      } else {
        response.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async changePassword(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = request.body;
      const userId = request.user!.userId;

      if (!currentPassword || !newPassword) {
        response.status(400).json({ 
          error: 'Missing required fields: currentPassword, newPassword' 
        });
        return;
      }

      if (newPassword.length < 8) {
        response.status(400).json({ 
          error: 'New password must be at least 8 characters long' 
        });
        return;
      }

      const command = new ChangePasswordCommand(userId, currentPassword, newPassword);
      await this.changePasswordHandler.handle(command);

      response.status(200).json({
        message: 'Password changed successfully'
      });

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          response.status(401).json({ error: 'Current password is incorrect' });
        } else {
          response.status(400).json({ error: error.message });
        }
      } else {
        response.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async createVolunteerProfile(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const { description } = request.body;
      const userId = request.user!.userId;

      if (!description || description.trim().length === 0) {
        response.status(400).json({ 
          error: 'Description is required for volunteer profile' 
        });
        return;
      }

      const command = new CreateVolunteerProfileCommand(userId, description.trim());
      await this.createVolunteerHandler.handle(command);

      // Get updated user info including description using query
      const query = new GetCurrentProfileQuery(userId);
      const userProfile = await this.getCurrentProfileHandler.handle(query);

      response.status(201).json({
        message: 'Volunteer profile created successfully',
        user: userProfile
      });

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already has a volunteer profile')) {
          response.status(409).json({ error: 'User already has a volunteer profile' });
        } else {
          response.status(400).json({ error: error.message });
        }
      } else {
        response.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteVolunteerProfile(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const userId = request.user!.userId;

      const command = new DeleteVolunteerProfileCommand(userId);
      await this.deleteVolunteerHandler.handle(command);

      // Get updated user info using query
      const query = new GetCurrentProfileQuery(userId);
      const userProfile = await this.getCurrentProfileHandler.handle(query);

      response.status(200).json({
        message: 'Volunteer profile deleted successfully',
        user: userProfile
      });

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('does not have a volunteer profile')) {
          response.status(404).json({ error: 'User does not have a volunteer profile' });
        } else {
          response.status(400).json({ error: error.message });
        }
      } else {
        response.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
