import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import NavBar from "../Components/NavBar";
import GoBackButton from "../Components/GoBackButton";
import { useChat } from "../modules/chat/application/useChat";
import { AuthService } from "../modules/auth/infra/AuthService";
import type { ConversationListItem, Message } from "../modules/chat/domain/Conversation";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? 'ui-chat-bubble--own'
            : 'ui-chat-bubble--other'
        }`}
      >
        <p className="text-sm text-inherit">
          {message.content}
        </p>
        <p className="text-xs mt-1 opacity-70 text-inherit">
          {new Date(message.createdAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}

interface ConversationListProps {
  conversations: ConversationListItem[];
  selectedConversation: number | null;
  onSelectConversation: (conversation: ConversationListItem) => void;
  loading: boolean;
}

function ConversationList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  loading 
}: ConversationListProps) {
  if (loading) {
    return <div className="ui-text-muted">Cargando conversaciones...</div>;
  }

  if (!conversations.length) {
    return <div className="ui-text-muted">No hay conversaciones</div>;
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation, index) => 
        conversation ? (
          <button
            type="button"
            key={conversation?.id || `conversation-${index}`}
            onClick={() => onSelectConversation(conversation)}
            className={`ui-conversation w-full p-3 rounded-lg cursor-pointer text-left ${
              selectedConversation === conversation?.id
                ? 'ui-conversation--selected shadow-md'
                : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 
                className="font-semibold text-sm text-inherit"
              >
                {conversation?.title || 'Sin título'}
              </h3>
              {conversation?.unreadCount && conversation.unreadCount > 0 && (
              <span className="ui-status ui-status--error text-xs min-w-[20px] text-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          <p 
            className="text-xs mt-1 text-inherit opacity-80"
          >
            {conversation.participants
              ?.filter(p => p?.name && p?.lastName)
              ?.map(p => `${p.name} ${p.lastName}`)
              ?.join(', ') || 'Sin participantes'}
          </p>
          {conversation?.lastMessage && (
            <p 
              className="text-xs mt-2 truncate text-inherit opacity-70"
            >
              {conversation.lastMessage.content}
            </p>
          )}
          </button>
        ) : null
      )}
    </div>
  );
}

export default function ChatView() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');
  const withUserId = searchParams.get('with');
  const conversationId = searchParams.get('conversationId');
  
  const {
    conversations,
    selectedConversation,
    messages,
    loading,
    error,
    selectConversation,
    sendMessage,
    setError
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const hasTriedCreation = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = AuthService.getUser();
  const currentUserId = currentUser?.id;

  // Scroll to bottom when messages change or conversation changes
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, selectedConversation]);

  // Reset creation flag when URL params change
  useEffect(() => {
    hasTriedCreation.current = false;
  }, [postId, withUserId]);

  useEffect(() => {
    if (!conversations) return;

    // If we have a specific conversationId, use it directly
    if (conversationId) {
      const specificConversation = conversations.find(conv => conv?.id === parseInt(conversationId));
      if (specificConversation && selectedConversation?.id !== specificConversation.id) {
        selectConversation(specificConversation);
        return;
      }
    }

    // Fallback: if no specific conversationId, use the original logic
    if (!postId || !withUserId || !currentUserId) {
      return;
    }

    // Look for the MOST RECENT conversation with the specified user
    const existingConversations = conversations.filter(conv =>
      conv?.participants?.some(p => p?.id === parseInt(withUserId)) &&
      conv?.participants?.some(p => p?.id === currentUserId)
    );

    if (existingConversations.length > 0 && !selectedConversation) {
      // Sort by ID (most recent first) and select the newest one
      const mostRecentConversation = existingConversations.sort((a, b) => (b?.id || 0) - (a?.id || 0))[0];
      selectConversation(mostRecentConversation);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, postId, withUserId, currentUserId, conversations]); // Only select existing ones

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage(selectedConversation.id, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="background-primary flex-1">
          <div className="container mx-auto px-4 py-4 lg:py-8">
          {error && (
            <div className="mb-4 p-4 ui-status--error border border-[var(--color-error)] rounded-md">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 ui-hover-accent"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[500px] md:h-[600px] max-h-[500px] md:max-h-[600px]">
            
            <div className="flex flex-col lg:col-span-1 h-full">
              <div className="mb-2 lg:mb-4">
                <GoBackButton />
              </div>
              
              <div className="ui-panel-muted p-3 lg:p-4 overflow-y-auto flex-1">
                <h2 className="font-caprasimo text-base lg:text-lg text-[var(--color-ink)] mb-3 lg:mb-4">
                  Conversaciones
                </h2>
                <ConversationList
                  conversations={conversations || []}
                  selectedConversation={selectedConversation?.id || null}
                  onSelectConversation={selectConversation}
                  loading={loading}
                />
              </div>
            </div>

            <div className="flex flex-col lg:col-span-2 h-full">
              <div className="mb-2 lg:mb-4 text-center">
                <h1 className="font-caprasimo text-xl lg:text-2xl text-[var(--color-ink)]">
                  Mensajes
                </h1>
              </div>
              

              <div className="ui-panel flex flex-col flex-1 min-h-0 overflow-hidden">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-3 lg:p-4 border-b border-[var(--color-rule)]">
                      <h3 className="font-semibold text-[var(--color-ink)] text-sm lg:text-base">
                        {selectedConversation.title}
                      </h3>
                      <p className="text-xs lg:text-sm ui-text-muted">
                        {selectedConversation.participants
                          ?.filter(p => p?.id !== currentUserId)
                          ?.map(p => `${p?.name} ${p?.lastName}`)
                          ?.join(', ')}
                      </p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-3 lg:p-4 overflow-y-auto min-h-0 max-h-[350px] md:max-h-[450px]">
                      {loading && messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="ui-text-muted">Cargando mensajes...</div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="ui-text-muted">No hay mensajes</div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages?.map((message) => (
                            <ChatMessage
                              key={message?.id}
                              message={message}
                              isCurrentUser={message.senderId === currentUserId}
                            />
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-3 lg:p-4 border-t border-[var(--color-rule)]">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escribe tu mensaje..."
                          className="ui-control flex-1 px-3 py-2 text-sm lg:text-base"
                          disabled={loading}
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || loading}
                          className="ui-action ui-action--primary px-3 lg:px-4 py-2 text-sm lg:text-base"
                        >
                          Enviar
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="ui-text-muted">
                      Selecciona una conversación para comenzar
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
