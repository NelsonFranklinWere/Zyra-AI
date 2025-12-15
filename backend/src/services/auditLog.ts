import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogData {
  userId?: string;
  orgId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        orgId: data.orgId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        metadata: data.metadata || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

export async function getAuditLogs(filters: {
  userId?: string;
  orgId?: string;
  action?: string;
  limit?: number;
}): Promise<any[]> {
  return prisma.auditLog.findMany({
    where: {
      userId: filters.userId,
      orgId: filters.orgId,
      action: filters.action,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: filters.limit || 100,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

