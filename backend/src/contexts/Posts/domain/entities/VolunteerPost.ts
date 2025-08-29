// Entidad de dominio para VolunteerPost.
// NOTA: importamos enums de Prisma para mantener sincronía con el schema.prisma.
import { PostCategory, PostStatus } from "@prisma/client";

export class VolunteerPost {
  // --- Campos privados ---
  private id: number;
  private title: string;
  private content: string;
  private authorId: number;
  private category: PostCategory;
  private status: PostStatus;
  private createdAt: Date;
  private updatedAt: Date;
  private publishedAt: Date | null;
  private expiresAt: Date | null;

  // --- Constructor ---
  constructor(
    id: number,
    title: string,
    content: string,
    authorId: number,
    category: PostCategory,
    status: PostStatus,
    createdAt: Date,
    updatedAt: Date,
    publishedAt: Date | null,
    expiresAt: Date | null
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.authorId = authorId;
    this.category = category;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.publishedAt = publishedAt;
    this.expiresAt = expiresAt;
  }

  // --- Getters ---
  public getId(): number { return this.id; }
  public getTitle(): string { return this.title; }
  public getContent(): string { return this.content; }
  public getAuthorId(): number { return this.authorId; }
  public getCategory(): PostCategory { return this.category; }
  public getStatus(): PostStatus { return this.status; }
  public getCreatedAt(): Date { return this.createdAt; }
  public getUpdatedAt(): Date { return this.updatedAt; }
  public getPublishedAt(): Date | null { return this.publishedAt; }
  public getExpiresAt(): Date | null { return this.expiresAt; }

  // --- Setters (si quieres permitir mutaciones controladas) ---
  public setTitle(v: string): void { this.title = v; }
  public setContent(v: string): void { this.content = v; }
  public setCategory(v: PostCategory): void { this.category = v; }
  public setStatus(v: PostStatus): void { this.status = v; }
  public setExpiresAt(v: Date | null): void { this.expiresAt = v; }
}