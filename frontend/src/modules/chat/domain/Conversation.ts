export interface Conversation {
  readonly id: number;
  readonly title: string;
  readonly participants: Participant[];
  readonly lastMessage?: Message;
  readonly lastMessageAt?: string;
  readonly isArchived: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Participant {
  readonly id: number;
  readonly name: string;
  readonly lastName: string;
  readonly email: string;
  readonly type: 'OWNER' | 'VOLUNTEER';
}

export interface Message {
  readonly id: number;
  readonly conversationId: number;
  readonly senderId: number;
  readonly content: string;
  readonly isRead: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateConversationData {
  readonly title: string;
  readonly participantIds: number[];
}

export interface SendMessageData {
  readonly conversationId: number;
  readonly content: string;
  readonly type?: string;
}

export interface ConversationListItem {
  readonly id: number;
  readonly title: string;
  readonly participants: Participant[];
  readonly lastMessage?: {
    readonly content: string;
    readonly senderName: string;
    readonly createdAt: string;
    readonly isRead: boolean;
  };
  readonly unreadCount: number;
  readonly isArchived: boolean;
}
