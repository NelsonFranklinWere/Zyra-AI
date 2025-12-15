import { PrismaClient } from '@prisma/client';
import { triggerStk } from '../payment.service';
import { handlePaymentSuccess } from '../order.service';
import { classifyIntent } from '../intent/intent.classifier';
import { getTraceId } from '../../lib/trace';
import { followupQueue } from '../../queues/index';

const prisma = new PrismaClient();

/**
 * Payment AI service - handles STK push, reminders, and payment verification
 */
export class PaymentAI {
  /**
   * Trigger STK push for order
   */
  async triggerSTK(orderId: string, phone: string, traceId?: string): Promise<{ success: boolean; attemptId?: string; error?: string }> {
    try {
      const attempt = await triggerStk(orderId);

      await prisma.aIProcessingTrace.create({
        data: {
          orgId: undefined, // Will be set from order
          traceType: 'PAYMENT_TRIGGERED',
          payload: { orderId, attemptId: attempt.id, phone },
          success: true,
        },
      });

      // Schedule reminders (8 minutes, then every 10 minutes, up to 4 reminders)
      await this.schedulePaymentReminders(orderId, phone);

      return { success: true, attemptId: attempt.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify payment from customer message ("I have paid")
   */
  async verifyPaymentFromMessage(params: {
    message: string;
    conversationId: string;
    orgId: string;
    traceId?: string;
  }): Promise<{ verified: boolean; orderId?: string; message?: string }> {
    const traceId = getTraceId(params.traceId);

    // Check intent
    const intentResult = await classifyIntent({
      message: params.message,
      orgId: params.orgId,
      conversationId: params.conversationId,
    });

    if (intentResult.intent !== 'PAYMENT_INTENT') {
      return { verified: false, message: 'Payment intent not detected' };
    }

    // Find pending orders for this conversation
    const orders = await prisma.order.findMany({
      where: {
        conversationId: params.conversationId,
        paymentStatus: 'PENDING',
      },
      include: {
        paymentAttempts: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (orders.length === 0) {
      return { verified: false, message: 'No pending orders found' };
    }

    const order = orders[0];

    // Check if payment attempt exists and is successful
    const successfulAttempt = order.paymentAttempts.find((a) => a.status === 'SUCCESS');

    if (successfulAttempt) {
      // Payment already verified
      return {
        verified: true,
        orderId: order.id,
        message: 'Payment already confirmed. Thank you!',
      };
    }

    // For now, just acknowledge - real verification would check MPESA API
    // In production, this would:
    // 1. Extract M-Pesa confirmation code from message
    // 2. Query MPESA API to verify transaction
    // 3. Update payment attempt status
    // 4. Call handlePaymentSuccess

    return {
      verified: false,
      orderId: order.id,
      message: 'We are checking your payment. You will receive a confirmation shortly.',
    };
  }

  /**
   * Schedule payment reminders
   */
  private async schedulePaymentReminders(orderId: string, phone: string): Promise<void> {
    const reminders = [
      { delay: 8 * 60 * 1000, message: 'Reminder: Please complete your payment to confirm your order.' },
      { delay: 18 * 60 * 1000, message: 'Second reminder: Your order is waiting for payment.' },
      { delay: 28 * 60 * 1000, message: 'Third reminder: Please complete payment to avoid cancellation.' },
      { delay: 38 * 60 * 1000, message: 'Final reminder: Payment needed within 2 minutes.' },
    ];

    for (const reminder of reminders) {
      await followupQueue.add(
        'payment-reminder',
        { orderId, phone, message: reminder.message },
        { delay: reminder.delay }
      );
    }
  }

  /**
   * Handle payment confirmation (from webhook or manual verification)
   */
  async handlePaymentConfirmed(orderId: string, traceId?: string): Promise<void> {
    const traceIdFinal = getTraceId(traceId);

    try {
      await handlePaymentSuccess(orderId);

      await prisma.aIProcessingTrace.create({
        data: {
          orgId: undefined, // Will be set from order
          traceType: 'PAYMENT_CONFIRMED',
          payload: { orderId },
          success: true,
        },
      });
    } catch (error: any) {
      await prisma.aIProcessingTrace.create({
        data: {
          orgId: undefined,
          traceType: 'PAYMENT_CONFIRMED',
          payload: { orderId, error: error.message },
          success: false,
          errorMsg: error.message,
        },
      });
      throw error;
    }
  }
}

export const paymentAI = new PaymentAI();

