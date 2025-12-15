import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createOrgSchema, addMemberSchema } from '@zyra/shared';
import { authGuard } from '../middleware/authGuard';
import { requireRole, requireOrgAccess } from '../middleware/roleGuard';
import { auditLogger } from '../middleware/auditLogger';
import { createAuditLog } from '../services/auditLog';

const prisma = new PrismaClient();

export async function organizationRoutes(app: FastifyInstance) {
  // Create organization
  app.post(
    '/create',
    { preHandler: [authGuard] },
    async (request: FastifyRequest<{ Body: { name: string } }>, reply: FastifyReply) => {
      try {
        const body = createOrgSchema.parse(request.body);
        const user = request.user as any;

        // Check if user already has an org
        if (user.orgId) {
          return reply.code(400).send({
            success: false,
            message: 'User already belongs to an organization',
          });
        }

        // Create organization
        const org = await prisma.organization.create({
          data: {
            name: body.name,
            ownerId: user.userId,
          },
        });

        // Update user's orgId and role
        await prisma.user.update({
          where: { id: user.userId },
          data: {
            orgId: org.id,
            role: 'OWNER',
          },
        });

        await createAuditLog({
          userId: user.userId,
          orgId: org.id,
          action: 'ORGANIZATION_CREATED',
          resource: 'organization',
          resourceId: org.id,
        });

        return reply.code(201).send({
          success: true,
          data: org,
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to create organization',
        });
      }
    }
  );

  // Get organization info
  app.get(
    '/info',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        const orgId = (request as any).orgId || user.orgId;

        const org = await prisma.organization.findUnique({
          where: { id: orgId },
          include: {
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                products: true,
                rules: true,
                conversations: true,
              },
            },
          },
        });

        if (!org) {
          return reply.code(404).send({
            success: false,
            message: 'Organization not found',
          });
        }

        return reply.send({
          success: true,
          data: org,
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to fetch organization',
        });
      }
    }
  );

  // Add member to organization
  app.post(
    '/add-member',
    {
      preHandler: [
        authGuard,
        requireOrgAccess,
        requireRole('OWNER', 'ADMIN'),
        auditLogger('MEMBER_ADDED', 'user'),
      ],
    },
    async (request: FastifyRequest<{ Body: { email: string; role?: string } }>, reply: FastifyReply) => {
      try {
        const body = addMemberSchema.parse(request.body);
        const user = request.user as any;
        const orgId = (request as any).orgId;

        // Find user by email
        const targetUser = await prisma.user.findUnique({
          where: { email: body.email },
        });

        if (!targetUser) {
          return reply.code(404).send({
            success: false,
            message: 'User not found',
          });
        }

        if (targetUser.orgId) {
          return reply.code(400).send({
            success: false,
            message: 'User already belongs to an organization',
          });
        }

        // Update user
        await prisma.user.update({
          where: { id: targetUser.id },
          data: {
            orgId,
            role: body.role as any,
          },
        });

        await createAuditLog({
          userId: user.userId,
          orgId,
          action: 'MEMBER_ADDED',
          resource: 'user',
          resourceId: targetUser.id,
          metadata: { email: body.email, role: body.role },
        });

        return reply.send({
          success: true,
          message: 'Member added successfully',
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to add member',
        });
      }
    }
  );
}

