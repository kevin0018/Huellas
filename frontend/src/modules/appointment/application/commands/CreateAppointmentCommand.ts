import type { CreateAppointmentRequest, AppointmentReason } from '../../domain/Appointment.js';

export class CreateAppointmentCommand {
  public readonly petId: number;
  public readonly date: string;
  public readonly reason: string;
  public readonly notes?: string;

  constructor(
    petId: number,
    date: string,
    reason: string,
    notes?: string
  ) {
    this.petId = petId;
    this.date = date;
    this.reason = reason;
    this.notes = notes;
  }

  static fromRequest(request: CreateAppointmentRequest): CreateAppointmentCommand {
    return new CreateAppointmentCommand(
      request.petId,
      request.date,
      request.reason,
      request.notes
    );
  }

  toRequest(): CreateAppointmentRequest {
    return {
      petId: this.petId,
      date: this.date,
      reason: this.reason as AppointmentReason,
      notes: this.notes
    };
  }
}
