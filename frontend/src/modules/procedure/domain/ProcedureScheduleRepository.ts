import { ProcedureSchedule } from './ProcedureSchedule';

export interface ProcedureScheduleRepository {
  listAll(): Promise<ProcedureSchedule[]>;
}
