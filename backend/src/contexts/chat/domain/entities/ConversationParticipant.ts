export class ConversationParticipant {
  constructor(
    public readonly id: number,
    public readonly conversationId: number,
    public readonly userId: number,
    public readonly joinedAt: Date,
    public lastReadAt?: Date | null,
  ) {}
}
