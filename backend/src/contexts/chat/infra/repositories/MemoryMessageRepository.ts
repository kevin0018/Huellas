import { Message } from '../../domain/entities/Message.js';
import { MessageRepository } from '../../domain/repositories/MessageRepository.js';

export class MemoryMessageRepository implements MessageRepository {
  private messages: Map<number, Message> = new Map();
  private currentId = 1;

  async findById(id: number): Promise<Message | null> {
    return this.messages.get(id) || null;
  }

  async findByConversationId(conversationId: number, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const conversationMessages: Message[] = [];
    
    for (const message of this.messages.values()) {
      if (message.conversationId === conversationId) {
        conversationMessages.push(message);
      }
    }
    
    // Sort by creation date ascending (oldest first, newest last - natural chat flow)
    conversationMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Apply pagination
    return conversationMessages.slice(offset, offset + limit);
  }

  async save(message: Message): Promise<Message> {
    if (message.id === 0) {
      // Create new message - simulate database auto-increment
      const messageData = {
        id: this.currentId++,
        conversation_id: message.conversationId,
        sender_id: message.senderId,
        content: message.content,
        type: message.type,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const savedMessage = Message.fromDatabase(messageData);
      this.messages.set(savedMessage.id, savedMessage);
      return savedMessage;
    } else {
      // Update existing message
      this.messages.set(message.id, message);
      return message;
    }
  }

  async delete(id: number): Promise<void> {
    this.messages.delete(id);
  }

  async getUnreadCount(_userId: number): Promise<number> {
    // For memory repository, we'll implement a simplified version
    // In real implementation, this would check read timestamps
    // For testing, we'll just return 0
    return 0;
  }

  // Helper methods for testing
  clear(): void {
    this.messages.clear();
    this.currentId = 1;
  }

  getAllMessages(): Message[] {
    return Array.from(this.messages.values());
  }

  getMessageCount(): number {
    return this.messages.size;
  }
}
