import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authGuard } from '../middleware/authGuard';
import { requireRole, requireOrgAccess } from '../middleware/roleGuard';
import { auditLogger } from '../middleware/auditLogger';
import { createAuditLog } from '../services/auditLog';

const prisma = new PrismaClient();

const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
});

const addMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'STAFF', 'RIDER']).default('STAFF'),
});

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
    async (request: FastifyRequest<{ Body: { name: string; email: string; role?: string } }>, reply: FastifyReply) => {
      try {
        const body = addMemberSchema.parse(request.body);
        const user = request.user as any;
        const orgId = (request as any).orgId;

        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: body.email },
        });

        if (existingUser) {
          return reply.code(400).send({
            success: false,
            message: 'User with this email already exists',
          });
        }

        // Create new user as team member
        const newUser = await prisma.user.create({
          data: {
            name: body.name,
            email: body.email,
            role: body.role as any,
            orgId: orgId,
            // No password - they'll need to be invited to set one later
          },
        });

        await createAuditLog({
          userId: user.userId,
          orgId,
          action: 'MEMBER_ADDED',
          resource: 'user',
          resourceId: newUser.id,
          metadata: { email: body.email, role: body.role, name: body.name },
        });

        return reply.send({
          success: true,
          message: 'Team member added successfully',
          data: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
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

