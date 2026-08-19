export interface GetMessagesQuery {
  conversationId: number;
  userId: number;
  limit?: number;
  offset?: number;
}
