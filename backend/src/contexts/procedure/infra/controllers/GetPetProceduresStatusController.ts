import { Response } from "express";
import { IProcedureRepository } from "../../domain/repositories/IProcedureRepository.js";
import { IPetRepository } from "../../../pet/domain/repositories/IPetRepository.js";
import { AuthenticatedRequest } from "../../../auth/infra/middleware/JwtMiddleware.js";
import { Pet } from "../../../pet/domain/entities/Pet.js";
import { prisma } from '../../../../db/prisma.js';
import { calculatePreventiveStatus } from '../../app/PreventivePlanCalculator.js';

export class GetPetProceduresStatusController {
  private procedureRepository: IProcedureRepository;
  private petRepository: IPetRepository;

  constructor(
    procedureRepository: IProcedureRepository,
    petRepository: IPetRepository) {

    this.procedureRepository = procedureRepository;
    this.petRepository = petRepository;
  }

  async handle(req: AuthenticatedRequest, res: Response) {
    try {
      const petId = parseInt(req.params.id);
      const pet = await this.petRepository.findById(petId) as Pet;

      const petType = pet.getType();
      const petBirthdate = pet.getBirthDate();

      const petProcedures = await this.procedureRepository.findByPetType(petType);
      const rules = await prisma.procedureSchedule.findMany({ where: { animal_type: petType } });
      const events = await prisma.healthEvent.findMany({ where: { pet_id: petId }, orderBy: { occurred_at: 'desc' } });

      const proceduresWithStatus = petProcedures.map((procedure) => {
        const rule = rules.find((candidate) => candidate.id === procedure.getId());
        if (!rule) throw new Error('Preventive rule not found');
        const matchingEvents = events.filter((event) =>
          event.type === rule.procedure_type && event.title.toLocaleLowerCase('es') === rule.procedure_name.toLocaleLowerCase('es'));
        const latest = matchingEvents[0] ?? null;
        const calculated = calculatePreventiveStatus({
          birthDate: petBirthdate,
          startsAtAgeWeeks: rule.recommended_vaccines_age,
          recurrenceDays: rule.recurrence_days,
          lastOccurredAt: latest?.occurred_at ?? null,
          windowBeforeDays: rule.due_window_before_days,
          windowAfterDays: rule.due_window_after_days,
          now: new Date(),
        });
        return {
          ...procedure,
          ...calculated,
          recurrenceDays: rule.recurrence_days,
          lastOccurredAt: latest?.occurred_at ?? null,
          source: rule.source,
          version: rule.version,
          region: rule.region,
        };
      });

      return res.status(200).send(proceduresWithStatus);
    } catch (error) {
      return res.status(400).send({ error: (error as Error).message });
    }
  }
}
