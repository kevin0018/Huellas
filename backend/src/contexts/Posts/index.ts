import type { PrismaClient } from '@prisma/client';
import { CreateVolunteerPostUseCase } from './app/usecases/CreateVolunteerPostUseCase.js';
import { DeleteVolunteerPostUseCase } from './app/usecases/DeleteVolunteerPostUseCase.js';
import { GetVolunteerPostUseCase } from './app/usecases/GetVolunteerPostUseCase.js';
import { ListVolunteerPostsUseCase } from './app/usecases/ListVolunteerPostsUseCase.js';
import { DeleteVolunteerPostController } from './infra/controllers/DeleteVolunteerPostController.js';
import { GetVolunteerPostController } from './infra/controllers/GetVolunteerPostController.js';
import { GetVolunteerPostsController } from './infra/controllers/GetVolunteerPostsController.js';
import { PostVolunteerPostController } from './infra/controllers/PostVolunteerPostController.js';
import { VolunteerPostRepository } from './infra/persistence/VolunteerPostRepository.js';

export interface CommunityModule {
  controllers: {
    listPosts: GetVolunteerPostsController;
    getPost: GetVolunteerPostController;
    createPost: PostVolunteerPostController;
    deletePost: DeleteVolunteerPostController;
  };
}

export function createCommunityModule(prisma: PrismaClient): CommunityModule {
  const posts = new VolunteerPostRepository(prisma);

  return {
    controllers: {
      listPosts: new GetVolunteerPostsController(new ListVolunteerPostsUseCase(posts)),
      getPost: new GetVolunteerPostController(new GetVolunteerPostUseCase(posts)),
      createPost: new PostVolunteerPostController(new CreateVolunteerPostUseCase(posts)),
      deletePost: new DeleteVolunteerPostController(new DeleteVolunteerPostUseCase(posts)),
    },
  };
}
