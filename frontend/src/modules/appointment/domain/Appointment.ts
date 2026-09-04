export const AppointmentReason = {
  VACCINATION: 'VACCINATION' as const,
  GENERAL_CHECKUP: 'GENERAL_CHECKUP' as const,
  ANTI_PARASITIC_PRESCRIPTION: 'ANTI_PARASITIC_PRESCRIPTION' as const,
  OPERATION: 'OPERATION' as const,
  OTHERS: 'OTHERS' as const
};

export type AppointmentReason = typeof AppointmentReason[keyof typeof AppointmentReason];

export const AppointmentStatus = {
  SCHEDULED: 'scheduled' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  NO_SHOW: 'no_show' as const,
};

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export interface Appointment {
  id: number;
  petId: number;
  date: string; // ISO date string
  reason: AppointmentReason;
  status: AppointmentStatus;
  notes?: string | null;
}

export interface CreateAppointmentRequest {
  petId: number;
  date: string;
  reason: AppointmentReason;
  notes?: string | null;
}

export interface UpdateAppointmentRequest {
  date?: string;
  reason?: AppointmentReason;
  status?: AppointmentStatus;
  notes?: string | null;
}
