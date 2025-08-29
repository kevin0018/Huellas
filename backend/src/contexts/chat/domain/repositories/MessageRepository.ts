
import { Message } from '../entities/Message.js';

export interface MessageRepository {
  findById(id: number): Promise<Message | null>;
  findByConversationId(conversationId: number, limit?: number, offset?: number): Promise<Message[]>;
  save(message: Message): Promise<Message>;
  delete(id: number): Promise<void>;
  getUnreadCount(userId: number): Promise<number>;
}
