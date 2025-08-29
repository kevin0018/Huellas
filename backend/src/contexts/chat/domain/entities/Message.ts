import { MessageType } from '../../../../types/chat.js';

export class Message {
  constructor(
    public readonly id: number,
    public readonly conversationId: number,
    public readonly senderId: number,
    public content: string,
    public type: MessageType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public editedAt?: Date | null,
  ) {}
}
