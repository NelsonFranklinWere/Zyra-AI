import { PrismaClient } from '@prisma/client';
import { env } from '../env';
import { handlePaymentSuccess } from './order.service';
import { createAnalyticsEvent } from './analytics.service';
import { withLock } from '../utils/distributedLock';
import { mpesaService } from './mpesa.service';

const prisma = new PrismaClient();

export interface PaymentAttempt {
  id: string;
  orderId: string;
  amountCents: number;
  status: string;
}

export async function triggerStk(orderId: string): Promise<PaymentAttempt> {
  // Use lock to prevent duplicate STK triggers
  return withLock(
    `stk:${orderId}`,
    async () => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          organization: true,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // KYC check
      if (order.organization.kycStatus !== 'verified') {
        throw new Error('Organization KYC not verified. Cannot process payments.');
      }

      // Check if payment attempt already exists
      const existingAttempt = await prisma.paymentAttempt.findFirst({
        where: {
          orderId,
          status: { in: ['INITIATED', 'PENDING'] },
        },
      });

      if (existingAttempt) {
        // Return existing attempt
        return existingAttempt as any;
      }

      // Create payment attempt (stub)
      const attempt = await prisma.paymentAttempt.create({
        data: {
          orderId,
          amountCents: order.totalCents,
          provider: 'mpesa',
          status: 'INITIATED',
          metadata: {
            env: env.MPESA_ENV,
            shortcode: env.MPESA_SHORTCODE,
          },
        },
      });

      await createAnalyticsEvent({
        orgId: order.orgId,
        eventType: 'payment_initiated',
        payload: {
          orderId,
          attemptId: attempt.id,
          amount: order.totalCents,
        },
      });

      // Initiate real MPESA STK push if configured
      if (env.MPESA_ENV && env.MPESA_CONSUMER_KEY && env.MPESA_SHORTCODE) {
        try {
          const phoneNumber = order.customerPhone;
          const amount = Math.floor(order.totalCents / 100); // Convert cents to shillings
          const accountRef = `ORDER-${orderId.substring(0, 8)}`;

          const stkResult = await mpesaService.initiateSTKPush(
            phoneNumber,
            amount,
            accountRef,
            orderId
          );

          // Update attempt with external ref
          await prisma.paymentAttempt.update({
            where: { id: attempt.id },
            data: {
              externalRef: stkResult.checkoutRequestId,
              status: stkResult.responseCode === '0' ? 'PENDING' : 'FAILED',
              metadata: {
                ...(attempt.metadata as any),
                stkResponse: stkResult,
              },
            },
          });
        } catch (error: any) {
          console.error('MPESA STK initiation error:', error);
          // Mark as failed but keep attempt record
          await prisma.paymentAttempt.update({
            where: { id: attempt.id },
            data: {
              status: 'FAILED',
              metadata: {
                ...(attempt.metadata as any),
                error: error.message,
              },
            },
          });
          throw error;
        }
      }

      return attempt;
    },
    { ttl: 5000, maxRetries: 3 }
  );
}

export async function simulatePaymentSuccess(attemptId: string): Promise<void> {
  const attempt = await prisma.paymentAttempt.findUnique({
    where: { id: attemptId },
    include: { order: true },
  });

  if (!attempt) {
    throw new Error('Payment attempt not found');
  }

  if (attempt.status === 'SUCCESS') {
    throw new Error('Payment already successful');
  }

  // Update payment attempt
  await prisma.paymentAttempt.update({
    where: { id: attemptId },
    data: {
      status: 'SUCCESS',
      providerRef: `sim_${Date.now()}`,
    },
  });

  // Handle order payment success (includes stock confirmation)
  await handlePaymentSuccess(attempt.orderId);

  await createAnalyticsEvent({
    orgId: attempt.order.orgId,
    eventType: 'payment_success',
    payload: {
      orderId: attempt.orderId,
      attemptId,
      amount: attempt.amountCents,
    },
  });
}
