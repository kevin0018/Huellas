import { createClient, RedisClientType } from 'redis';
import { logger } from '../observability/logger.js';

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379',
      disableOfflineQueue: true,
      socket: { connectTimeout: 1500 },
    });

    // Error handling
    this.client.on('error', (err) => {
      logger.error('redis.error', err);
    });

    this.client.on('ready', () => {
      logger.info('redis.ready');
    });

    this.client.on('end', () => {
      logger.info('redis.closed');
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  /**
   * Get the Redis client
   */
  getClient(): RedisClientType {
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.client.isReady;
  }
}
