import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalyticsEvent {
  orgId?: string;
  eventType: string;
  payload: Record<string, any>;
}

export async function createAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        orgId: event.orgId,
        eventType: event.eventType,
        payload: event.payload,
      },
    });
  } catch (error) {
    console.error('Failed to create analytics event:', error);
    // Don't throw - analytics should not break main flow
  }
}

export async function getAnalyticsEvents(orgId: string, filters?: {
  eventType?: string;
  limit?: number;
  since?: Date;
}) {
  return prisma.analyticsEvent.findMany({
    where: {
      orgId,
      ...(filters?.eventType && { eventType: filters.eventType }),
      ...(filters?.since && { createdAt: { gte: filters.since } }),
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 100,
  });
}

