import type { PrismaClient } from '@prisma/client';
import type { IPetRepository } from '../../pet/domain/repositories/IPetRepository.js';
import type { IProcedureRepository } from '../domain/repositories/IProcedureRepository.js';
import { calculatePreventiveStatus } from './PreventivePlanCalculator.js';

export class GetPetProceduresStatusUseCase {
  constructor(
    private readonly procedures: IProcedureRepository,
    private readonly pets: IPetRepository,
    private readonly database: PrismaClient,
  ) {}

  async execute(petId: number) {
    const pet = await this.pets.findById(petId);
    if (!pet) throw new Error('Resource not found');
    const petType = pet.getType();
    const [petProcedures, rules, events] = await Promise.all([
      this.procedures.findByPetType(petType),
      this.database.procedureSchedule.findMany({ where: { animal_type: petType } }),
      this.database.healthEvent.findMany({ where: { pet_id: petId }, orderBy: { occurred_at: 'desc' } }),
    ]);

    return petProcedures.map((procedure) => {
      const rule = rules.find((candidate) => candidate.id === procedure.getId());
      if (!rule) throw new Error('Preventive rule not found');
      const matchingEvents = events.filter((event) =>
        event.type === rule.procedure_type && event.title.toLocaleLowerCase('es') === rule.procedure_name.toLocaleLowerCase('es'));
      const latest = matchingEvents[0] ?? null;
      return {
        ...procedure,
        ...calculatePreventiveStatus({
          birthDate: pet.getBirthDate(),
          startsAtAgeWeeks: rule.recommended_vaccines_age,
          recurrenceDays: rule.recurrence_days,
          lastOccurredAt: latest?.occurred_at ?? null,
          windowBeforeDays: rule.due_window_before_days,
          windowAfterDays: rule.due_window_after_days,
          now: new Date(),
        }),
        recurrenceDays: rule.recurrence_days,
        lastOccurredAt: latest?.occurred_at ?? null,
        source: rule.source,
        version: rule.version,
        region: rule.region,
      };
    });
  }
}
