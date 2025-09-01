import type { 
  Conversation, 
  Message, 
  CreateConversationData, 
  SendMessageData,
  ConversationListItem 
} from './Conversation';

export interface ChatRepository {
  // Conversation management
  createConversation(data: CreateConversationData): Promise<Conversation>;
  getConversations(): Promise<ConversationListItem[]>;
  getConversation(id: number): Promise<Conversation>;
  archiveConversation(id: number): Promise<void>;
  
  // Message management
  sendMessage(data: SendMessageData): Promise<Message>;
  getMessages(conversationId: number): Promise<Message[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  
  // Utility
  getUnreadCount(): Promise<number>;
}
