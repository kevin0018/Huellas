export class SendMessageCommand {
  public readonly conversationId: number;
  public readonly content: string;
  public readonly senderId: number;

  constructor(conversationId: number, content: string, senderId: number) {
    this.conversationId = conversationId;
    this.content = content;
    this.senderId = senderId;
  }
}
