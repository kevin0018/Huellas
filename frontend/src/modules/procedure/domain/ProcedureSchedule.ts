export interface ProcedureScheduleProps {
  id: number;
  // Translation keys (match your i18n: innerdes, innerdestext, etc.)
  i18nKey: string;       // e.g., "innerdes"
  i18nTextKey: string;   // e.g., "innerdestext"
  fromWeeks: number;     // e.g., 0
  toWeeks?: number | null; // e.g., 2 (nullable => exact week)
}

export class ProcedureSchedule {
  readonly id: number;
  readonly i18nKey: string;
  readonly i18nTextKey: string;
  readonly fromWeeks: number;
  readonly toWeeks: number | null;

  private constructor(p: ProcedureScheduleProps) {
    this.id = p.id;
    this.i18nKey = p.i18nKey;
    this.i18nTextKey = p.i18nTextKey;
    this.fromWeeks = p.fromWeeks;
    this.toWeeks = p.toWeeks ?? null;
  }

  static create(p: ProcedureScheduleProps): ProcedureSchedule {
    return new ProcedureSchedule(p);
  }
}
