import { MessageType } from '../../../../types/chat.js';

export class Message {
  private constructor(
    private readonly _id: number,
    private readonly _conversationId: number,
    private readonly _senderId: number,
    private readonly _content: string,
    private readonly _type: MessageType,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _editedAt?: Date
  ) {}

  // Factory methods
  static create(conversationId: number, senderId: number, content: string, type: MessageType = MessageType.TEXT): Message {
    return new Message(
      0, // ID will be set by database
      conversationId,
      senderId,
      content,
      type,
      new Date(),
      new Date()
    );
  }

  static fromDatabase(data: any): Message {
    return new Message(
      data.id,
      data.conversation_id,
      data.sender_id,
      data.content,
      data.type,
      data.created_at,
      data.updated_at,
      data.edited_at
    );
  }

  // Getters
  get id(): number { return this._id; }
  get conversationId(): number { return this._conversationId; }
  get senderId(): number { return this._senderId; }
  get content(): string { return this._content; }
  get type(): MessageType { return this._type; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get editedAt(): Date | undefined { return this._editedAt; }

  // Business logic
  markAsEdited(): void {
    this._editedAt = new Date();
    this._updatedAt = new Date();
  }

  isOwnedBy(userId: number): boolean {
    return this._senderId === userId;
  }
}
