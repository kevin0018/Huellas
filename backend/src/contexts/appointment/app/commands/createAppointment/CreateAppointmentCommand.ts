import { AppointmentReason } from '../../../domain/entities/Appointment.js';

export class CreateAppointmentCommand {
  constructor(
    public readonly ownerId: number,
    public readonly petId: number,
    public readonly date: Date,
    public readonly reason: AppointmentReason,
    public readonly notes?: string
  ) {}
}
