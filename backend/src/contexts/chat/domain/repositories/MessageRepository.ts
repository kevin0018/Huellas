
import { Message } from '../entities/Message.js';

export interface MessageRepository {
  findById(id: number): Promise<Message | null>;
  findByConversation(conversationId: number): Promise<Message[]>;
  create(message: Message): Promise<Message>;
  update(message: Message): Promise<Message>;
  delete(id: number): Promise<void>;
}
