import { Server } from 'socket.io';

export class SocketIOService {
  private static instance: SocketIOService | null = null;
  private io: Server | null = null;

  private constructor() {}

  static getInstance(): SocketIOService {
    if (!SocketIOService.instance) {
      SocketIOService.instance = new SocketIOService();
    }
    return SocketIOService.instance;
  }

  setIO(io: Server): void {
    this.io = io;
  }

  getIO(): Server | null {
    return this.io;
  }

  // Emit a new message to conversation participants
  emitNewMessage(conversationId: number, participantIds: number[], messageData: any): void {
    if (!this.io) {
      console.warn('[SocketIOService] Socket.IO not initialized');
      return;
    }

    participantIds.forEach(participantId => {
      this.io!.to(`user:${participantId}`).emit('new-message', messageData);
    });
  }

  // Emit message read status
  emitMessageRead(messageId: number, userId: number): void {
    if (!this.io) {
      console.warn('[SocketIOService] Socket.IO not initialized');
      return;
    }

    this.io.emit('message-read', { messageId, userId });
  }
}
