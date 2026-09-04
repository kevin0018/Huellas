import { prisma } from '../db/prisma.js';
import { testDbConnection } from '../db/pool.js';
import { RedisService } from '../config/RedisService.js';
import { createReadiness } from './readiness.js';

export function createDependencyReadiness() {
  return createReadiness({
    prisma: () => prisma.$queryRaw`SELECT 1`,
    mysql: testDbConnection,
    redis: async () => {
      const client = RedisService.getInstance().getClient();
      if (!client.isReady) throw new Error('Redis unavailable');
      await client.ping();
    },
  });
}
