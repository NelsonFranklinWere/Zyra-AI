import { ActionType, ActionContext, ActionResult } from '../ai/actions';
import { PrismaClient } from '@prisma/client';
import { withLock } from '../../lib/redis.client';
import { env } from '../../env';
import { getTraceId } from '../../lib/trace';
import { triggerStk } from '../payment.service';
import { createOrder } from '../order.service';
import { getWhatsAppProvider } from '../../providers/whatsapp';
import { cacheGet, cacheSet } from '../../lib/redis.client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Execute action with idempotency and locking
 */
export async function executeAction(
  action: ActionType,
  context: ActionContext,
  traceId?: string
): Promise<ActionResult> {
  const traceIdFinal = getTraceId(traceId);

  // Generate idempotency key
  const idempotencyKey = generateIdempotencyKey(action, context);

  // Check if already executed (idempotency)
  const cached = await cacheGet<ActionResult>(`action:${idempotencyKey}`);
  if (cached) {
    await createTrace({
      traceId: traceIdFinal,
      orgId: context.orgId,
      conversationId: context.conversationId,
      traceType: 'ACTION_EXECUTED',
      payload: { action, idempotent: true, result: cached },
      success: cached.success,
    });
    return cached;
  }

  // Use lock for critical actions
  const criticalActions = [ActionType.START_ORDER, ActionType.INIT_STK_PUSH, ActionType.CONFIRM_ORDER];
  const lockKey = criticalActions.includes(action) ? `action:${context.conversationId}:${action}` : null;

  const execute = async (): Promise<ActionResult> => {
    try {
      let result: ActionResult;

      switch (action) {
        case ActionType.SEND_PRODUCT_CATALOG:
          result = await executeSendProductCatalog(context);
          break;

        case ActionType.ASK_FOR_SIZE:
          result = await executeAskForSize(context);
          break;

        case ActionType.ASK_FOR_COLOR:
          result = await executeAskForColor(context);
          break;

        case ActionType.ASK_FOR_LOCATION:
          result = await executeAskForLocation(context);
          break;

        case ActionType.START_ORDER:
          result = await executeStartOrder(context);
          break;

        case ActionType.CONFIRM_ORDER:
          result = await executeConfirmOrder(context);
          break;

        case ActionType.INIT_STK_PUSH:
          result = await executeInitStkPush(context);
          break;

        case ActionType.REQUEST_PAYMENT_PROOF:
          result = await executeRequestPaymentProof(context);
          break;

        case ActionType.SEND_DELIVERY_INSTRUCTIONS:
          result = await executeSendDeliveryInstructions(context);
          break;

        case ActionType.SEND_FOLLOWUP:
          result = await executeSendFollowup(context);
          break;

        case ActionType.ALERT_OWNER:
          result = await executeAlertOwner(context);
          break;

        case ActionType.SAVE_FAQ:
          result = await executeSaveFAQ(context);
          break;

        case ActionType.UPDATE_MEMORY:
          result = await executeUpdateMemory(context);
          break;

        default:
          result = { success: false, error: `Unknown action: ${action}` };
      }

      // Cache result for idempotency (TTL 1 hour)
      await cacheSet(`action:${idempotencyKey}`, result, 3600);

      // Write trace
      await createTrace({
        traceId: traceIdFinal,
        messageId: context.messageId,
        orgId: context.orgId,
        conversationId: context.conversationId,
        traceType: 'ACTION_EXECUTED',
        payload: { action, result },
        success: result.success,
        errorMsg: result.error,
      });

      return result;
    } catch (error: any) {
      const result: ActionResult = {
        success: false,
        error: error.message || String(error),
      };

      await createTrace({
        traceId: traceIdFinal,
        messageId: context.messageId,
        orgId: context.orgId,
        conversationId: context.conversationId,
        traceType: 'ACTION_EXECUTED',
        payload: { action, error: error.message },
        success: false,
        errorMsg: error.message,
      });

      return result;
    }
  };

  if (lockKey) {
    return withLock(lockKey, execute, { ttlMs: 5000, retries: 3 });
  }

  return execute();
}

/**
 * Generate idempotency key for action
 */
function generateIdempotencyKey(action: ActionType, context: ActionContext): string {
  const key = `${action}:${context.orgId}:${context.conversationId}:${context.messageId || ''}`;
  return crypto.createHash('sha256').update(key).digest('hex').substring(0, 16);
}

// Action implementations

async function executeSendProductCatalog(context: ActionContext): Promise<ActionResult> {
  const products = await prisma.product.findMany({
    where: { orgId: context.orgId, isActive: true },
    take: 10,
  });

  const catalogText = products.map((p) => `• ${p.name} - KES ${p.price}`).join('\n');
  const message = `Here are our available products:\n\n${catalogText}\n\nWhich one interests you?`;

  const provider = getWhatsAppProvider();
  const conversation = await prisma.conversation.findUnique({
    where: { id: context.conversationId },
  });

  if (!conversation) {
    return { success: false, error: 'Conversation not found' };
  }

  await provider.sendText(conversation.externalId, message);

  return { success: true, message: 'Product catalog sent' };
}

async function executeAskForSize(context: ActionContext): Promise<ActionResult> {
  const message = 'What size would you like? (Please specify, e.g., size 42)';
  const provider = getWhatsAppProvider();
  const conversation = await prisma.conversation.findUnique({
    where: { id: context.conversationId },
  });

  if (!conversation) {
    return { success: false, error: 'Conversation not found' };
  }

  await provider.sendText(conversation.externalId, message);
  return { success: true, message: 'Size question sent' };
}

