import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;
  private isConnected = false;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });

    // Error handling
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis disconnected');
      this.isConnected = false;
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
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
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
    return this.isConnected;
  }
}
