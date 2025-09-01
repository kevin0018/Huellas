import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/footer";
import GoBackButton from "../Components/GoBackButton";
import { useChat } from "../modules/chat/application/useChat";
import { AuthService } from "../modules/auth/infra/AuthService";
import type { ConversationListItem, Message } from "../modules/chat/domain/Conversation";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onMarkAsRead: (messageId: number) => void;
}

function ChatMessage({ message, isCurrentUser, onMarkAsRead }: ChatMessageProps) {
  useEffect(() => {
    // Mark message as read if it's not from current user and not already read
    if (!isCurrentUser && !message.isRead) {
      onMarkAsRead(message.id);
    }
  }, [message.id, isCurrentUser, message.isRead, onMarkAsRead]);

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? 'bg-[#51344D] text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs mt-1 opacity-70">
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
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-[#51344D]">Cargando conversaciones...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">No hay conversaciones</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            selectedConversation === conversation.id
              ? 'bg-[#51344D] text-white'
              : 'bg-white hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm">{conversation.title}</h3>
            {conversation.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs opacity-70 mt-1">
            {conversation.participants
              .map(p => `${p.name} ${p.lastName}`)
              .join(', ')}
          </p>
          {conversation.lastMessage && (
            <p className="text-xs opacity-60 mt-2 truncate">
              {conversation.lastMessage.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ChatView() {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');
  const withUserId = searchParams.get('with');
  
  const {
    conversations,
    selectedConversation,
    messages,
    loading,
    error,
    selectConversation,
    sendMessage,
    markAsRead,
    createConversation,
    setError
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const currentUser = AuthService.getUser();
  const currentUserId = currentUser?.id;

  // Handle creating conversation from URL params (when coming from volunteer posts)
  useEffect(() => {
    const initConversation = async () => {
      if (postId && withUserId && currentUserId && conversations.length > 0) {
        // Check if conversation already exists with this user
        const existingConversation = conversations.find(conv =>
          conv.participants.some(p => p.id === parseInt(withUserId))
        );

        if (existingConversation) {
          await selectConversation(existingConversation);
        } else {
          // Create new conversation
          if (!withUserId || !currentUserId) return;

          try {
            setIsCreatingConversation(true);
            const conversation = await createConversation(
              `Consulta sobre anuncio #${postId}`,
              [currentUserId, parseInt(withUserId)]
            );
            
            // Find and select the new conversation
            const newConv = conversations.find(c => c.id === conversation.id);
            if (newConv) {
              await selectConversation(newConv);
            }
          } catch (err) {
            console.error('Error creating conversation:', err);
          } finally {
            setIsCreatingConversation(false);
          }
        }
      }
    };

    initConversation();
  }, [postId, withUserId, currentUserId, conversations, selectConversation, createConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    try {
      await sendMessage(selectedConversation.id, newMessage.trim(), currentUserId);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await markAsRead(messageId);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  return (
    <>
      <NavBar />
      <div className="background-primary min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <GoBackButton />
            <h1 className="h1 font-caprasimo text-3xl text-[#51344D] mt-4">
              Mensajes
            </h1>
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* Conversations List */}
            <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
              <h2 className="font-caprasimo text-lg text-[#51344D] mb-4">
                Conversaciones
              </h2>
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation?.id || null}
                onSelectConversation={selectConversation}
                loading={loading}
              />
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-[#51344D]">
                      {selectedConversation.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.participants
                        .filter(p => p.id !== currentUserId)
                        .map(p => `${p.name} ${p.lastName}`)
                        .join(', ')}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {loading && messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Cargando mensajes...</div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">No hay mensajes</div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isCurrentUser={message.senderId === currentUserId}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51344D]"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || loading}
                        className="px-4 py-2 bg-[#51344D] text-white rounded-md hover:bg-[#6a4f66] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Enviar
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  {isCreatingConversation ? (
                    <div className="text-[#51344D]">Creando conversación...</div>
                  ) : (
                    <div className="text-gray-500">
                      Selecciona una conversación para comenzar
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
