import { PrismaClient } from '@prisma/client';
import { cacheGet, cacheSet, cacheInvalidate } from '../../../lib/redis.client';

const prisma = new PrismaClient();

/**
 * Get business memory for organization
 */
export async function getBusinessMemory(orgId: string): Promise<any | null> {
  // Check cache first
  const cacheKey = `business_memory:${orgId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return cached;
  }

  // Load from database
  const memory = await prisma.businessMemory.findUnique({
    where: { orgId },
  });

  if (memory) {
    // Cache for 5 minutes
    await cacheSet(cacheKey, memory, 300);
    return memory;
  }

  return null;
}

/**
 * Update business memory
 */
export async function updateBusinessMemory(
  orgId: string,
  patch: {
    faqs?: Array<{ q: string; a: string }>;
    instructions?: Record<string, any>;
    negotiationRules?: Record<string, any>;
    deliveryRules?: Record<string, any>;
  }
): Promise<any> {
  const existing = await prisma.businessMemory.findUnique({
    where: { orgId },
  });

  let memory;
  if (existing) {
    memory = await prisma.businessMemory.update({
      where: { orgId },
      data: {
        faqs: patch.faqs !== undefined ? patch.faqs : existing.faqs,
        instructions: patch.instructions !== undefined ? patch.instructions : existing.instructions,
        negotiationRules: patch.negotiationRules !== undefined ? patch.negotiationRules : existing.negotiationRules,
        deliveryRules: patch.deliveryRules !== undefined ? patch.deliveryRules : existing.deliveryRules,
      },
    });
  } else {
    memory = await prisma.businessMemory.create({
      data: {
        orgId,
        faqs: patch.faqs,
        instructions: patch.instructions,
        negotiationRules: patch.negotiationRules,
        deliveryRules: patch.deliveryRules,
      },
    });
  }

  // Invalidate cache
  await cacheInvalidate(`business_memory:${orgId}`);

  return memory;
}

/**
 * Get session memory
 */
export async function getSessionMemory(sessionKey: string, orgId: string): Promise<any | null> {
  const session = await prisma.aISessionMemory.findFirst({
    where: {
      sessionKey,
      orgId,
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (!session) {
    return null;
  }

  // Check TTL
  if (session.ttlSeconds) {
    const ageSeconds = Math.floor((Date.now() - session.createdAt.getTime()) / 1000);
    if (ageSeconds > session.ttlSeconds) {
      // Expired, delete it
      await prisma.aISessionMemory.delete({
        where: { id: session.id },
      });
      return null;
    }
  }

  return session.memory as any;
}

/**
 * Update session memory
 */
export async function updateSessionMemory(
  sessionKey: string,
  orgId: string,
  memory: any,
  ttlSeconds?: number
): Promise<void> {
  const existing = await prisma.aISessionMemory.findFirst({
    where: {
      sessionKey,
      orgId,
    },
  });

  if (existing) {
    await prisma.aISessionMemory.update({
      where: { id: existing.id },
      data: {
        memory,
        ...(ttlSeconds !== undefined && { ttlSeconds }),
      },
    });
  } else {
    await prisma.aISessionMemory.create({
      data: {
        sessionKey,
        orgId,
        memory,
        ttlSeconds: ttlSeconds || 3600, // Default 1 hour
      },
    });
  }
}

/**
 * Delete session memory
 */
export async function deleteSessionMemory(sessionKey: string, orgId: string): Promise<void> {
  await prisma.aISessionMemory.deleteMany({
    where: {
      sessionKey,
      orgId,
    },
  });
}

