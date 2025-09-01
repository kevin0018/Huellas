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
            ? 'bg-[#51344D] !text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
        style={isCurrentUser ? { backgroundColor: '#51344D', color: 'white' } : {}}
      >
        <p 
          className={`text-sm ${isCurrentUser ? '!text-white' : ''}`}
          style={isCurrentUser ? { color: 'white !important' } : {}}
        >
          {message.content}
        </p>
        <p 
          className={`text-xs mt-1 opacity-70 ${isCurrentUser ? '!text-white' : ''}`}
          style={isCurrentUser ? { color: 'rgba(255, 255, 255, 0.7) !important' } : {}}
        >
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
    return <div className="text-gray-500">Cargando conversaciones...</div>;
  }

  if (!conversations.length) {
    return <div className="text-gray-500">No hay conversaciones</div>;
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation, index) => 
        conversation ? (
          <div
            key={conversation?.id || `conversation-${index}`}
            onClick={() => onSelectConversation(conversation)}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedConversation === conversation?.id
                ? 'bg-[#51344D] shadow-md !text-white'
                : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-800'
            }`}
            style={selectedConversation === conversation?.id ? { 
              backgroundColor: '#51344D',
              color: 'white'
            } : {}}
          >
            <div className="flex justify-between items-start">
              <h3 
                className={`font-normal text-sm ${
                  selectedConversation === conversation?.id
                    ? '!text-white'
                    : 'text-gray-800'
                }`}
                style={selectedConversation === conversation?.id ? { color: 'white !important' } : {}}
              >
                {conversation?.title || 'Sin título'}
              </h3>
              {conversation?.unreadCount && conversation.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          <p 
            className={`text-xs mt-1 ${
              selectedConversation === conversation?.id
                ? '!text-white'
                : 'text-gray-600'
            }`}
            style={selectedConversation === conversation?.id ? { 
              color: 'rgba(255, 255, 255, 0.8) !important' 
            } : {}}
          >
            {conversation.participants
              ?.filter(p => p?.name && p?.lastName)
              ?.map(p => `${p.name} ${p.lastName}`)
              ?.join(', ') || 'Sin participantes'}
          </p>
          {conversation?.lastMessage && (
            <p 
              className={`text-xs mt-2 truncate ${
                selectedConversation === conversation?.id
                  ? '!text-white'
                  : 'text-gray-500'
              }`}
              style={selectedConversation === conversation?.id ? { 
                color: 'rgba(255, 255, 255, 0.7) !important' 
              } : {}}
            >
              {conversation.lastMessage.content}
            </p>
          )}
          </div>
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
        console.log('✅ Found specific conversation by ID:', specificConversation);
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
      console.log('✅ Found conversation(s), selecting most recent:', mostRecentConversation);
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
            <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
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
              
              <div className="bg-gray-50 rounded-lg p-3 lg:p-4 overflow-y-auto flex-1">
                <h2 className="font-caprasimo text-base lg:text-lg text-[#51344D] mb-3 lg:mb-4">
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
                <h1 className="font-caprasimo text-xl lg:text-2xl text-[#51344D]">
                  Mensajes
                </h1>
              </div>
              

              <div className="bg-white rounded-lg shadow-md flex flex-col flex-1 min-h-0">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-3 lg:p-4 border-b border-gray-200">
                      <h3 className="font-normal text-[#51344D] text-sm lg:text-base">
                        {selectedConversation.title}
                      </h3>
                      <p className="text-xs lg:text-sm text-gray-600">
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
                          <div className="text-gray-500">Cargando mensajes...</div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-gray-500">No hay mensajes</div>
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
                    <form onSubmit={handleSendMessage} className="p-3 lg:p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escribe tu mensaje..."
                          className="flex-1 px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                          disabled={loading}
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || loading}
                          className="px-3 lg:px-4 py-2 text-sm lg:text-base bg-[#51344D] text-white rounded-md hover:bg-[#6a4f66] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Enviar
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">
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
