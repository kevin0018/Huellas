import { ApiVolunteerPosts } from "../../infra/ApiVolunteerPosts";
import { DeleteVolunteerPostCommand } from "./DeleteVolunteerPostCommand";

export class DeleteVolunteerPostCommandHandler {
  private readonly api: ApiVolunteerPosts;

  constructor(api = new ApiVolunteerPosts()) {
    this.api = api;
  }

  async execute(cmd: DeleteVolunteerPostCommand): Promise<void> {
    await this.api.delete(cmd.id);
  }
}
