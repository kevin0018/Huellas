export const AppointmentReason = {
  VACCINATION: 'VACCINATION' as const,
  GENERAL_CHECKUP: 'GENERAL_CHECKUP' as const,
  DENTAL: 'DENTAL' as const,
  SURGERY: 'SURGERY' as const,
  OPERATION: 'OPERATION' as const,
  EMERGENCY: 'EMERGENCY' as const
};

export type AppointmentReason = typeof AppointmentReason[keyof typeof AppointmentReason];

export interface Appointment {
  id: number;
  petId: number;
  date: string; // ISO date string
  reason: AppointmentReason;
  notes?: string;
}

export interface CreateAppointmentRequest {
  petId: number;
  date: string;
  reason: AppointmentReason;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  date?: string;
  reason?: AppointmentReason;
  notes?: string;
}

// Helper functions for appointment reasons
export const getAppointmentReasonLabel = (reason: AppointmentReason): string => {
  switch (reason) {
    case AppointmentReason.VACCINATION:
      return 'Vacunación'; // TODO: Add to translation dictionary
    case AppointmentReason.GENERAL_CHECKUP:
      return 'Revisión general'; // TODO: Add to translation dictionary
    case AppointmentReason.DENTAL:
      return 'Dental'; // TODO: Add to translation dictionary
    case AppointmentReason.SURGERY:
      return 'Cirugía'; // TODO: Add to translation dictionary
    case AppointmentReason.OPERATION:
      return 'Operación'; // TODO: Add to translation dictionary
    case AppointmentReason.EMERGENCY:
      return 'Emergencia'; // TODO: Add to translation dictionary
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
    case AppointmentReason.DENTAL:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case AppointmentReason.SURGERY:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case AppointmentReason.OPERATION:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case AppointmentReason.EMERGENCY:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};
