import { ConversationStatus } from '@prisma/client';

export class Conversation {
  private constructor(
    private readonly _id: number,
    private readonly _title: string | null,
    private _status: ConversationStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _createdBy: number,
    private readonly _participantIds: number[]
  ) {}

  // Factory methods
  static create(title: string | null, createdBy: number, participantIds: number[]): Conversation {
    return new Conversation(
      0, // ID will be set by database
      title,
      ConversationStatus.ACTIVE,
      new Date(),
      new Date(),
      createdBy,
      participantIds
    );
  }

  static fromDatabase(data: any): Conversation {
    return new Conversation(
      data.id,
      data.title,
      data.status,
      data.created_at,
      data.updated_at,
      data.created_by,
      data.participants?.map((p: any) => p.user_id) || []
    );
  }

  // Getters
  get id(): number { return this._id; }
  get title(): string | null { return this._title; }
  get status(): ConversationStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get createdBy(): number { return this._createdBy; }
  get participantIds(): number[] { return this._participantIds; }

  // Business logic
  archive(): void {
    this._status = ConversationStatus.ARCHIVED;
    this._updatedAt = new Date();
  }

  reactivate(): void {
    this._status = ConversationStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  isParticipant(userId: number): boolean {
    return this._participantIds.includes(userId);
  }
}
