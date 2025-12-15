import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { env } from '../env';
import { getOrCreateConversation, saveInboundMessage } from '../services/message.service';
import { messageQueue } from '../queues';
import { createAnalyticsEvent } from '../services/analytics.service';
import { getWhatsAppProvider } from '../providers/whatsapp';
import { webhookSecurity } from '../middleware/webhookSecurity';
import { getIdempotencyKey, checkIdempotency, storeIdempotency } from '../utils/idempotency';
import { isOptOutMessage, checkOptOut, recordOptOut } from '../utils/optOut';

const prisma = new PrismaClient();

export async function verifyWebhook(request: FastifyRequest, reply: FastifyReply) {
  // Meta verification format
  const mode = (request.query as any).hub?.mode;
  const token = (request.query as any).hub?.verify_token;
  const challenge = (request.query as any).hub?.challenge;

  if (mode === 'subscribe' && token === env.WA_WEBHOOK_VERIFY_TOKEN) {
    return reply.send(challenge);
  }

  return reply.code(403).send('Forbidden');
}

export async function handleWhatsAppWebhook(request: FastifyRequest, reply: FastifyReply) {
  try {
    const provider = getWhatsAppProvider();
    
    // For Meta provider, verify signature if needed
    if (provider.name() === 'meta') {
      // Signature verification would go here
    }

    const body = request.body as any;
    const orgId = (request as any).orgId;

    // Parse provider-specific payload into normalized format
    let normalized: {
      from: string;
      type: string;
      text?: string;
      timestamp: number;
      metadata?: any;
    };

    if (provider.name() === 'meta') {
      // Meta format
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (!message) {
        return reply.send({ received: true });
      }

      normalized = {
        from: message.from,
        type: message.type,
        text: message.text?.body || '',
        timestamp: parseInt(message.timestamp),
        metadata: { provider: 'meta', messageId: message.id },
      };
    } else {
      // Mock/simple format
      normalized = {
        from: body.from || body.phone,
        type: body.type || 'text',
        text: body.text || body.message,
        timestamp: body.timestamp || Date.now(),
        metadata: body.metadata || {},
      };
    }

    if (!normalized.from || !normalized.text) {
      return reply.send({ received: true, message: 'Invalid payload' });
    }

    // Determine orgId (for Sprint 2, use first org or from metadata)
    let targetOrgId = orgId;
    if (!targetOrgId) {
      const org = await prisma.organization.findFirst();
      targetOrgId = org?.id;
      if (!targetOrgId) {
        return reply.code(400).send({ error: 'No organization found' });
      }
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(targetOrgId, normalized.from, 'whatsapp');

    // Save message
    const message = await saveInboundMessage(
      conversation.id,
      normalized.from,
      normalized.text,
      normalized.metadata
    );

    // Emit analytics
    await createAnalyticsEvent({
      orgId: targetOrgId,
      eventType: 'message_received',
      payload: {
        messageId: message.id,
        conversationId: conversation.id,
        from: normalized.from,
      },
    });

    // Enqueue processing job
    await messageQueue.add('process-message', {
      messageId: message.id,
    }, {
      attempts: parseInt(env.BULL_RETRY_ATTEMPTS?.toString() || '3'),
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    // Store idempotency response
    const response = {
      received: true,
      messageId: message.id,
      conversationId: conversation.id,
    };

    if (idempotencyKey) {
      await storeIdempotency(idempotencyKey, response);
    }

    // Return 200 quickly
    return reply.send(response);
  } catch (error: any) {
    console.error('Webhook error:', error);
    return reply.code(500).send({
      received: false,
      error: error.message,
    });
  }
}

