export class SendMessageCommand {
  public readonly conversationId: number;
  public readonly content: string;
  public readonly type?: string;

  constructor(conversationId: number, content: string, type?: string) {
    this.conversationId = conversationId;
    this.content = content;
    this.type = type;
  }
}
