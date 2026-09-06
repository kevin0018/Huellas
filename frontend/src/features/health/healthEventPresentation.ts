import type { TranslationKey } from '../../i18n/dictionary';
import type { HealthEvent, HealthEventType } from '../../modules/health/HealthEvent';

export const healthEventTranslationKeys: Record<HealthEventType, TranslationKey> = {
  VACCINATION: 'healthEventVaccination',
  GENERAL_CHECKUP: 'healthEventGeneralCheckup',
  MEDICATION: 'healthEventMedication',
  TREATMENT: 'healthEventTreatment',
  TEST: 'healthEventTest',
  SURGERY: 'healthEventSurgery',
  WEIGHT: 'healthEventWeight',
  OTHER: 'healthEventOther',
};

export const healthSummaryOptions = [
  ['identity', 'healthSummaryIdentity'],
  ['critical', 'healthSummaryCritical'],
  ['vaccinations', 'healthSummaryVaccinations'],
  ['events', 'healthSummaryEvents'],
] as const satisfies readonly (readonly [string, TranslationKey])[];

export function healthEventEditRestrictionKey(event: HealthEvent): TranslationKey | null {
  if (event.verification === 'VERIFIED') return 'healthRestrictionVerified';
  if (event.source === 'APPOINTMENT') return 'healthRestrictionAppointment';
  if (event.source === 'LEGACY_CHECKUP') return 'healthRestrictionImported';
  return null;
}
