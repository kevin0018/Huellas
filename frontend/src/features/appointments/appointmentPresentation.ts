import type { TranslationKey } from '../../i18n/dictionary';
import { AppointmentReason, AppointmentStatus } from '../../modules/appointment/domain/Appointment';

export const appointmentReasonTranslationKeys: Record<AppointmentReason, TranslationKey> = {
  [AppointmentReason.VACCINATION]: 'appointmentReasonVaccination',
  [AppointmentReason.GENERAL_CHECKUP]: 'appointmentReasonGeneralCheckup',
  [AppointmentReason.ANTI_PARASITIC_PRESCRIPTION]: 'appointmentReasonAntiparasitic',
  [AppointmentReason.OPERATION]: 'appointmentReasonOperation',
  [AppointmentReason.OTHERS]: 'appointmentReasonOther',
};

export const appointmentStatusTranslationKeys: Record<AppointmentStatus, TranslationKey> = {
  [AppointmentStatus.SCHEDULED]: 'appointmentStatusScheduled',
  [AppointmentStatus.COMPLETED]: 'appointmentStatusCompleted',
  [AppointmentStatus.CANCELLED]: 'appointmentStatusCancelled',
  [AppointmentStatus.NO_SHOW]: 'appointmentStatusNoShow',
};
