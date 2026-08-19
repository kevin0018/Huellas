export const healthEventTypes = [
  'VACCINATION',
  'GENERAL_CHECKUP',
  'MEDICATION',
  'TREATMENT',
  'TEST',
  'SURGERY',
  'WEIGHT',
  'OTHER',
] as const;

export type HealthEventType = typeof healthEventTypes[number];

export const healthEventLabels: Record<HealthEventType, string> = {
  VACCINATION: 'Vacuna',
  GENERAL_CHECKUP: 'Visita general',
  MEDICATION: 'Medicación',
  TREATMENT: 'Tratamiento',
  TEST: 'Prueba',
  SURGERY: 'Cirugía',
  WEIGHT: 'Peso',
  OTHER: 'Otro',
};

export interface HealthEvent {
  id: number;
  petId: number;
  type: HealthEventType;
  occurredAt: string;
  title: string;
  notes: string | null;
  provider: string | null;
  result: string | null;
  dose: string | null;
  lotNumber: string | null;
  expiresAt: string | null;
  verification: 'OWNER_REPORTED' | 'VERIFIED';
  source: 'OWNER' | 'LEGACY_CHECKUP' | 'APPOINTMENT';
  attachments: HealthDocument[];
}

export interface HealthDocument {
  id: number;
  petId: number;
  healthEventId: number | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export type HealthEventDraft = Omit<HealthEvent, 'id' | 'petId' | 'verification' | 'source' | 'attachments'>;
