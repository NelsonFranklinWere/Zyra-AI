import { PrismaClient } from '@prisma/client';
import { getWhatsAppProvider } from '../providers/whatsapp';
import { renderTemplate } from './template.service';
import { createAnalyticsEvent } from './analytics.service';

const prisma = new PrismaClient();

export async function notifyRider(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      organization: {
        include: {
          members: {
            where: {
              role: { in: ['OWNER', 'ADMIN'] }, // For Sprint 2, use owner/admin as rider
            },
          },
        },
      },
      conversation: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Get first available rider (owner/admin)
  const rider = order.organization.members[0];
  if (!rider) {
    throw new Error('No rider found for organization');
  }

  // For Sprint 2, assume rider has WhatsApp number in metadata or use a placeholder
  const riderPhone = (rider as any).whatsapp || rider.email; // Placeholder

  try {
    // Render template
    const itemsSummary = (order.items as any[])
      .map((item: any) => `${item.quantity}x ${item.productName || 'Item'}`)
      .join(', ');

    const message = await renderTemplate('rider_notify', order.orgId, {
      order_id: order.id.substring(0, 8),
      customer_phone: order.customerPhone,
      items: itemsSummary,
      total: (order.totalCents / 100).toFixed(2),
      address: (order.metadata as any)?.address || 'To be provided',
    });

    // Send via WhatsApp
    const provider = getWhatsAppProvider();
    await provider.sendText(riderPhone, message);

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryStatus: 'NOTIFIED',
      },
    });

    await createAnalyticsEvent({
      orgId: order.orgId,
      eventType: 'rider_notified',
      payload: {
        orderId,
        riderId: rider.id,
      },
    });
  } catch (error: any) {
    console.error('Rider notification failed:', error);
    throw error;
  }
}

