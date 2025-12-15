import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { getRedis } from '../config/redis';

const prisma = new PrismaClient();

export interface IdempotencyRecord {
  key: string;
  response: any;
  expiresAt: Date;
}

// Store idempotency records in Redis with TTL
export async function checkIdempotency(
  key: string,
  ttlSeconds: number = 3600
): Promise<{ exists: boolean; response?: any }> {
  const redis = getRedis();
  
  if (redis) {
    const cached = await redis.get(`idempotency:${key}`);
    if (cached) {
      return { exists: true, response: JSON.parse(cached) };
    }
  }

  // Fallback to DB if Redis not available
  const record = await prisma.idempotencyKey.findUnique({
    where: { key },
  });

  if (record && record.expiresAt > new Date()) {
    return { exists: true, response: record.response };
  }

  return { exists: false };
}

export async function storeIdempotency(
  key: string,
  response: any,
  ttlSeconds: number = 3600
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  const redis = getRedis();
  
  if (redis) {
    await redis.setex(
      `idempotency:${key}`,
      ttlSeconds,
      JSON.stringify(response)
    );
  }

  // Also store in DB for persistence
  await prisma.idempotencyKey.upsert({
    where: { key },
    update: {
      response: response as any,
      expiresAt,
    },
    create: {
      key,
      response: response as any,
      expiresAt,
    },
  });
}

export async function getIdempotencyKey(request: any): Promise<string | null> {
  // Check header first
  const headerKey = request.headers['x-idempotency-key'];
  if (headerKey) {
    return headerKey;
  }

  // Fallback to provider message ID
  const body = request.body || {};
  return body.id || body.messageId || body.message?.id || null;
}

