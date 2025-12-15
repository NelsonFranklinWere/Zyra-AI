import Redis from 'ioredis';
import { env } from '../env';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  if (!env.REDIS_URL) {
    console.log('⚠️  REDIS_URL not set, skipping Redis connection');
    return;
  }

  const client = getRedis();
  if (client) {
    await client.connect();
  }
}

