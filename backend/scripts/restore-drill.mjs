/** Runs only against the repository's disposable MySQL test service. Never seeds or resets it. */
import { PrismaClient } from '@prisma/client';
import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const backend = fileURLToPath(new URL('..', import.meta.url));
const compose = resolve(backend, '../compose.e2e.yml');
const sourceUrl = 'mysql://root:e2e@127.0.0.1:33306/huellas_e2e';
const recoveryName = `huellas_restore_${randomBytes(6).toString('hex')}`;
const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } });
const target = new PrismaClient({ datasources: { db: { url: sourceUrl.replace('/huellas_e2e', `/${recoveryName}`) } } });
const scratch = await mkdtemp(join(tmpdir(), 'huellas-recovery-drill-'));
const keyFile = join(scratch, 'key');
const archive = join(scratch, 'test.huellas-backup');
let userId;
function run(action, extra = [], file = archive, key = keyFile) {
  return execFileSync(process.execPath, ['scripts/database-backup.mjs', action, '--compose', compose, '--file', file, '--key-file', key, ...extra], { cwd: backend, stdio: 'pipe', timeout: 60000 });
}
try {
  execFileSync('pnpm', ['prisma:deploy'], { cwd: backend, env: { ...process.env, DATABASE_URL: sourceUrl }, stdio: 'pipe', timeout: 60000 });
  const owner = await source.user.create({ data: { name: 'Recovery', last_name: 'Fixture', email: `recovery-${randomUUID()}@example.test`, password: 'synthetic-password-hash', type: 'owner', owner: { create: {} } } });
  userId = owner.id;
  const pet = await source.pet.create({ data: { name: 'Recovery fixture', type: 'cat', owner_id: owner.id, birth_date: new Date('2020-01-01'), size: 'small', sex: 'female', has_passport: false, allergies: 'Synthetic allergy' } });
  const event = await source.healthEvent.create({ data: { pet_id: pet.id, entered_by: owner.id, type: 'GENERAL_CHECKUP', occurred_at: new Date('2026-01-01'), title: 'Synthetic checkup', notes: 'Synthetic clinical note' } });
  const document = await source.healthDocument.create({ data: { pet_id: pet.id, health_event_id: event.id, file_name: 'fixture.bin', mime_type: 'application/octet-stream', size_bytes: 5, content: Uint8Array.from([0, 255, 128, 39, 10]) } });
  await writeFile(keyFile, randomBytes(32), { mode: 0o600 });
  run('backup');
  assert.equal((await stat(archive)).mode & 0o777, 0o600);
  const encrypted = await readFile(archive);
  assert.equal(encrypted.includes(Buffer.from('Synthetic clinical note')), false);
  assert.throws(() => run('backup')); // Exclusive creation, never overwrite a good archive.
  assert.throws(() => run('restore', ['--database', 'huellas_e2e']));
  const wrongKey = join(scratch, 'wrong-key');
  await writeFile(wrongKey, randomBytes(32), { mode: 0o600 });
  assert.throws(() => run('restore', ['--database', recoveryName], archive, wrongKey));
  const damaged = join(scratch, 'damaged.huellas-backup');
  encrypted[25] ^= 1;
  await writeFile(damaged, encrypted, { mode: 0o600 });
  assert.throws(() => run('restore', ['--database', recoveryName], damaged));
  const before = await source.$queryRaw`SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ${recoveryName}`;
  assert.equal(before.length, 0); // Authentication failures must create no target.
  run('restore', ['--database', recoveryName]);
  assert.deepEqual(await target.user.findUnique({ where: { id: owner.id } }), owner);
  assert.deepEqual(await target.pet.findUnique({ where: { id: pet.id } }), pet);
  assert.deepEqual(await target.healthEvent.findUnique({ where: { id: event.id } }), event);
  assert.deepEqual(await target.healthDocument.findUnique({ where: { id: document.id } }), document);
  const migrations = await source.$queryRaw`SELECT migration_name, checksum FROM _prisma_migrations ORDER BY migration_name`;
  assert.deepEqual(await target.$queryRaw`SELECT migration_name, checksum FROM _prisma_migrations ORDER BY migration_name`, migrations);
  assert.throws(() => run('restore', ['--database', recoveryName]));
  assert.deepEqual(await source.pet.findUnique({ where: { id: pet.id } }), pet);
  // Verify restored foreign keys enforce the same ownership relationship.
  await assert.rejects(target.pet.create({ data: { ...pet, id: undefined, owner_id: 2147483647 } }));
  process.stdout.write('PASS: encrypted backup, owner-only permissions, tamper/wrong-key rejection, no overwrite, records/blobs/migrations restored, foreign keys preserved, source unchanged.\n');
} finally {
  await target.$disconnect();
  // Only this invocation's random recovery schema and its own fixture are removed.
  await source.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${recoveryName}\``);
  if (userId) {
    await source.pet.deleteMany({ where: { owner_id: userId } });
    await source.user.delete({ where: { id: userId } });
  }
  await source.$disconnect();
  await rm(scratch, { recursive: true, force: true });
}
