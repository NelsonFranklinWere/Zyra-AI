import { Redis } from 'ioredis';
import { getRedis } from '../config/redis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RateLimitConfig {
  limit: number; // Max requests
  windowMs: number; // Time window in milliseconds
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const redis = getRedis();

  if (redis) {
    // Redis-based rate limiting using token bucket
    const redisKey = `rate_limit:${key}`;
    const now = Date.now();

    // Get current count
    const current = await redis.get(redisKey);
    const count = current ? parseInt(current) : 0;

    if (count >= config.limit) {
      // Get TTL to calculate reset time
      const ttl = await redis.ttl(redisKey);
      const resetAt = new Date(now + (ttl > 0 ? ttl * 1000 : config.windowMs));

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Increment counter
    const multi = redis.multi();
    multi.incr(redisKey);
    multi.expire(redisKey, Math.ceil(config.windowMs / 1000));
    await multi.exec();

    const resetAt = new Date(now + config.windowMs);

    return {
      allowed: true,
      remaining: config.limit - count - 1,
      resetAt,
    };
  } else {
    // Fallback to DB-based rate limiting
    const record = await prisma.rateLimit.findUnique({
      where: { key },
    });

    const now = new Date();
    const resetAt = record?.resetAt || new Date(now.getTime() + config.windowMs);

    if (!record || now > record.resetAt) {
      // Create or reset
      await prisma.rateLimit.upsert({
        where: { key },
        update: {
          count: 1,
          resetAt,
          limit: config.limit,
          windowMs: config.windowMs,
        },
        create: {
          key,
          count: 1,
          resetAt,
          limit: config.limit,
          windowMs: config.windowMs,
        },
      });

      return {
        allowed: true,
        remaining: config.limit - 1,
        resetAt,
      };
    }

    if (record.count >= config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      };
    }

    // Increment
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        count: { increment: 1 },
      },
    });

    return {
      allowed: true,
      remaining: config.limit - updated.count,
      resetAt: updated.resetAt,
    };
  }
}

export async function checkOrgRateLimit(
  orgId: string,
  type: 'message' | 'llm' | 'stk',
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = `org:${orgId}:${type}`;
  return checkRateLimit(key, config);
}

export async function checkPhoneRateLimit(
  phoneNumber: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = `phone:${phoneNumber}`;
  return checkRateLimit(key, config);
}

