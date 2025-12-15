import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authGuard } from '../../middleware/authGuard';
import { requireRole, requireOrgAccess } from '../../middleware/roleGuard';
import { PrismaClient } from '@prisma/client';
import { approveTemplate, getPendingTemplates, validateTemplateContent } from '../../services/templateApproval.service';

const prisma = new PrismaClient();

export async function moderationRoutes(app: FastifyInstance) {
  // Get pending templates
  app.get(
    '/admin/moderation/templates',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { orgId } = request.query as any;
        const templates = await getPendingTemplates(orgId);

        return reply.send({
          success: true,
          data: templates,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Approve/reject template
  app.post(
    '/admin/moderation/templates/:id/approve',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const { action, notes } = request.body as any;
        const user = (request as any).user;

        await approveTemplate({
          templateId: id,
          action: action || 'approve',
          notes,
          userId: user.id,
        });

        return reply.send({
          success: true,
          message: `Template ${action === 'approve' ? 'approved' : 'rejected'}`,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Validate template content
  app.post(
    '/admin/templates/validate',
    {
      preHandler: [authGuard, requireOrgAccess],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { content } = request.body as any;
        const validation = await validateTemplateContent(content);

        return reply.send({
          success: true,
          data: validation,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Get escalated conversations
  app.get(
    '/admin/moderation/escalations',
    {
      preHandler: [authGuard, requireOrgAccess],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;
        const conversations = await prisma.conversation.findMany({
          where: {
            orgId,
            requiresHuman: true,
          },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { updatedAt: 'desc' },
        });

        return reply.send({
          success: true,
          data: conversations,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Claim conversation
  app.post(
    '/admin/moderation/conversations/:id/claim',
    {
      preHandler: [authGuard, requireOrgAccess],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;
        const user = (request as any).user;

        await prisma.conversation.update({
          where: { id },
          data: {
            userId: user.id,
          },
        });

        return reply.send({
          success: true,
          message: 'Conversation claimed',
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Unclaim conversation
  app.post(
    '/admin/moderation/conversations/:id/unclaim',
    {
      preHandler: [authGuard, requireOrgAccess],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as any;

        await prisma.conversation.update({
          where: { id },
          data: {
            userId: null,
          },
        });

        return reply.send({
          success: true,
          message: 'Conversation unclaimed',
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

