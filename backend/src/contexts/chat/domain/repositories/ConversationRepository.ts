
import { Conversation } from '../entities/Conversation.js';

export interface ConversationRepository {
  findById(id: number): Promise<Conversation | null>;
  findByParticipant(userId: number): Promise<Conversation[]>;
  create(conversation: Conversation): Promise<Conversation>;
  update(conversation: Conversation): Promise<Conversation>;
  delete(id: number): Promise<void>;
}
