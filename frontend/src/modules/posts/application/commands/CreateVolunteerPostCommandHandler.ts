import { ApiVolunteerPosts } from "../../infra/ApiVolunteerPosts";
import type { VolunteerPost } from "../../domain/types";
import { CreateVolunteerPostCommand } from "./CreateVolunteerPostCommand";

export class CreateVolunteerPostCommandHandler {
  private readonly api: ApiVolunteerPosts;

  constructor(api = new ApiVolunteerPosts()) {
    this.api = api;
  }

  async execute(cmd: CreateVolunteerPostCommand): Promise<VolunteerPost> {
    return this.api.create({
      title: cmd.title,
      content: cmd.content,
      category: cmd.category,
      expiresAt: cmd.expiresAt ?? null,
    });
  }
}
