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

// Helper functions for appointment reasons
export const getAppointmentReasonLabel = (reason: AppointmentReason): string => {
  switch (reason) {
    case AppointmentReason.VACCINATION:
      return 'Vacunación'; // TODO: Add to translation dictionary
    case AppointmentReason.GENERAL_CHECKUP:
      return 'Revisión general'; // TODO: Add to translation dictionary
    case AppointmentReason.ANTI_PARASITIC_PRESCRIPTION:
      return 'Tratamiento antiparasitario';
    case AppointmentReason.OPERATION:
      return 'Operación'; // TODO: Add to translation dictionary
    case AppointmentReason.OTHERS:
      return 'Otros';
    default:
      return reason;
  }
};

export const getAppointmentReasonColor = (reason: AppointmentReason): string => {
  switch (reason) {
    case AppointmentReason.VACCINATION:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case AppointmentReason.GENERAL_CHECKUP:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case AppointmentReason.ANTI_PARASITIC_PRESCRIPTION:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case AppointmentReason.OPERATION:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case AppointmentReason.OTHERS:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getAppointmentStatusLabel = (status: AppointmentStatus): string => ({
  scheduled: 'Programada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
})[status];
