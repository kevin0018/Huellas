export enum AppointmentReason {
  VACCINATION = 'VACCINATION',
  GENERAL_CHECKUP = 'GENERAL_CHECKUP',
  ANTI_PARASITIC_PRESCRIPTION = 'ANTI_PARASITIC_PRESCRIPTION',
  OPERATION = 'OPERATION',
  OTHERS = 'OTHERS'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export class Appointment {
  private constructor(
    private readonly _id: number,
    private readonly _petId: number,
    private readonly _date: Date,
    private readonly _reason: AppointmentReason,
    private readonly _notes: string | null = null,
    private readonly _status: AppointmentStatus = AppointmentStatus.SCHEDULED
  ) {}

  // Getters
  get id(): number {
    return this._id;
  }

  get petId(): number {
    return this._petId;
  }

  get date(): Date {
    return this._date;
  }

  get reason(): AppointmentReason {
    return this._reason;
  }

  get notes(): string | null {
    return this._notes;
  }

  get status(): AppointmentStatus {
    return this._status;
  }

  // Factory method for creating instances
  static create(
    id: number,
    petId: number,
    date: Date,
    reason: AppointmentReason,
    notes?: string | null,
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
  ): Appointment {
    // Domain validations
    if (id <= 0) {
      throw new Error('Appointment ID must be positive');
    }

    if (petId <= 0) {
      throw new Error('Pet ID must be positive');
    }

    if (!date) {
      throw new Error('Appointment date is required');
    }

    // Only validate future dates for new appointments (when ID is not set)
    if (id === 0 && date < new Date()) {
      throw new Error('Appointment date cannot be in the past');
    }

    if (!Object.values(AppointmentReason).includes(reason)) {
      throw new Error('Invalid appointment reason');
    }

    return new Appointment(id, petId, date, reason, notes ?? null, status);
  }

  // Factory method for existing appointments (from database)
  static fromDatabase(
    id: number,
    petId: number,
    date: Date,
    reason: AppointmentReason,
    notes?: string | null,
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
  ): Appointment {
    return new Appointment(id, petId, date, reason, notes ?? null, status);
  }
}
