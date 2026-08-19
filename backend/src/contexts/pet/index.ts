import { DeleteCheckupController } from '../checkup/infra/controllers/DeleteCheckupController.js';
import { GetCheckupByIdController } from '../checkup/infra/controllers/GetCheckupByIdController.js';
import { GetPetCheckupsController } from '../checkup/infra/controllers/GetPetCheckupsController.js';
import { PatchCheckupController } from '../checkup/infra/controllers/PatchCheckupController.js';
import { PostCheckupController } from '../checkup/infra/controllers/PostCheckupController.js';
import { CheckupRepository } from '../checkup/infra/persistence/CheckupRepository.js';
import { GetPetProceduresStatusController } from '../procedure/infra/controllers/GetPetProceduresStatusController.js';
import { GetProceduresController } from '../procedure/infra/controllers/GetProceduresController.js';
import { ProcedureRepository } from '../procedure/infra/persistence/ProcedureRepository.js';
import { DeletePetController } from './infra/controllers/DeletePetController.js';
import { GetMyPetsController } from './infra/controllers/GetMyPetsController.js';
import { GetPetController } from './infra/controllers/GetPetController.js';
import { PatchPetController } from './infra/controllers/PatchPetController.js';
import { PostPetController } from './infra/controllers/PostPetController.js';
import { PetRepository } from './infra/persistence/PetRepository.js';
import type { PrismaClient } from '@prisma/client';
import type { ReminderService } from '../reminder/ReminderService.js';
import { CheckupAccessService } from '../checkup/app/CheckupAccessService.js';
import { CreateCheckupUseCase } from '../checkup/app/CreateCheckupUseCase.js';
import { FindPetCheckupsUseCase } from '../checkup/app/FindPetCheckupsUseCase.js';
import { FindProceduresByPetTypeUseCase } from '../procedure/app/FindProceduresByPetTypeUseCase.js';
import { GetPetProceduresStatusUseCase } from '../procedure/app/GetPetProceduresStatusUseCase.js';
import { CreatePetUseCase } from './app/CreatePetUseCase.js';
import { FindPetsByOwnerUseCase } from './app/FindPetsByOwnerUseCase.js';
import { UpdatePetUseCase } from './app/UpdatePetUseCase.js';

export interface PetCareModule {
  checkups: {
    create: PostCheckupController;
    delete: DeleteCheckupController;
    get: GetCheckupByIdController;
    listByPet: GetPetCheckupsController;
    update: PatchCheckupController;
  };
  pets: {
    create: PostPetController;
    delete: DeletePetController;
    get: GetPetController;
    listMine: GetMyPetsController;
    update: PatchPetController;
  };
  procedures: {
    getByType: GetProceduresController;
    getStatusByPet: GetPetProceduresStatusController;
  };
}

export function createPetCareModule(prisma: PrismaClient, reminders: ReminderService): PetCareModule {
  const pets = new PetRepository(prisma);
  const checkups = new CheckupRepository(prisma, reminders.completePreventive.bind(reminders));
  const procedures = new ProcedureRepository(prisma);
  const checkupAccess = new CheckupAccessService(checkups, pets);

  return {
    checkups: {
      create: new PostCheckupController(new CreateCheckupUseCase(checkups), procedures, checkupAccess),
      delete: new DeleteCheckupController(checkups, checkupAccess),
      get: new GetCheckupByIdController(checkupAccess),
      listByPet: new GetPetCheckupsController(new FindPetCheckupsUseCase(checkups), checkupAccess),
      update: new PatchCheckupController(checkups, procedures, checkupAccess),
    },
    pets: {
      create: new PostPetController(new CreatePetUseCase(pets)),
      delete: new DeletePetController(pets),
      get: new GetPetController(pets),
      listMine: new GetMyPetsController(new FindPetsByOwnerUseCase(pets)),
      update: new PatchPetController(new UpdatePetUseCase(pets)),
    },
    procedures: {
      getByType: new GetProceduresController(new FindProceduresByPetTypeUseCase(procedures)),
      getStatusByPet: new GetPetProceduresStatusController(new GetPetProceduresStatusUseCase(procedures, pets, prisma)),
    },
  };
}
