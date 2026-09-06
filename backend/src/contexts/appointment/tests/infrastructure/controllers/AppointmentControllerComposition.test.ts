import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { Appointment, AppointmentReason, AppointmentStatus } from '../../../domain/entities/Appointment.js';
import {
  AppointmentController,
  type AppointmentControllerDependencies,
} from '../../../infrastructure/controllers/AppointmentController.js';

describe('AppointmentController composition', () => {
  it('delegates application work and reminder synchronization to injected dependencies', async () => {
    const appointment = Appointment.fromDatabase(
      7,
      3,
      new Date('2030-04-10T10:00:00.000Z'),
      AppointmentReason.GENERAL_CHECKUP,
      null,
      AppointmentStatus.COMPLETED,
    );
    const updateAppointment = { handle: vi.fn().mockResolvedValue(appointment) };
    const synchronizeReminder = vi.fn().mockResolvedValue(undefined);
    const dependencies = {
      updateAppointment,
      synchronizeReminder,
    } as unknown as AppointmentControllerDependencies;
    const controller = new AppointmentController(dependencies);
    const request = {
      params: { id: '7' },
      body: { status: AppointmentStatus.COMPLETED },
      user: { userId: 11 },
    } as unknown as Request;
    const response = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await controller.updateAppointment(request, response);

    expect(updateAppointment.handle).toHaveBeenCalledOnce();
    expect(synchronizeReminder).toHaveBeenCalledWith(7, AppointmentStatus.COMPLETED);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ id: 7, status: 'completed' }));
  });
});
