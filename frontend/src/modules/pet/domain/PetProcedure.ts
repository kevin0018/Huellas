export type PetProcedure = {
  id: number;
  petType: 'cat' | 'dog' | 'ferret';
  name: string;
  age: number;
  description: string | null;
  status: 'DONE' | 'MISSING' | 'UPCOMING';
  checkupId?: number;
  checkupDate?: string;
  checkupNotes?: string;
  dueAt?: string | null;
  lastOccurredAt?: string | null;
  recurrenceDays?: number | null;
  explanation: string;
  source: string;
  version: string;
  region: string;
};
