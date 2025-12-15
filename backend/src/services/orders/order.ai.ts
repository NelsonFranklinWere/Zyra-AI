import { PrismaClient } from '@prisma/client';
import { parseMessage } from '../ai/mue';
import { executeAction, ActionType } from '../ai/actions';
import { getTraceId } from '../../lib/trace';
import { getSessionMemory, updateSessionMemory } from '../ai/memory/index';
import { createOrder } from '../order.service';
import { env } from '../../env';

const prisma = new PrismaClient();

export interface OrderFlowState {
  productId?: string;
  size?: string;
  color?: string;
  quantity?: number;
  location?: string;
  status: 'collecting_info' | 'ready_to_confirm' | 'confirmed' | 'awaiting_payment';
}

/**
 * Conversational order flow manager
 */
export async function processOrderFlow(params: {
  conversationId: string;
  orgId: string;
  message: string;
  messageId?: string;
  traceId?: string;
}): Promise<{
  response?: string;
  actions: string[];
  orderId?: string;
  state: OrderFlowState;
}> {
  const traceId = getTraceId(params.traceId);

  // Get or create session memory for this conversation
  let sessionState = await getSessionMemory(`conv:${params.conversationId}`, params.orgId);
  let orderState: OrderFlowState = sessionState?.orderState || {
    status: 'collecting_info',
  };

  // Get products for this org
  const products = await prisma.product.findMany({
    where: { orgId: params.orgId, isActive: true },
  });

  // Parse message to extract entities
  const parsed = await parseMessage({
    message: params.message,
    conversationId: params.conversationId,
    orgId: params.orgId,
    products,
    traceId,
  });

  // Update order state with parsed information
  if (parsed.product_matches.length > 0) {
    orderState.productId = parsed.product_matches[0].id;
  }
  if (parsed.size) {
    orderState.size = parsed.size;
  }
  if (parsed.color) {
    orderState.color = parsed.color;
  }
  if (parsed.quantity) {
    orderState.quantity = parsed.quantity;
  }
  if (parsed.location_text) {
    orderState.location = parsed.location_text;
  }

  // Determine missing fields
  const missingFields: string[] = [];
  if (!orderState.productId) {
    missingFields.push('product');
  }
  if (!orderState.size) {
    missingFields.push('size');
  }
  if (!orderState.color) {
    missingFields.push('color');
  }
  if (!orderState.location) {
    missingFields.push('location');
  }

  // Determine actions based on missing fields
  const actions: string[] = [];
  let response: string | undefined;

  if (missingFields.length > 0) {
    // Still collecting information
    orderState.status = 'collecting_info';

    if (missingFields.includes('product')) {
      actions.push(ActionType.SEND_PRODUCT_CATALOG);
      response = 'Which product would you like to order?';
    } else if (missingFields.includes('size')) {
      actions.push(ActionType.ASK_FOR_SIZE);
      response = 'What size do you need?';
    } else if (missingFields.includes('color')) {
      actions.push(ActionType.ASK_FOR_COLOR);
      response = 'What color would you prefer?';
    } else if (missingFields.includes('location')) {
      actions.push(ActionType.ASK_FOR_LOCATION);
      response = 'Where should we deliver your order?';
    }

    // Update session memory
    await updateSessionMemory(`conv:${params.conversationId}`, params.orgId, {
      orderState,
    });
  } else {
    // All information collected, ready to create order
    if (orderState.status === 'collecting_info') {
      orderState.status = 'ready_to_confirm';

      // Create order
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: params.conversationId },
        });

        if (!conversation) {
          throw new Error('Conversation not found');
        }

        const product = await prisma.product.findUnique({
          where: { id: orderState.productId! },
        });

        if (!product) {
          throw new Error('Product not found');
        }

        const quantity = orderState.quantity || 1;
        const totalCents = Math.round(Number(product.price) * 100 * quantity);

        const order = await createOrder({
          orgId: params.orgId,
          conversationId: params.conversationId,
          customerPhone: conversation.externalId,
          items: [
            {
              productId: product.id,
              quantity,
              priceCents: Math.round(Number(product.price) * 100),
            },
          ],
          metadata: {
            size: orderState.size,
            color: orderState.color,
            location: orderState.location,
            status: 'IN_PROGRESS',
          },
        });

        orderState.status = 'confirmed';
        actions.push(ActionType.CONFIRM_ORDER);
        actions.push(ActionType.INIT_STK_PUSH);

        response = `Great! Your order has been created. Total: KES ${(totalCents / 100).toFixed(2)}. You will receive an M-Pesa prompt shortly.`;

        // Update session with order ID
        await updateSessionMemory(`conv:${params.conversationId}`, params.orgId, {
          orderState: { ...orderState, orderId: order.id },
        });

        await prisma.aIProcessingTrace.create({
          data: {
            orgId: params.orgId,
            conversationId: params.conversationId,
            traceType: 'ORDER_STATE_UPDATED',
            payload: { orderId: order.id, status: 'confirmed' },
            success: true,
          },
        });

        return {
          response,
          actions,
          orderId: order.id,
          state: orderState,
        };
      } catch (error: any) {
        response = 'Sorry, there was an error creating your order. Please try again or contact support.';
        await prisma.aIProcessingTrace.create({
          data: {
            orgId: params.orgId,
            conversationId: params.conversationId,
            traceType: 'ORDER_STATE_UPDATED',
            payload: { error: error.message },
            success: false,
            errorMsg: error.message,
          },
        });
      }
    }
  }

  // Update session memory
  await updateSessionMemory(`conv:${params.conversationId}`, params.orgId, {
    orderState,
  });

  return {
    response,
    actions,
    state: orderState,
  };
}

/**
 * Release hold on order if payment not received
 */
export async function releaseOrderHold(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { paymentAttempts: true },
  });

  if (!order) {
    return;
  }

  // Check if payment received
  const hasSuccessfulPayment = order.paymentAttempts.some((a) => a.status === 'SUCCESS');

  if (!hasSuccessfulPayment && order.paymentStatus === 'PENDING') {
    // Release stock reservations
    const reservationIds = (order.metadata as any)?.reservationIds || [];
    for (const resId of reservationIds) {
      // Release reservation logic (from order.service)
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'CANCELLED' },
    });

    // Notify customer
    const conversation = await prisma.conversation.findUnique({
      where: { id: order.conversationId || undefined },
    });

    if (conversation) {
      // Send notification message
    }
  }
}

