// src/di.ts
import { ApiPetRepository } from './modules/pet/infra/ApiPetRepository';
import { ApiProcedureScheduleRepository } from './modules/procedure/infra/ApiProcedureScheduleRepository';
import { ApiCheckupRepository } from './modules/checkup/infra/ApiCheckupRepository';
import { AuthService } from './modules/auth/infra/AuthService';

const authHeaders = () => {
  const token = (AuthService as any).getToken?.() ?? localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const petRepo = new ApiPetRepository({ getAuthHeaders: authHeaders });
export const procedureRepo = new ApiProcedureScheduleRepository({ getAuthHeaders: authHeaders });
export const checkupRepo = new ApiCheckupRepository({ getAuthHeaders: authHeaders });
