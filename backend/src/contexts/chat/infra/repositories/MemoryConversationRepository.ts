import { Conversation } from '../../domain/entities/Conversation.js';
import { ConversationRepository } from '../../domain/repositories/ConversationRepository.js';

export class MemoryConversationRepository implements ConversationRepository {
  private conversations: Map<number, Conversation> = new Map();
  private participantsReadTimes: Map<string, Date> = new Map(); // key: "conversationId-userId"
  private currentId = 1;

  async findById(id: number): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async findByParticipant(userId: number): Promise<Conversation[]> {
    const userConversations: Conversation[] = [];
    
    for (const conversation of this.conversations.values()) {
      const participantIds = conversation.participantIds;
      if (participantIds.includes(userId)) {
        userConversations.push(conversation);
      }
    }
    
    return userConversations.sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async create(conversation: Conversation): Promise<Conversation> {
    // For memory repository, create a new conversation
    const newConversation = Conversation.create(
      conversation.title,
      conversation.createdBy,
      conversation.participantIds
    );
    
    // Since we can't set the ID directly, we'll use a Map with our own counter
    // and create a mock conversation for storage
    const conversationData = {
      id: this.currentId++,
      title: conversation.title,
      status: conversation.status,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: conversation.createdBy,
      participants: conversation.participantIds.map(id => ({ user_id: id }))
    };
    
    const storedConversation = Conversation.fromDatabase(conversationData);
    this.conversations.set(storedConversation.id, storedConversation);
    return storedConversation;
  }

  async update(conversation: Conversation): Promise<Conversation> {
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async delete(id: number): Promise<void> {
    this.conversations.delete(id);
    
    // Clean up participant read times
    for (const key of this.participantsReadTimes.keys()) {
      if (key.startsWith(`${id}-`)) {
        this.participantsReadTimes.delete(key);
      }
    }
  }

  async updateLastReadAt(conversationId: number, userId: number, timestamp: Date): Promise<void> {
    const key = `${conversationId}-${userId}`;
    this.participantsReadTimes.set(key, timestamp);
  }

  // Helper method for testing
  getLastReadAt(conversationId: number, userId: number): Date | null {
    const key = `${conversationId}-${userId}`;
    return this.participantsReadTimes.get(key) || null;
  }

  // Helper method for testing
  clear(): void {
    this.conversations.clear();
    this.participantsReadTimes.clear();
    this.currentId = 1;
  }
}
