export interface SendMessageCommand {
  conversationId: number;
  senderId: number;
  content: string;
  type?: string;
}
