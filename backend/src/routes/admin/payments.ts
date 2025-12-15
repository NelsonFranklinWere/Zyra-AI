import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authGuard } from '../../middleware/authGuard';
import { requireRole } from '../../middleware/roleGuard';
import { PrismaClient } from '@prisma/client';
import { mpesaService } from '../../services/mpesa.service';
import { triggerStk } from '../../services/payment.service';
import { createAuditLog } from '../../services/auditLog';

const prisma = new PrismaClient();

export async function paymentAdminRoutes(app: FastifyInstance) {
  // Test STK (sandbox)
  app.post(
    '/admin/mpesa/test-stk',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { orderId } = request.body as any;

        const attempt = await triggerStk(orderId);

        return reply.send({
          success: true,
          data: attempt,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Reconcile payments
  app.get(
    '/admin/payments/reconcile',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { since } = request.query as any;
        const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await mpesaService.reconcilePayments(sinceDate);

        return reply.send({
          success: true,
          data: result,
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Manual payment marking
  app.post(
    '/admin/payments/:attemptId/manual-success',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { attemptId } = request.params as any;
        const { providerRef, notes } = request.body as any;
        const user = (request as any).user;

        const attempt = await prisma.paymentAttempt.findUnique({
          where: { id: attemptId },
          include: { order: true },
        });

        if (!attempt) {
          return reply.code(404).send({
            success: false,
            message: 'Payment attempt not found',
          });
        }

        // Update payment attempt
        await prisma.paymentAttempt.update({
          where: { id: attemptId },
          data: {
            status: 'SUCCESS',
            providerRef: providerRef || `manual_${Date.now()}`,
            metadata: {
              ...(attempt.metadata as any),
              manuallyMarked: true,
              markedBy: user.id,
              notes,
            },
          },
        });

        // Handle payment success
        const { handlePaymentSuccess } = await import('../../services/order.service');
        await handlePaymentSuccess(attempt.orderId);

        // Create audit log
        await createAuditLog({
          userId: user.id,
          orgId: attempt.order.orgId,
          action: 'MANUAL_PAYMENT_MARK',
          resource: 'payment_attempt',
          resourceId: attemptId,
          metadata: { orderId: attempt.orderId, providerRef },
        });

        return reply.send({
          success: true,
          message: 'Payment marked as successful',
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // Create refund
  app.post(
    '/admin/refunds',
    {
      preHandler: [authGuard, requireRole('OWNER', 'ADMIN')],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { orderId, amountCents, reason } = request.body as any;
        const user = (request as any).user;

        const order = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (!order) {
          return reply.code(404).send({
            success: false,
            message: 'Order not found',
          });
        }

        const refund = await prisma.refund.create({
          data: {
            orderId,
            amountCents,
            reason,
            status: 'pending',
            metadata: {
              createdBy: user.id,
            },
          },
        });

        // In production, would trigger provider refund API
        // For now, mark as processed if auto-refund enabled

        await createAuditLog({
          userId: user.id,
          orgId: order.orgId,
          action: 'REFUND_CREATED',
          resource: 'refund',
          resourceId: refund.id,
          metadata: { orderId, amountCents, reason },
        });

        return reply.send({
          success: true,
          data: refund,
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

