import { Server, Socket } from 'socket.io';

export class ChatSocketHandler {
  static handleConnection(io: Server): void {
    io.on('connection', (socket: Socket) => {
      // Join user to their personal room

      socket.on('join-user-room', (userId: number) => {
        // TODO: Join user to their personal room
        socket.join(`user:${userId}`);
      });

      // Handle new message

      socket.on('send-message', async (data: any) => {
        // TODO: Handle new message, persist and emit to participants
        // Example: io.to(`user:${receiverId}`).emit('new-message', message)
      });

      // Handle message read

      socket.on('mark-read', async (data: any) => {
        // TODO: Mark message as read and notify sender
      });

      // Handle typing indicators

      socket.on('typing', (data: any) => {
        // TODO: Emit typing indicator to other participant
      });
      socket.on('stop-typing', (data: any) => {
        // TODO: Emit stop typing indicator
      });
    });
  }
}
