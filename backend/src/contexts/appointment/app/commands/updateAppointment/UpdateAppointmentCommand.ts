import { AppointmentReason } from '../../../domain/entities/Appointment.js';

export class UpdateAppointmentCommand {
  constructor(
    public readonly appointmentId: number,
    public readonly ownerId: number,
    public readonly date?: Date,
    public readonly reason?: AppointmentReason,
    public readonly notes?: string
  ) {}
}
