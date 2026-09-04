import { messageFromError, translateMessage, type LocalizedMessage } from '../../../i18n/message';
import { useTranslation } from '../../../i18n/hooks/hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ConversationListItem, Message, Conversation } from '../domain/Conversation';
import { ApiChatRepository } from '../infra/ApiChatRepository';
import { socketService } from '../infra/SocketService';
import { GetConversationsQueryHandler } from '../application/queries/GetConversationsQueryHandler';
import { GetMessagesQueryHandler } from '../application/queries/GetMessagesQueryHandler';
import { CreateConversationCommandHandler } from '../application/commands/CreateConversationCommandHandler';
import { SendMessageCommandHandler } from '../application/commands/SendMessageCommandHandler';
import { GetConversationsQuery } from '../application/queries/GetConversationsQuery';
import { GetMessagesQuery } from '../application/queries/GetMessagesQuery';
import { CreateConversationCommand } from '../application/commands/CreateConversationCommand';
import { SendMessageCommand } from '../application/commands/SendMessageCommand';

export function useChat() {
  const { translate } = useTranslation();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocalizedMessage | null>(null);

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
      const errorMsg = messageFromError(err, 'loadConversationsError');
      console.error('[useChat] ❌ Failed to load conversations:', errorMsg);
      setError(errorMsg);
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
      setError(messageFromError(err, 'loadMessagesError'));
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
      console.error('[useChat] ❌ Error creating conversation:', err);
      setError(messageFromError(err, 'chatStartError'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: number, content: string) => {
    try {
      setError(null);
      
      // Send via API only - the backend will handle Socket.IO notifications
      const message = await sendMessageHandler.handle(
        new SendMessageCommand(conversationId, content)
      );
      
      // Add message to local state immediately for better UX
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) {
          return prev; // Already exists
        }
        return [...prev, message];
      });
      
      // Refresh conversations to update last message
      await loadConversations();
      
      return message;
    } catch (err) {
      setError(messageFromError(err, 'sendMessageError'));
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
      // Send via Socket.IO for real-time update
      if (socketService.isConnected()) {
        socketService.markMessageAsRead(messageId);
      }
      
      // Also send via API
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
      setError(messageFromError(err, 'markMessageReadError'));
    }
  };

  // Archive conversation
  const archiveConversation = async (conversationId: number) => {
    try {
      await repository.archiveConversation(conversationId);
      await loadConversations(); // Refresh conversations list
    } catch (err) {
      setError(messageFromError(err, 'archiveConversationError'));
      throw err;
    }
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Socket.IO integration
  useEffect(() => {
    // Connect to socket when component mounts
    socketService.connect();

    // Listen for new messages
    const handleNewMessage = (message: unknown) => {
      const msg = message as Message;
      
      setMessages(prev => {
        // Avoid duplicates by checking if message already exists
        const exists = prev.some(m => m.id === msg.id);
        if (exists) {
          return prev;
        }
        return [...prev, msg];
      });
      // Refresh conversations to update last message and unread count
      loadConversations();
    };

    // Listen for message read updates
    const handleMessageRead = (data: unknown) => {
      const { messageId } = data as { messageId: number };
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      // Refresh conversations to update unread count
      loadConversations();
    };

    // Listen for conversation updates
    const handleConversationUpdated = () => {
      loadConversations();
    };

    socketService.addEventListener('new-message', handleNewMessage);
    socketService.addEventListener('message-read', handleMessageRead);
    socketService.addEventListener('conversation-updated', handleConversationUpdated);

    // Cleanup on unmount
    return () => {
      socketService.removeEventListener('new-message', handleNewMessage);
      socketService.removeEventListener('message-read', handleMessageRead);
      socketService.removeEventListener('conversation-updated', handleConversationUpdated);
    };
  }, [loadConversations]);

  // Join/leave conversation rooms when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      socketService.joinConversation(selectedConversation.id);
      
      return () => {
        socketService.leaveConversation(selectedConversation.id);
      };
    }
  }, [selectedConversation]);

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    loading,
    error: translateMessage(error, translate),
    
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
