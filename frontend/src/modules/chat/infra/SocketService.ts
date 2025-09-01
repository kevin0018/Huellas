import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../auth/infra/AuthService';
import type { Message } from '../domain/Conversation';

type EventCallback = (data: unknown) => void;

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = AuthService.getToken();
    if (!token) {
      console.warn('[SocketService] No authentication token found');
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    this.socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to server');
      
      // Join user's personal room automatically
      const user = AuthService.getUser();
      if (user) {
        this.joinUserRoom(user.id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('[SocketService] Disconnected from server');
    });

    this.socket.on('error', (error: unknown) => {
      console.error('[SocketService] Socket error:', error);
    });

    // Listen for new messages
    this.socket.on('new-message', (message: Message) => {
      this.notifyListeners('new-message', message);
    });

    // Listen for message read status updates
    this.socket.on('message-read', (data: { messageId: number }) => {
      this.notifyListeners('message-read', data);
    });

    // Listen for when successfully joined a conversation
    this.socket.on('joined-conversation', (data: { conversationId: number }) => {
      this.notifyListeners('joined-conversation', data);
    });

    // Listen for conversation updates
    this.socket.on('conversation-updated', (data: { conversationId: number }) => {
      this.notifyListeners('conversation-updated', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  joinUserRoom(userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('join-user-room', userId);
    }
  }

  joinConversation(conversationId: number, userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('join-conversation', { conversationId, userId });
    }
  }

  leaveConversation(conversationId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-conversation', { conversationId });
    }
  }

  sendMessage(conversationId: number, content: string, senderId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('send-message', { conversationId, content, senderId });
    }
  }

  markMessageAsRead(messageId: number, userId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('mark-read', { messageId, userId });
    }
  }

  // Event listener management
  addEventListener(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();
