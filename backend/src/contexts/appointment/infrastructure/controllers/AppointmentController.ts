import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaAppointmentRepository } from '../persistence/PrismaAppointmentRepository.js';
import { CreateAppointmentCommandHandler } from '../../app/commands/createAppointment/CreateAppointmentCommandHandler.js';
import { CreateAppointmentCommand } from '../../app/commands/createAppointment/CreateAppointmentCommand.js';
import { UpdateAppointmentCommandHandler } from '../../app/commands/updateAppointment/UpdateAppointmentCommandHandler.js';
import { UpdateAppointmentCommand } from '../../app/commands/updateAppointment/UpdateAppointmentCommand.js';
import { DeleteAppointmentCommandHandler } from '../../app/commands/deleteAppointment/DeleteAppointmentCommandHandler.js';
import { DeleteAppointmentCommand } from '../../app/commands/deleteAppointment/DeleteAppointmentCommand.js';
import { GetAppointmentsByOwnerQueryHandler } from '../../app/queries/getAppointmentsByOwner/GetAppointmentsByOwnerQueryHandler.js';
import { GetAppointmentsByOwnerQuery } from '../../app/queries/getAppointmentsByOwner/GetAppointmentsByOwnerQuery.js';
import { GetAppointmentByIdQueryHandler } from '../../app/queries/getAppointmentById/GetAppointmentByIdQueryHandler.js';
import { GetAppointmentByIdQuery } from '../../app/queries/getAppointmentById/GetAppointmentByIdQuery.js';
import { AppointmentReason } from '../../domain/entities/Appointment.js';

export class AppointmentController {
  private readonly appointmentRepository: PrismaAppointmentRepository;
  private readonly createAppointmentHandler: CreateAppointmentCommandHandler;
  private readonly updateAppointmentHandler: UpdateAppointmentCommandHandler;
  private readonly deleteAppointmentHandler: DeleteAppointmentCommandHandler;
  private readonly getAppointmentsByOwnerHandler: GetAppointmentsByOwnerQueryHandler;
  private readonly getAppointmentByIdHandler: GetAppointmentByIdQueryHandler;

  constructor(prisma: PrismaClient) {
    this.appointmentRepository = new PrismaAppointmentRepository(prisma);
    this.createAppointmentHandler = new CreateAppointmentCommandHandler(this.appointmentRepository);
    this.updateAppointmentHandler = new UpdateAppointmentCommandHandler(this.appointmentRepository);
    this.deleteAppointmentHandler = new DeleteAppointmentCommandHandler(this.appointmentRepository);
    this.getAppointmentsByOwnerHandler = new GetAppointmentsByOwnerQueryHandler(this.appointmentRepository);
    this.getAppointmentByIdHandler = new GetAppointmentByIdQueryHandler(this.appointmentRepository);
  }

  async createAppointment(req: Request, res: Response): Promise<void> {
    console.log('createAppointment req.user:', req.user);
    console.log('createAppointment req.body:', req.body);
    try {
      const ownerId = req.user?.userId;
      if (!ownerId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { petId, date, reason, notes } = req.body;

      if (!petId || !date || !reason) {
        res.status(400).json({ error: 'Pet ID, date, and reason are required' });
        return;
      }

      if (!Object.values(AppointmentReason).includes(reason)) {
        res.status(400).json({ error: 'Invalid appointment reason' });
        return;
      }

      const command = new CreateAppointmentCommand(
        ownerId,
        parseInt(petId),
        new Date(date),
        reason as AppointmentReason,
        notes
      );

      const appointment = await this.createAppointmentHandler.handle(command);
      
      res.status(201).json({
        id: appointment.id,
        petId: appointment.petId,
        date: appointment.date,
        reason: appointment.reason,
        notes: appointment.notes
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to create appointment' 
      });
    }
  }

  async updateAppointment(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.userId;
      if (!ownerId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const appointmentId = parseInt(req.params.id);
      const { date, reason, notes } = req.body;

      if (reason && !Object.values(AppointmentReason).includes(reason)) {
        res.status(400).json({ error: 'Invalid appointment reason' });
        return;
      }

      const command = new UpdateAppointmentCommand(
        appointmentId,
        ownerId,
        date ? new Date(date) : undefined,
        reason as AppointmentReason | undefined,
        notes
      );

      const appointment = await this.updateAppointmentHandler.handle(command);
      
      res.json({
        id: appointment.id,
        petId: appointment.petId,
        date: appointment.date,
        reason: appointment.reason,
        notes: appointment.notes
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      if (error instanceof Error && error.message.includes('not found or access denied')) {
        res.status(404).json({ error: 'Appointment not found or access denied' });
      } else {
        res.status(400).json({ 
          error: error instanceof Error ? error.message : 'Failed to update appointment' 
        });
      }
    }
  }

  async deleteAppointment(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.userId;
      if (!ownerId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const appointmentId = parseInt(req.params.id);

      const command = new DeleteAppointmentCommand(appointmentId, ownerId);
      await this.deleteAppointmentHandler.handle(command);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      if (error instanceof Error && error.message.includes('not found or access denied')) {
        res.status(404).json({ error: 'Appointment not found or access denied' });
      } else {
        res.status(400).json({ 
          error: error instanceof Error ? error.message : 'Failed to delete appointment' 
        });
      }
    }
  }

  async getAppointmentsByOwner(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.userId;
      if (!ownerId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const query = new GetAppointmentsByOwnerQuery(ownerId);
      const appointments = await this.getAppointmentsByOwnerHandler.handle(query);
      
      res.json(appointments.map((appointment) => ({
        id: appointment.id,
        petId: appointment.petId,
        date: appointment.date,
        reason: appointment.reason,
        notes: appointment.notes
      })));
    } catch (error) {
      console.error('Error getting appointments:', error);
      res.status(500).json({ error: 'Failed to get appointments' });
    }
  }

  async getAppointmentById(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.userId;
      if (!ownerId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const appointmentId = parseInt(req.params.id);

      const query = new GetAppointmentByIdQuery(appointmentId, ownerId);
      const appointment = await this.getAppointmentByIdHandler.handle(query);
      
      if (!appointment) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
      }

      res.json({
        id: appointment.id,
        petId: appointment.petId,
        date: appointment.date,
        reason: appointment.reason,
        notes: appointment.notes
      });
    } catch (error) {
      console.error('Error getting appointment:', error);
      res.status(500).json({ error: 'Failed to get appointment' });
    }
  }
}
