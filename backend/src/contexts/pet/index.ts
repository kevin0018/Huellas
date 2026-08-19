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

export function createPetCareModule(): PetCareModule {
  const pets = new PetRepository();
  const checkups = new CheckupRepository();
  const procedures = new ProcedureRepository();

  return {
    checkups: {
      create: new PostCheckupController(checkups, pets, procedures),
      delete: new DeleteCheckupController(checkups, pets),
      get: new GetCheckupByIdController(checkups, pets),
      listByPet: new GetPetCheckupsController(checkups, pets),
      update: new PatchCheckupController(checkups, pets, procedures),
    },
    pets: {
      create: new PostPetController(pets),
      delete: new DeletePetController(pets),
      get: new GetPetController(pets),
      listMine: new GetMyPetsController(pets),
      update: new PatchPetController(pets),
    },
    procedures: {
      getByType: new GetProceduresController(procedures),
      getStatusByPet: new GetPetProceduresStatusController(procedures, pets),
    },
  };
}
