import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authGuard } from '../../middleware/authGuard';
import { requireRole } from '../../middleware/roleGuard';
import { PrismaClient } from '@prisma/client';
import { getOrgLLMUsage } from '../../services/llmUsage.service';

const prisma = new PrismaClient();

export async function organizationAdminRoutes(app: FastifyInstance) {
  // Get organization usage/billing
  app.get(
    '/organizations/:id/usage',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const { startDate, endDate } = request.query as any;

        const org = await prisma.organization.findUnique({
          where: { id },
        });

        if (!org) {
          return reply.code(404).send({
            success: false,
            message: 'Organization not found',
          });
        }

        // Get LLM usage (with fallback)
        let llmUsage;
        try {
          llmUsage = await getOrgLLMUsage(
            id,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
          );
        } catch (error) {
          // Fallback if aiUsage table doesn't exist
          llmUsage = {
            totalCalls: 0,
            totalTokens: 0,
            totalCostCents: 0,
            dailyUsage: [],
          };
        }

        // Get message counts
        const messageCounts = await prisma.message.groupBy({
          by: ['direction'],
          where: {
            conversation: { orgId: id },
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          },
          _count: true,
        });

        // Get order counts
        const orderCounts = await prisma.order.groupBy({
          by: ['paymentStatus'],
          where: {
            orgId: id,
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          },
          _count: true,
        });

        return reply.send({
          success: true,
          data: {
            organization: {
              id: org.id,
              name: org.name,
              automationEnabled: org.automationEnabled,
              llmBudgetDaily: org.llmBudgetDaily,
            },
            llmUsage,
            messages: {
              inbound: messageCounts.find((m) => m.direction === 'inbound')?._count || 0,
              outbound: messageCounts.find((m) => m.direction === 'outbound')?._count || 0,
            },
            orders: {
              total: orderCounts.reduce((sum, o) => sum + o._count, 0),
              pending: orderCounts.find((o) => o.paymentStatus === 'PENDING')?._count || 0,
              paid: orderCounts.find((o) => o.paymentStatus === 'PAID')?._count || 0,
            },
          },
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Pause/resume organization automation
  app.put(
    '/organizations/:id/automation',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const { enabled } = request.body as any;
        const user = (request as any).user;

        await prisma.organization.update({
          where: { id },
          data: {
            automationEnabled: enabled !== false,
          },
        });

        // Create audit log
        const { createAuditLog } = await import('../../services/auditLog');
        await createAuditLog({
          userId: user.id,
          orgId: id,
          action: enabled ? 'AUTOMATION_ENABLED' : 'AUTOMATION_DISABLED',
          resource: 'organization',
          resourceId: id,
        });

        return reply.send({
          success: true,
          message: `Automation ${enabled ? 'enabled' : 'disabled'}`,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );
}

