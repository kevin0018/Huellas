import { CreateVolunteerPostCommand } from '../../modules/posts/application/commands/CreateVolunteerPostCommand';
import { CreateVolunteerPostCommandHandler } from '../../modules/posts/application/commands/CreateVolunteerPostCommandHandler';
import { DeleteVolunteerPostCommand } from '../../modules/posts/application/commands/DeleteVolunteerPostCommand';
import { DeleteVolunteerPostCommandHandler } from '../../modules/posts/application/commands/DeleteVolunteerPostCommandHandler';
import type { PostCategory } from '../../modules/posts/domain/types';

const createHandler = new CreateVolunteerPostCommandHandler();
const deleteHandler = new DeleteVolunteerPostCommandHandler();

export const postActions = {
  create(title: string, content: string, category: PostCategory, expiresAt?: string | null) {
    return createHandler.execute(new CreateVolunteerPostCommand(title, content, category, expiresAt));
  },

  remove(id: number): Promise<void> {
    return deleteHandler.execute(new DeleteVolunteerPostCommand(id));
  },
};
