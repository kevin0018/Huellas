import type { ChatRepository } from '../domain/ChatRepository';
import type { 
  Conversation, 
  Message, 
  CreateConversationData, 
  SendMessageData,
  ConversationListItem 
} from '../domain/Conversation';
import { AuthService } from '../../auth/infra/AuthService';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class ApiChatRepository implements ChatRepository {
  private readonly baseUrl: string;

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    this.baseUrl = apiUrl;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = AuthService.getToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      return result.data;
    } catch (error) {
      console.error('[ApiChatRepository] Request failed:', error);
      throw error;
    }
  }

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    return this.makeRequest<Conversation>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversations(): Promise<ConversationListItem[]> {
    return this.makeRequest<ConversationListItem[]>('/chat/conversations');
  }

  async getConversation(id: number): Promise<Conversation> {
    return this.makeRequest<Conversation>(`/chat/conversations/${id}`);
  }

  async archiveConversation(id: number): Promise<void> {
    await this.makeRequest<void>(`/chat/conversations/${id}/archive`, {
      method: 'PUT',
    });
  }

  async sendMessage(data: SendMessageData): Promise<Message> {
    return this.makeRequest<Message>(`/chat/conversations/${data.conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: data.content,
        type: data.type || 'text',
      }),
    });
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return this.makeRequest<Message[]>(`/chat/conversations/${conversationId}/messages`);
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await this.makeRequest<void>(`/chat/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  async getUnreadCount(): Promise<number> {
    const result = await this.makeRequest<{ count: number }>('/chat/messages/unread/count');
    return result.count;
  }
}
