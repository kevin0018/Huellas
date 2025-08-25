export class GetAppointmentByIdQuery {
  constructor(
    public readonly appointmentId: number,
    public readonly ownerId: number
  ) {}
}
