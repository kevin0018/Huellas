export type EditCheckupData = {
  procedureId?: number;
  date?: string;
  notes?: string | null;
}

export type CreateCheckupData = {
  petId: number;
  procedureId: number;
  date: string;
  notes: string | null;
}
