/** Isolated E2E bootstrap. Never runs the destructive development seed. */
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

if (process.env.NODE_ENV !== 'test' || !process.env.DATABASE_URL ||
    new URL(process.env.DATABASE_URL).pathname !== '/huellas_e2e' || process.env.DB_NAME !== 'huellas_e2e') {
  throw new Error('E2E server requires NODE_ENV=test and the dedicated huellas_e2e database');
}
if (!process.env.REDIS_URL || new URL(process.env.REDIS_URL).pathname !== '/15') {
  throw new Error('E2E server requires the dedicated Redis database 15');
}

execFileSync('pnpm', ['prisma:deploy'], { stdio: 'inherit' });
const database = new PrismaClient();
try {
  await database.procedureSchedule.upsert({
    where: { animal_type_procedure_name: { animal_type: 'cat', procedure_name: 'E2E annual checkup' } },
    update: {},
    create: {
      animal_type: 'cat', procedure_name: 'E2E annual checkup',
      recommended_vaccines_age: 8, procedure_type: 'GENERAL_CHECKUP', recurrence_days: 365,
      source: 'Automated test fixture', version: 'e2e',
    },
  });
} finally {
  await database.$disconnect();
}
// Fail the suite if Redis is unavailable instead of silently using memory.
const redis = createClient({ url: process.env.REDIS_URL, socket: { reconnectStrategy: false } });
redis.on('error', () => {});
await redis.connect();
// Reset only the dedicated test database so repeated runs retain real rate limits.
await redis.flushDb();
await redis.quit();
await import('../index.js');
