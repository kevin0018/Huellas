// Temporary type declarations to resolve Prisma client issues
// This file can be removed once Prisma types are properly synchronized

declare module '@prisma/client' {
  export interface PrismaClient {
    conversation: {
      findUnique: (args: any) => Promise<any>;
      findMany: (args: any) => Promise<any[]>;
      create: (args: any) => Promise<any>;
      update: (args: any) => Promise<any>;
      delete: (args: any) => Promise<void>;
      findFirst: (args: any) => Promise<any | null>;
    };
    message: {
      findUnique: (args: any) => Promise<any>;
      findMany: (args: any) => Promise<any[]>;
      create: (args: any) => Promise<any>;
      update: (args: any) => Promise<any>;
      delete: (args: any) => Promise<void>;
      count: (args: any) => Promise<number>;
    };
    conversationParticipant: {
      findUnique: (args: any) => Promise<any>;
      findMany: (args: any) => Promise<any[]>;
      create: (args: any) => Promise<any>;
      update: (args: any) => Promise<any>;
      delete: (args: any) => Promise<void>;
    };
  }
}
