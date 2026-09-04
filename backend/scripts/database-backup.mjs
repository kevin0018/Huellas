import { spawn } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { readFile, open, unlink, mkdtemp, rm, stat } from 'node:fs/promises';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { createGzip, createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const magic = Buffer.from('HUELLAS1');
const { values, positionals } = parseArgs({ allowPositionals: true, options: {
  compose: { type: 'string' }, file: { type: 'string' }, 'key-file': { type: 'string' }, database: { type: 'string' },
} });
const [action] = positionals;
if (positionals.length !== 1 || !['backup', 'restore'].includes(action) || !values.compose || !values.file || !values['key-file']) {
  throw new Error('Use backup|restore --compose FILE --file ARCHIVE --key-file KEY [--database huellas_restore_NAME]');
}
const compose = resolve(values.compose);
const archive = resolve(values.file);
const keyPath = resolve(values['key-file']);
if (archive === keyPath) throw new Error('Archive and key paths must differ');
const keyStat = await stat(keyPath);
if ((keyStat.mode & 0o077) !== 0) throw new Error('Key file must be accessible only to its owner (chmod 600)');
const key = await readFile(keyPath);
if (key.length !== 32) throw new Error('Key file must contain exactly 32 random bytes');

function command(script, args = [], input = 'ignore') {
  const child = spawn('docker', ['compose', '-f', compose, 'exec', '-T', 'mysql', 'sh', '-c', script, 'huellas-backup', ...args], {
    stdio: [input, 'pipe', 'pipe'],
  });
  // Consume stderr without copying possible SQL, values or credentials to logs.
  child.stderr.resume();
  const done = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve() : reject(new Error('Database command failed; inspect the isolated target before retrying')));
  });
  // Attach immediately; pipeline and process failures are awaited together below.
  void done.catch(() => {});
  return { child, done };
}
const auth = 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; ';
let child;
try {
  if (action === 'backup') {
    if (values.database) throw new Error('Backup selects MYSQL_DATABASE from the Compose service');
    const handle = await open(archive, 'wx', 0o600);
    try {
      const iv = randomBytes(12);
      await handle.write(Buffer.concat([magic, iv]));
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      const task = command(auth + 'exec mysqldump -uroot --single-transaction --quick --hex-blob --no-tablespaces --set-gtid-purged=OFF --skip-add-locks --skip-comments "$MYSQL_DATABASE"');
      child = task.child;
      await Promise.all([task.done, pipeline(child.stdout, createGzip(), cipher, createWriteStream(archive, { flags: 'r+', start: 20 }))]);
      await handle.write(cipher.getAuthTag(), 0, 16, (await handle.stat()).size);
      await handle.sync();
    } catch (error) { child?.kill(); await unlink(archive); throw error; }
    finally { await handle.close(); }
    process.stdout.write('Encrypted MySQL backup created.\n');
  } else {
    const database = values.database;
    if (!database || !/^huellas_restore_[a-z0-9_]{1,40}$/.test(database)) throw new Error('Restore requires a new huellas_restore_NAME database');
    const scratch = await mkdtemp(join(tmpdir(), 'huellas-restore-'));
    try {
      const source = await open(archive, 'r');
      let iv, tag, size;
      try {
        size = (await source.stat()).size;
        if (size < 36) throw new Error('Invalid encrypted archive');
        const header = Buffer.alloc(20); tag = Buffer.alloc(16);
        await source.read(header, 0, 20, 0);
        await source.read(tag, 0, 16, size - 16);
        if (!header.subarray(0, 8).equals(magic)) throw new Error('Unsupported archive format');
        iv = header.subarray(8);
      } finally { await source.close(); }
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const verified = join(scratch, 'verified.sql.gz');
      // Authenticate the entire archive BEFORE executing any restored SQL.
      await pipeline(createReadStream(archive, { start: 20, end: size - 17 }), decipher, createWriteStream(verified, { flags: 'wx', mode: 0o600 }));
      const create = command(auth + 'exec mysql -uroot -e "CREATE DATABASE \\`$1\\` CHARACTER SET utf8mb4"', [database]);
      child = create.child; child.stdout.resume(); await create.done;
      const restore = command(auth + 'exec mysql -uroot "$1"', [database], 'pipe');
      child = restore.child; child.stdout.resume();
      await Promise.all([restore.done, pipeline(createReadStream(verified), createGunzip(), child.stdin)]);
      process.stdout.write('Archive restored into the new recovery database. Validate it before switching any application configuration.\n');
    } finally { await rm(scratch, { recursive: true, force: true }); }
  }
} catch {
  child?.kill();
  process.stderr.write('Backup/restore failed. No existing recovery database is overwritten.\n');
  process.exitCode = 1;
} finally { key.fill(0); }
