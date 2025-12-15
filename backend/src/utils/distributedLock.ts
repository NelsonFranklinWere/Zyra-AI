import { Redis } from 'ioredis';
import { getRedis } from '../config/redis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LockOptions {
  ttl: number; // TTL in milliseconds
  retryDelay: number; // Delay between retries in milliseconds
  maxRetries: number; // Maximum number of retries
}

const defaultOptions: LockOptions = {
  ttl: 5000, // 5 seconds
  retryDelay: 100, // 100ms
  maxRetries: 10, // 10 retries = 1 second max wait
};

export class DistributedLock {
  private redis: Redis | null;
  private key: string;
  private token: string;
  private ttl: number;

  constructor(key: string, ttl: number = 5000) {
    this.redis = getRedis();
    this.key = `lock:${key}`;
    this.token = `${Date.now()}-${Math.random().toString(36)}`;
    this.ttl = ttl;
  }

  async acquire(): Promise<boolean> {
    if (this.redis) {
      // Redis-based lock
      const result = await this.redis.set(
        this.key,
        this.token,
        'PX',
        this.ttl,
        'NX' // Only set if not exists
      );

      return result === 'OK';
    } else {
      // Fallback to DB-based lock (less efficient but works)
      try {
        await prisma.$executeRaw`
          INSERT INTO distributed_locks (key, token, expires_at)
          VALUES (${this.key}, ${this.token}, ${new Date(Date.now() + this.ttl)})
          ON CONFLICT (key) DO NOTHING
        `;

        // Verify we got the lock
        const lock = await prisma.$queryRaw<Array<{ token: string }>>`
          SELECT token FROM distributed_locks
          WHERE key = ${this.key} AND expires_at > NOW()
        `;

        return lock.length > 0 && lock[0].token === this.token;
      } catch (error) {
        // Lock already exists
        return false;
      }
    }
  }

  async release(): Promise<void> {
    if (this.redis) {
      // Lua script to ensure we only delete our own lock
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      await this.redis.eval(script, 1, this.key, this.token);
    } else {
      // DB-based release
      await prisma.$executeRaw`
        DELETE FROM distributed_locks
        WHERE key = ${this.key} AND token = ${this.token}
      `;
    }
  }

  async extend(additionalTtl: number): Promise<boolean> {
    if (this.redis) {
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("pexpire", KEYS[1], ARGV[2])
        else
          return 0
        end
      `;

      const result = await this.redis.eval(
        script,
        1,
        this.key,
        this.token,
        this.ttl + additionalTtl
      );

      return result === 1;
    } else {
      await prisma.$executeRaw`
        UPDATE distributed_locks
        SET expires_at = NOW() + INTERVAL '${additionalTtl} milliseconds'
        WHERE key = ${this.key} AND token = ${this.token}
      `;
      return true;
    }
  }
}

export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  options: Partial<LockOptions> = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  const lock = new DistributedLock(key, opts.ttl);

  let acquired = false;
  let retries = 0;

  while (!acquired && retries < opts.maxRetries) {
    acquired = await lock.acquire();
    if (!acquired) {
      await new Promise((resolve) => setTimeout(resolve, opts.retryDelay));
      retries++;
    }
  }

  if (!acquired) {
    throw new Error(`Failed to acquire lock for key: ${key} after ${opts.maxRetries} retries`);
  }

  try {
    const result = await fn();
    return result;
  } finally {
    await lock.release();
  }
}

