import type { PrismaClient } from '@prisma/client';
import { ArchiveConversationCommandHandler } from './app/commands/ArchiveConversationCommandHandler.js';
import { CreateConversationCommandHandler } from './app/commands/CreateConversationCommandHandler.js';
import { MarkMessageAsReadCommandHandler } from './app/commands/MarkMessageAsReadCommandHandler.js';
import { SendMessageCommandHandler } from './app/commands/SendMessageCommandHandler.js';
import { GetConversationsQueryHandler } from './app/queries/GetConversationsQueryHandler.js';
import { GetMessagesQueryHandler } from './app/queries/GetMessagesQueryHandler.js';
import { GetUnreadMessagesCountQueryHandler } from './app/queries/GetUnreadMessagesCountQueryHandler.js';
import { ChatController } from './infra/controllers/ChatController.js';
import { PrismaConversationRepository } from './infra/repositories/PrismaConversationRepository.js';
import { PrismaMessageRepository } from './infra/repositories/PrismaMessageRepository.js';

export interface ChatModule {
  controller: ChatController;
}

export function createChatModule(prisma: PrismaClient): ChatModule {
  const conversations = new PrismaConversationRepository(prisma);
  const messages = new PrismaMessageRepository(prisma);

  return {
    controller: new ChatController({
      conversationRepository: conversations,
      createConversation: new CreateConversationCommandHandler(conversations),
      sendMessage: new SendMessageCommandHandler(messages, conversations),
      markAsRead: new MarkMessageAsReadCommandHandler(messages, conversations),
      archiveConversation: new ArchiveConversationCommandHandler(conversations),
      getConversations: new GetConversationsQueryHandler(conversations),
      getMessages: new GetMessagesQueryHandler(messages, conversations),
      getUnreadCount: new GetUnreadMessagesCountQueryHandler(messages),
    }),
  };
}
