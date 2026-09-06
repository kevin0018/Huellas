import type { TranslatorContextValue } from '../../i18n/TranslatorContext';

export function procedureRecurrenceLabel(
  days: number | null | undefined,
  translate: TranslatorContextValue['translate'],
): string {
  if (!days) return translate('noRecurrence');
  if (days === 365) return translate('recurrenceYear');
  if (days === 30) return translate('recurrenceMonth');
  if (days % 365 === 0) return translate('recurrenceYears', { count: days / 365 });
  if (days % 7 === 0) return translate(days === 7 ? 'recurrenceWeek' : 'recurrenceWeeks', { count: days / 7 });
  return translate(days === 1 ? 'recurrenceDay' : 'recurrenceDays', { count: days });
}
