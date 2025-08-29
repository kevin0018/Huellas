import { ConversationStatus } from '../../../../types/chat.js';

export class Conversation {
  constructor(
    public readonly id: number,
    public readonly title: string | null,
    public status: ConversationStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: number,
    public readonly participantIds: number[],
  ) {}
}
