import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess, requireRole } from '../middleware/roleGuard';
import {
  simulateMessage,
  simulatePayment,
  getConversationAudit,
  getTemplates,
  createTemplateHandler,
  updateTemplateHandler,
  deleteTemplateHandler,
  getOrdersList,
  getOrderDetails,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  getAnalytics,
} from '../controllers/admin.controller';

export async function adminRoutes(app: FastifyInstance) {
  // Simulate endpoints (protected, owner/admin only)
  app.post(
    '/simulate/message',
    {
      preHandler: [authGuard, requireOrgAccess, requireRole('OWNER', 'ADMIN')],
    },
    simulateMessage
  );

  app.post(
    '/simulate/payment/:attemptId/success',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    simulatePayment
  );

  // Templates CRUD
  app.get(
    '/templates',
    { preHandler: [authGuard, requireOrgAccess] },
    getTemplates
  );

  app.post(
    '/templates',
    {
      preHandler: [authGuard, requireOrgAccess, requireRole('OWNER', 'ADMIN')],
    },
    createTemplateHandler
  );

  app.put(
    '/templates/:name',
    {
      preHandler: [authGuard, requireOrgAccess, requireRole('OWNER', 'ADMIN')],
    },
    updateTemplateHandler
  );

  app.delete(
    '/templates/:name',
    {
      preHandler: [authGuard, requireOrgAccess, requireRole('OWNER', 'ADMIN')],
    },
    deleteTemplateHandler
  );

  // Rules CRUD
  app.get(
    '/rules',
    { preHandler: [authGuard, requireOrgAccess] },
    getRules
  );

  app.post(
    '/rules',
    {
      preHandler: [authGuard, requireOrgAccess, requireRole('OWNER', 'ADMIN')],
    },
    createRule
  );

  app.put(
    '/rules/:id',
    {
      preHandler: [authGuard, requireOrgAccess, requireRole('OWNER', 'ADMIN')],
    },
    updateRule
  );

  app.delete(
    '/rules/:id',
    {
      preHandler: [authGuard, requireOrgAccess, requireRole('OWNER', 'ADMIN')],
    },
    deleteRule
  );

  // Conversations
  app.get(
    '/conversations',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        const conversations = await prisma.conversation.findMany({
          where: { orgId },
          orderBy: { updatedAt: 'desc' },
          include: {
            _count: {
              select: { messages: true },
            },
          },
        });

        return reply.send({ success: true, data: conversations });
      } catch (error: any) {
        return reply.code(500).send({ success: false, message: error.message });
      }
    }
  );

  app.get(
    '/conversations/:id',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        const { id } = request.params as any;
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        const conversation = await prisma.conversation.findFirst({
          where: { id, orgId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });

        if (!conversation) {
          return reply.code(404).send({ success: false, message: 'Conversation not found' });
        }

        return reply.send({ success: true, data: conversation });
      } catch (error: any) {
        return reply.code(500).send({ success: false, message: error.message });
      }
    }
  );

  app.get(
    '/conversations/:id/messages',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        const { id } = request.params as any;
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        const conversation = await prisma.conversation.findFirst({
          where: { id, orgId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });

        if (!conversation) {
          return reply.code(404).send({ success: false, message: 'Conversation not found' });
        }

        return reply.send({ success: true, data: conversation });
      } catch (error: any) {
        return reply.code(500).send({ success: false, message: error.message });
      }
    }
  );

  app.post(
    '/conversations/:id/escalate',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        const { id } = request.params as any;
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        await prisma.conversation.updateMany({
          where: { id, orgId },
          data: { requiresHuman: true },
        });

        return reply.send({ success: true, message: 'Conversation escalated' });
      } catch (error: any) {
        return reply.code(500).send({ success: false, message: error.message });
      }
    }
  );

  // Conversations audit
  app.get(
    '/conversations/:id/audit',
    { preHandler: [authGuard, requireOrgAccess] },
    getConversationAudit
  );

  // Orders
  app.get(
    '/orders',
    { preHandler: [authGuard, requireOrgAccess] },
    getOrdersList
  );

  app.get(
    '/orders/:id',
    { preHandler: [authGuard, requireOrgAccess] },
    getOrderDetails
  );

  // Analytics
  app.get(
    '/analytics',
    { preHandler: [authGuard, requireOrgAccess] },
    getAnalytics
  );

  // DLQ routes
  try {
    const { dlqRoutes } = await import('./admin/dlq');
    await app.register(dlqRoutes);
  } catch (e) {
    // DLQ routes may not be available
  }

  // Payment admin routes
  try {
    const { paymentAdminRoutes } = await import('./admin/payment');
    await app.register(paymentAdminRoutes);
  } catch (e) {
    // Payment admin routes may not be available
  }

  // Moderation routes
  try {
    const { moderationRoutes } = await import('./admin/moderation');
    await app.register(moderationRoutes);
  } catch (e) {
    // Moderation routes may not be available
  }

  // Organization admin routes
  try {
    const { organizationAdminRoutes } = await import('./admin/organization');
    await app.register(organizationAdminRoutes);
  } catch (e) {
    // Organization admin routes may not be available
  }
}

