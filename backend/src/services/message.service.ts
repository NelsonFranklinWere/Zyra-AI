import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getOrCreateConversation(
  orgId: string,
  from: string,
  platform: string = 'whatsapp'
) {
  let conversation = await prisma.conversation.findUnique({
    where: {
      orgId_platform_externalId: {
        orgId,
        platform,
        externalId: from,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        orgId,
        platform,
        externalId: from,
        status: 'active',
      },
    });
  }

  return conversation;
}

export async function saveInboundMessage(
  conversationId: string,
  from: string,
  text: string,
  metadata?: Record<string, any>
) {
  return prisma.message.create({
    data: {
      conversationId,
      sender: 'customer',
      text,
      direction: 'inbound',
      metadata: metadata || {},
    },
  });
}

export async function saveOutboundMessage(
  conversationId: string,
  text: string,
  orgId: string,
  to: string,
  metadata?: Record<string, any>
) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      sender: 'business',
      text,
      direction: 'outbound',
      metadata: metadata || {},
    },
  });

  // Also save to outgoing_messages for tracking
  await prisma.outgoingMessage.create({
    data: {
      orgId,
      conversationId,
      to,
      text,
      status: 'sent',
      metadata: metadata || {},
    },
  });

  return message;
}

export async function updateMessageWithProcessing(
  messageId: string,
  intent?: string,
  entities?: any
) {
  return prisma.message.update({
    where: { id: messageId },
    data: {
      intent,
      entities: entities || {},
      processedAt: new Date(),
    },
  });
}