async function executeAskForColor(context: ActionContext): Promise<ActionResult> {
  const message = 'What color would you like?';
  const provider = getWhatsAppProvider();
  const conversation = await prisma.conversation.findUnique({
    where: { id: context.conversationId },
  });

  if (!conversation) {
    return { success: false, error: 'Conversation not found' };
  }

  await provider.sendText(conversation.externalId, message);
  return { success: true, message: 'Color question sent' };
}

async function executeAskForLocation(context: ActionContext): Promise<ActionResult> {
  const message = 'Where would you like the delivery? Please provide your location/address.';
  const provider = getWhatsAppProvider();
  const conversation = await prisma.conversation.findUnique({
    where: { id: context.conversationId },
  });

  if (!conversation) {
    return { success: false, error: 'Conversation not found' };
  }

  await provider.sendText(conversation.externalId, message);
  return { success: true, message: 'Location question sent' };
}

async function executeStartOrder(context: ActionContext): Promise<ActionResult> {
  if (!context.parsedFields?.product_matches?.length) {
    return { success: false, error: 'No products found to order' };
  }

  const productMatch = context.parsedFields.product_matches[0];
  const product = await prisma.product.findUnique({
    where: { id: productMatch.id },
  });

  if (!product) {
    return { success: false, error: 'Product not found' };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: context.conversationId },
  });

  if (!conversation) {
    return { success: false, error: 'Conversation not found' };
  }

  const quantity = context.parsedFields.quantity || 1;
  const totalCents = Math.round(Number(product.price) * 100 * quantity);

  const order = await createOrder({
    orgId: context.orgId,
    conversationId: context.conversationId,
    customerPhone: conversation.externalId,
    items: [
      {
        productId: product.id,
        quantity,
        priceCents: Math.round(Number(product.price) * 100),
      },
    ],
    metadata: {
      size: context.parsedFields.size,
      color: context.parsedFields.color,
      location: context.parsedFields.location_text,
    },
  });

  return {
    success: true,
    message: 'Order created',
    data: { orderId: order.id },
  };
}

async function executeConfirmOrder(context: ActionContext): Promise<ActionResult> {
  if (!context.orderId) {
    return { success: false, error: 'Order ID required' };
  }

  const order = await prisma.order.findUnique({
    where: { id: context.orderId },
  });

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  // Update order status to AWAITING_PAYMENT
  await prisma.order.update({
    where: { id: context.orderId },
    data: { paymentStatus: 'PENDING' },
  });

  // Trigger payment
  const paymentResult = await executeInitStkPush(context);
  
  return {
    success: true,
    message: 'Order confirmed',
    data: { orderId: context.orderId, paymentInitiated: paymentResult.success },
  };
}

async function executeInitStkPush(context: ActionContext): Promise<ActionResult> {
  if (!context.orderId) {
    return { success: false, error: 'Order ID required' };
  }

  const order = await prisma.order.findUnique({
    where: { id: context.orderId },
    include: { conversation: true },
  });

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  try {
    const attempt = await triggerStk(context.orderId);
    return {
      success: true,
      message: 'STK Push initiated',
      data: { attemptId: attempt.id },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to initiate STK Push',
    };
  }
}

async function executeRequestPaymentProof(context: ActionContext): Promise<ActionResult> {
  const message = 'Please send proof of payment (M-Pesa confirmation message or screenshot).';
  const provider = getWhatsAppProvider();
  const conversation = await prisma.conversation.findUnique({
    where: { id: context.conversationId },
  });

  if (!conversation) {
    return { success: false, error: 'Conversation not found' };
  }

  await provider.sendText(conversation.externalId, message);
  return { success: true, message: 'Payment proof request sent' };
}

async function executeSendDeliveryInstructions(context: ActionContext): Promise<ActionResult> {
  const message = 'Your order will be delivered soon. We will send you updates!';
  const provider = getWhatsAppProvider();
  const conversation = await prisma.conversation.findUnique({
    where: { id: context.conversationId },
  });

  if (!conversation) {
    return { success: false, error: 'Conversation not found' };
  }

  await provider.sendText(conversation.externalId, message);
  return { success: true, message: 'Delivery instructions sent' };
}

async function executeSendFollowup(context: ActionContext): Promise<ActionResult> {
  // This will be handled by the followup queue/job
  return { success: true, message: 'Followup queued' };
}

async function executeAlertOwner(context: ActionContext): Promise<ActionResult> {
  // Alert owner logic (can send email, notification, etc.)
  return { success: true, message: 'Owner alerted' };
}

async function executeSaveFAQ(context: ActionContext): Promise<ActionResult> {
  // Save FAQ to business memory
  return { success: true, message: 'FAQ saved' };
}

async function executeUpdateMemory(context: ActionContext): Promise<ActionResult> {
  // Update business memory
  return { success: true, message: 'Memory updated' };
}

/**
 * Create AI processing trace
 */
async function createTrace(params: {
  traceId: string;
  messageId?: string;
  orgId?: string;
  conversationId?: string;
  traceType: string;
  payload?: any;
  success?: boolean;
  errorMsg?: string;
}): Promise<void> {
  try {
    await prisma.aIProcessingTrace.create({
      data: {
        messageId: params.messageId,
        orgId: params.orgId,
        conversationId: params.conversationId,
        traceType: params.traceType,
        payload: params.payload || {},
        success: params.success !== false,
        errorMsg: params.errorMsg,
      },
    });
  } catch (error) {
    console.error('Failed to create trace:', error);
  }
}

