import mysql from 'mysql2/promise';
import { config } from '../config/env.js';

export const dbPool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10
});

export async function testDbConnection() {
  await dbPool.query('SELECT 1');
}