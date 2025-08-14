import { RedisService } from '../../../../config/RedisService.js';

export class JwtBlacklist {
  private static fallbackTokens = new Set<string>();
  private static redisService = RedisService.getInstance();

  /**
   * Add token to blacklist (for logout)
   */
  static async addToken(token: string): Promise<void> {
    try {
      if (this.redisService.isRedisConnected()) {
        const client = this.redisService.getClient();
        // Store with 24h expiration
        await client.setEx(`blacklist:${token}`, 86400, 'revoked');
      } else {
        // Fallback to memory if Redis is down
        this.fallbackTokens.add(token);
      }
    } catch (error) {
      console.error('Error adding token to blacklist:', error);
      // Fallback to memory on error
      this.fallbackTokens.add(token);
    }
  }

  /**
   * Check if token is blacklisted
   */
  static async isBlacklisted(token: string): Promise<boolean> {
    try {
      if (this.redisService.isRedisConnected()) {
        const client = this.redisService.getClient();
        const result = await client.get(`blacklist:${token}`);
        return result === 'revoked';
      } else {
        // Fallback to memory if Redis is down
        return this.fallbackTokens.has(token);
      }
    } catch (error) {
      console.error('Error checking blacklist:', error);
      // Fallback to memory on error
      return this.fallbackTokens.has(token);
    }
  }

  /**
   * Get blacklist size
   */
  static async size(): Promise<number> {
    try {
      if (this.redisService.isRedisConnected()) {
        const client = this.redisService.getClient();
        const keys = await client.keys('blacklist:*');
        return keys.length;
      } else {
        return this.fallbackTokens.size;
      }
    } catch (error) {
      console.error('Error getting blacklist size:', error);
      return this.fallbackTokens.size;
    }
  }

  /**
   * Clear expired tokens
   */
  static clearExpired(): void {
    this.fallbackTokens.clear();
  }
}
