import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createProductSchema, updateProductSchema } from '@zyra/shared';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess } from '../middleware/roleGuard';
import { rateLimit } from '../middleware/rateLimiter';
import { auditLogger } from '../middleware/auditLogger';
import { createAuditLog } from '../services/auditLog';

const prisma = new PrismaClient();

export async function productRoutes(app: FastifyInstance) {
  // Create product
  app.post(
    '/',
    {
      preHandler: [
        authGuard,
        requireOrgAccess,
        rateLimit({ windowMs: 60 * 1000, max: 10 }), // 10 per minute
        auditLogger('PRODUCT_CREATED', 'product'),
      ],
    },
    async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      try {
        const body = createProductSchema.parse(request.body);
        const user = request.user as any;
        const orgId = (request as any).orgId;

      const product = await prisma.product.create({
        data: {
          name: body.name,
          description: body.description,
          sku: body.sku,
          stock: body.stock,
          isActive: body.isActive,
          orgId,
          price: body.price.toString(),
        },
      });

        await createAuditLog({
          userId: user.userId,
          orgId,
          action: 'PRODUCT_CREATED',
          resource: 'product',
          resourceId: product.id,
        });

        return reply.code(201).send({
          success: true,
          data: {
            ...product,
            price: parseFloat(product.price.toString()),
          },
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to create product',
        });
      }
    }
  );

  // Get products
  app.get(
    '/',
    { preHandler: [authGuard, requireOrgAccess] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = (request as any).orgId;

        const products = await prisma.product.findMany({
          where: { orgId },
          orderBy: { createdAt: 'desc' },
        });

        return reply.send({
          success: true,
          data: products.map((p) => ({
            ...p,
            price: parseFloat(p.price.toString()),
          })),
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to fetch products',
        });
      }
    }
  );

  // Update product
  app.patch(
    '/:id',
    {
      preHandler: [
        authGuard,
        requireOrgAccess,
        auditLogger('PRODUCT_UPDATED', 'product'),
      ],
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const body = updateProductSchema.parse(request.body);
        const orgId = (request as any).orgId;

        const product = await prisma.product.updateMany({
          where: { id, orgId },
          data: body.price ? { ...body, price: body.price.toString() } : body,
        });

        if (product.count === 0) {
          return reply.code(404).send({
            success: false,
            message: 'Product not found',
          });
        }

        const updated = await prisma.product.findUnique({ where: { id } });

        return reply.send({
          success: true,
          data: {
            ...updated,
            price: parseFloat(updated!.price.toString()),
          },
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: error.message || 'Failed to update product',
        });
      }
    }
  );

  // Delete product
  app.delete(
    '/:id',
    {
      preHandler: [
        authGuard,
        requireOrgAccess,
        auditLogger('PRODUCT_DELETED', 'product'),
      ],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const orgId = (request as any).orgId;

        const product = await prisma.product.deleteMany({
          where: { id, orgId },
        });

        if (product.count === 0) {
          return reply.code(404).send({
            success: false,
            message: 'Product not found',
          });
        }

        return reply.send({
          success: true,
          message: 'Product deleted successfully',
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.code(500).send({
          success: false,
          message: 'Failed to delete product',
        });
      }
    }
  );
}

