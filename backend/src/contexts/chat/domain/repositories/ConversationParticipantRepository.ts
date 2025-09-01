import { ConversationParticipant } from '../entities/ConversationParticipant.js';
export interface ConversationParticipantRepository {
  findById(id: number): Promise<ConversationParticipant | null>;
  findByConversation(conversationId: number): Promise<ConversationParticipant[]>;
  findByUser(userId: number): Promise<ConversationParticipant[]>;
  create(participant: ConversationParticipant): Promise<ConversationParticipant>;
  update(participant: ConversationParticipant): Promise<ConversationParticipant>;
  delete(id: number): Promise<void>;
}
