export interface CheckupProps {
  id?: number;
  petId: number;
  procedureId: number;
  date: Date;
  notes?: string | null;
}

export class Checkup {
  readonly id?: number;
  readonly petId: number;
  readonly procedureId: number;
  readonly date: Date;
  readonly notes: string | null;

  private constructor(p: CheckupProps) {
    this.id = p.id;
    this.petId = p.petId;
    this.procedureId = p.procedureId;
    this.date = p.date;
    this.notes = p.notes ?? null;
  }

  static create(p: CheckupProps): Checkup {
    const date = p.date instanceof Date ? p.date : new Date(p.date);
    return new Checkup({ ...p, date });
  }
}