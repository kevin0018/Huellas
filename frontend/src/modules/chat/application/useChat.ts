import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ConversationListItem, Message, Conversation } from '../domain/Conversation';
import { ApiChatRepository } from '../infra/ApiChatRepository';
import { GetConversationsQueryHandler } from '../application/queries/GetConversationsQueryHandler';
import { GetMessagesQueryHandler } from '../application/queries/GetMessagesQueryHandler';
import { CreateConversationCommandHandler } from '../application/commands/CreateConversationCommandHandler';
import { SendMessageCommandHandler } from '../application/commands/SendMessageCommandHandler';
import { GetConversationsQuery } from '../application/queries/GetConversationsQuery';
import { GetMessagesQuery } from '../application/queries/GetMessagesQuery';
import { CreateConversationCommand } from '../application/commands/CreateConversationCommand';
import { SendMessageCommand } from '../application/commands/SendMessageCommand';

export function useChat() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize handlers
  const repository = useMemo(() => new ApiChatRepository(), []);
  const getConversationsHandler = useMemo(
    () => new GetConversationsQueryHandler(repository), 
    [repository]
  );
  const getMessagesHandler = useMemo(
    () => new GetMessagesQueryHandler(repository), 
    [repository]
  );
  const createConversationHandler = useMemo(
    () => new CreateConversationCommandHandler(repository), 
    [repository]
  );
  const sendMessageHandler = useMemo(
    () => new SendMessageCommandHandler(repository), 
    [repository]
  );

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getConversationsHandler.handle(new GetConversationsQuery());
      setConversations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading conversations');
    } finally {
      setLoading(false);
    }
  }, [getConversationsHandler]);

  // Load messages for a conversation
  const loadMessages = async (conversationId: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMessagesHandler.handle(new GetMessagesQuery(conversationId));
      setMessages(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  // Create a new conversation
  const createConversation = async (title: string, participantIds: number[]) => {
    try {
      setLoading(true);
      setError(null);
      const conversation = await createConversationHandler.handle(
        new CreateConversationCommand(title, participantIds)
      );
      await loadConversations(); // Refresh conversations list
      return conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: number, content: string, senderId: number) => {
    try {
      setError(null);
      const message = await sendMessageHandler.handle(
        new SendMessageCommand(conversationId, content, senderId)
      );
      
      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, message]);
      
      // Refresh conversations to update last message
      await loadConversations();
      
      return message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message');
      throw err;
    }
  };

  // Select a conversation and load its messages
  const selectConversation = async (conversation: ConversationListItem) => {
    setSelectedConversation({
      id: conversation.id,
      title: conversation.title,
      participants: conversation.participants,
      isArchived: conversation.isArchived,
      createdAt: '', // Will be loaded from full conversation if needed
      updatedAt: '', // Will be loaded from full conversation if needed
    });
    await loadMessages(conversation.id);
  };

  // Mark message as read
  const markAsRead = async (messageId: number) => {
    try {
      await repository.markMessageAsRead(messageId);
      // Update local message state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      // Refresh conversations to update unread count
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking message as read');
    }
  };

  // Archive conversation
  const archiveConversation = async (conversationId: number) => {
    try {
      await repository.archiveConversation(conversationId);
      await loadConversations(); // Refresh conversations list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error archiving conversation');
      throw err;
    }
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    loading,
    error,
    
    // Actions
    loadConversations,
    loadMessages,
    createConversation,
    sendMessage,
    selectConversation,
    markAsRead,
    archiveConversation,
    
    // Utilities
    setError, // For clearing errors
  };
}
