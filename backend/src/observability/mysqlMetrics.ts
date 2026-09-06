import type { RowDataPacket } from 'mysql2/promise';
import { dbPool } from '../db/pool.js';
import { metrics } from './metrics.js';

let pending: Promise<void> | undefined;
let expiresAt = 0;
/** Cached and shared so concurrent scrapes cannot exhaust the SQL pool. */
export async function collectMysqlMetrics(): Promise<void> {
  if (Date.now() < expiresAt) return;
  if (!pending) {
    pending = (async () => {
      try {
        const [rows] = await dbPool.query<RowDataPacket[]>({
          sql: "SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_connected', 'Threads_running')", timeout: 1000,
        });
        const value = (name: string) => Number(rows.find(row => row.Variable_name === name)?.Value);
        const connected = value('Threads_connected');
        const running = value('Threads_running');
        if (!Number.isFinite(connected) || !Number.isFinite(running)) throw new Error('Invalid connection sample');
        metrics.observeConnections({ connected, running });
      } catch { metrics.observeConnections(null); }
      finally { expiresAt = Date.now() + 5000; pending = undefined; }
    })();
  }
  // Pool acquisition has no mysql2 query timeout: bound the response as well.
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([pending, new Promise<void>(resolve => {
      timer = setTimeout(() => { metrics.observeConnections(null); resolve(); }, 1500);
    })]);
  } finally { clearTimeout(timer); }
}
