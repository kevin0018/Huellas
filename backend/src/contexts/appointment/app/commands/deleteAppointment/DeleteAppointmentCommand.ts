export class DeleteAppointmentCommand {
  constructor(
    public readonly appointmentId: number,
    public readonly ownerId: number
  ) {}
}
