export class GetMessagesQuery {
  public readonly conversationId: number;

  constructor(conversationId: number) {
    this.conversationId = conversationId;
  }
}
