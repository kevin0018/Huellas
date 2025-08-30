import type { PostCategory } from "../../domain/types";

export class CreateVolunteerPostCommand {
  public readonly title: string;
  public readonly content: string;
  public readonly category: PostCategory;
  public readonly expiresAt: string | null | undefined;

  constructor(
    title: string,
    content: string,
    category: PostCategory,
    expiresAt?: string | null
  ) {
    this.title = title;
    this.content = content;
    this.category = category;
    this.expiresAt = expiresAt ?? null;
  }
}
