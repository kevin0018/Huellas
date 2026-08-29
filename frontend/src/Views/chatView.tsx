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
  onSelectConversation: (conversation: ConversationListItem) => void | Promise<void>;
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
            aria-pressed={selectedConversation === conversation?.id}
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
  const [mobilePanel, setMobilePanel] = useState<'list' | 'thread'>('list');
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

  useEffect(() => {
    if (selectedConversation) setMobilePanel('thread');
  }, [selectedConversation]);

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

  const handleConversationSelect = async (conversation: ConversationListItem) => {
    setMobilePanel('thread');
    await selectConversation(conversation);
  };

  return (
    <>
      <NavBar />
      <main className="workspace-page">
        <div className="workspace-shell">
          <header className="workspace-header">
            <GoBackButton hideIfNoHistory />
            <div className="workspace-header__copy">
              <h1 className="workspace-header__title">Mensajes</h1>
              <p className="workspace-header__description">
                Organiza las conversaciones nacidas en el tablón y concreta la ayuda desde aquí.
              </p>
            </div>
          </header>

          {error && (
            <div className="workspace-alert ui-status--error mt-6" role="alert">
              {error}
              <button
                type="button"
                onClick={() => setError(null)}
                className="ui-action ml-2 px-2 py-1"
                aria-label="Cerrar error"
              >
                ✕
              </button>
            </div>
          )}

          <div className="chat-workspace mt-8">
            <aside className="chat-sidebar" aria-label="Conversaciones" data-mobile-hidden={mobilePanel === 'thread'}>
              <header className="chat-sidebar__header">
                <h2 className="chat-sidebar__title">Conversaciones</h2>
                <span className="chat-sidebar__count">{conversations.length}</span>
              </header>
              <div className="chat-conversation-list">
                <ConversationList
                  conversations={conversations || []}
                  selectedConversation={selectedConversation?.id || null}
                  onSelectConversation={handleConversationSelect}
                  loading={loading}
                />
              </div>
            </aside>

            <section className="chat-thread" aria-label="Conversación activa" data-mobile-hidden={mobilePanel === 'list'}>
              {selectedConversation ? (
                <>
                  <header className="chat-thread__header">
                    <button
                      type="button"
                      className="chat-mobile-back ui-action ui-action--secondary px-3 py-2"
                      onClick={() => setMobilePanel('list')}
                    >
                      Conversaciones
                    </button>
                    <div className="chat-thread__identity">
                      <h2 className="chat-thread__title">
                        {selectedConversation.title}
                      </h2>
                      <p className="chat-thread__participants">
                        {selectedConversation.participants
                          ?.filter(p => p?.id !== currentUserId)
                          ?.map(p => `${p?.name} ${p?.lastName}`)
                          ?.join(', ')}
                      </p>
                    </div>
                  </header>

                  <div className="chat-thread__messages" aria-live="polite">
                    {loading && messages.length === 0 ? (
                      <div className="chat-empty">Cargando mensajes…</div>
                    ) : messages.length === 0 ? (
                      <div className="chat-empty">Todavía no hay mensajes. Empieza la conversación.</div>
                    ) : (
                      <div>
                        {messages.map((message) => (
                          <ChatMessage
                            key={message.id}
                            message={message}
                            isCurrentUser={message.senderId === currentUserId}
                          />
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="chat-thread__composer">
                    <div className="chat-thread__composer-row">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje…"
                        aria-label="Mensaje"
                        className="ui-control px-3 py-2"
                          disabled={loading}
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || loading}
                        className="ui-action ui-action--primary px-5 py-2"
                        >
                          Enviar
                        </button>
                      </div>
                  </form>
                </>
              ) : (
                <div className="chat-empty">
                  Selecciona una conversación para ver los mensajes.
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
