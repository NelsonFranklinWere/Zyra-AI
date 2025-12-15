import { PrismaClient } from '@prisma/client';
import { notifyRider } from './rider.service';
import { withLock } from '../utils/distributedLock';

const prisma = new PrismaClient();

export interface CreateOrderInput {
  orgId: string;
  conversationId: string;
  customerPhone: string;
  items: Array<{ productId: string; quantity: number; priceCents: number }>;
  metadata?: Record<string, any>;
}

export async function createOrder(input: CreateOrderInput) {
  // Use distributed lock to prevent concurrent order creation
  return withLock(
    `order:${input.conversationId}:${Date.now()}`,
    async () => {
      // Check and reserve stock atomically
      for (const item of input.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new Error(`Product ${item.productId} not found or inactive`);
        }

        // Calculate available stock (total - reserved)
        const availableStock = product.stock - (product.reservedStock || 0);

        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${availableStock}`);
        }

        // Reserve stock atomically
        const reservation = await prisma.stockReservation.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            conversationId: input.conversationId,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            status: 'held',
          },
        });

        // Update product reserved stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            reservedStock: {
              increment: item.quantity,
            },
          },
        });

        // Store reservation ID in metadata
        (input.metadata = input.metadata || {}).reservationIds = [
          ...((input.metadata.reservationIds as string[]) || []),
          reservation.id,
        ];
      }

      return await createOrderInternal(input);
    },
    { ttl: 10000, maxRetries: 5 }
  );
}

async function createOrderInternal(input: CreateOrderInput) {

  const totalCents = input.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      orgId: input.orgId,
      conversationId: input.conversationId,
      customerPhone: input.customerPhone,
      items: input.items,
      totalCents,
      paymentStatus: 'PENDING',
      deliveryStatus: 'PENDING',
      metadata: input.metadata || {},
    },
  });

  return order;
}

export async function getOrder(orderId: string, orgId: string) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      orgId,
    },
    include: {
      paymentAttempts: true,
      conversation: true,
    },
  });
}

export async function listOrders(orgId: string, filters?: { status?: string; limit?: number }) {
  return prisma.order.findMany({
    where: {
      orgId,
      ...(filters?.status && { paymentStatus: filters.status as any }),
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 100,
    include: {
      paymentAttempts: true,
    },
  });
}

export async function handlePaymentSuccess(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      organization: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Update order status and confirm stock reservations atomically
  await prisma.$transaction(async (tx) => {
    // Confirm stock reservations (move from held to confirmed)
    const reservations = await tx.stockReservation.findMany({
      where: {
        orderId,
        status: 'held',
      },
    });

    for (const reservation of reservations) {
      // Decrement actual stock
      await tx.product.update({
        where: { id: reservation.productId },
        data: {
          stock: { decrement: reservation.quantity },
          reservedStock: { decrement: reservation.quantity },
        },
      });

      // Mark reservation as confirmed
      await tx.stockReservation.update({
        where: { id: reservation.id },
        data: { status: 'confirmed' },
      });
    }

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
      },
    });

    // Create financial transaction record (if table exists)
    try {
      await (tx as any).financialTransaction.create({
        data: {
          orgId: order.orgId,
          orderId,
          type: 'order',
          amountCents: order.totalCents,
          netAmountCents: order.totalCents, // No fees for now
          status: 'confirmed',
        },
      });
    } catch (error) {
      // Table might not exist yet - log but don't fail
      console.warn('FinancialTransaction table not available:', error);
    }
  });

  // Notify rider
  await notifyRider(orderId);

  return order;
}

