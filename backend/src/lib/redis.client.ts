import Redis from 'ioredis';
import { env } from '../env';
import crypto from 'crypto';

let redisClient: Redis | null = null;

/**
 * Get or create Redis client singleton
 */
export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis client connected');
    });
  }

  return redisClient;
}

/**
 * Connect to Redis
 */
export async function connectRedisClient(): Promise<void> {
  const client = getRedisClient();
  if (client) {
    await client.connect();
  }
}

/**
 * Cache helper: Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Cache helper: Set value in cache with TTL
 */
export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
    return false;
  }
}

/**
 * Cache helper: Delete key
 */
export async function cacheDelete(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Cache helper: Invalidate pattern
 */
export async function cacheInvalidate(pattern: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    return await client.del(...keys);
  } catch (error) {
    console.error(`Cache invalidate error for pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Distributed lock helper
 */
export async function acquireLock(
  key: string,
  ttlMs: number = 3000,
  retries: number = 10,
  retryDelayMs: number = 100
): Promise<string | null> {
  const client = getRedisClient();
  if (!client) return null;

  const lockToken = crypto.randomBytes(16).toString('hex');
  const lockKey = `lock:${key}`;

  for (let i = 0; i < retries; i++) {
    try {
      const result = await client.set(lockKey, lockToken, 'PX', ttlMs, 'NX');
      if (result === 'OK') {
        return lockToken;
      }
    } catch (error) {
      console.error(`Lock acquisition error for key ${key}:`, error);
    }

    if (i < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return null;
}

/**
 * Release distributed lock
 */
export async function releaseLock(key: string, token: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  const lockKey = `lock:${key}`;

  try {
    // Lua script to ensure we only delete our own lock
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await client.eval(script, 1, lockKey, token);
    return result === 1;
  } catch (error) {
    console.error(`Lock release error for key ${key}:`, error);
    return false;
  }
}

/**
 * Execute function with distributed lock
 */
export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  options?: { ttlMs?: number; retries?: number; retryDelayMs?: number }
): Promise<T> {
  const ttlMs = options?.ttlMs || env.REDIS_LOCK_TTL;
  const lockToken = await acquireLock(key, ttlMs, options?.retries, options?.retryDelayMs);

  if (!lockToken) {
    throw new Error(`Failed to acquire lock for key: ${key}`);
  }

  try {
    return await fn();
  } finally {
    await releaseLock(key, lockToken);
  }
}

