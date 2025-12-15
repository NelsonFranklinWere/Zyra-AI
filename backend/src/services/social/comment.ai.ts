import { PrismaClient } from '@prisma/client';
import { generateReply } from '../ai/reply.generator';
import { parseMessage } from '../ai/mue';
import { classifyIntent } from '../intent/intent.classifier';
import { getTraceId } from '../../lib/trace';
import { getWhatsAppProvider } from '../../providers/whatsapp/index';

const prisma = new PrismaClient();

export interface CommentPayload {
  text: string;
  username: string;
  platform: string; // 'facebook', 'instagram', 'twitter', etc.
  postId?: string;
  commentId?: string;
}

/**
 * Social comment parser - extracts leads from comments
 */
export async function processSocialComment(params: {
  comment: CommentPayload;
  orgId: string;
  traceId?: string;
}): Promise<{
  leadCaptured: boolean;
  customerId?: string;
  conversationId?: string;
  message?: string;
}> {
  const traceId = getTraceId(params.traceId);

  // Extract phone numbers (Kenyan formats)
  const phoneNumber = extractPhoneNumber(params.comment.text);

  // Parse message for product interest and urgency
  const products = await prisma.product.findMany({
    where: { orgId: params.orgId, isActive: true },
  });

  const parsed = await parseMessage({
    message: params.comment.text,
    orgId: params.orgId,
    products,
    traceId,
  });

  const intent = await classifyIntent({
    message: params.comment.text,
    orgId: params.orgId,
  });

  // If phone detected, create customer and conversation
  if (phoneNumber) {
    // Create or find customer
    let customer = await prisma.user.findFirst({
      where: {
        email: `${phoneNumber}@social.lead`, // Temporary email format
      },
    });

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          name: params.comment.username,
          email: `${phoneNumber}@social.lead`,
          role: 'STAFF', // Placeholder role
          orgId: params.orgId,
        },
      });
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        orgId: params.orgId,
        platform: 'whatsapp',
        externalId: phoneNumber,
        status: 'active',
        metadata: {
          source: 'social',
          platform: params.comment.platform,
          postId: params.comment.postId,
          commentId: params.comment.commentId,
        },
      },
    });

    // Send friendly DM via WhatsApp
    const provider = getWhatsAppProvider();
    const welcomeMessage = `Hello ${params.comment.username}! Thanks for your interest. We saw your comment and would love to help you. How can we assist you today?`;
    
    try {
      await provider.sendText(phoneNumber, welcomeMessage);
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
    }

    await prisma.aIProcessingTrace.create({
      data: {
        orgId: params.orgId,
        conversationId: conversation.id,
        traceType: 'SOCIAL_LEAD_CAPTURED',
        payload: {
          phoneNumber,
          platform: params.comment.platform,
          username: params.comment.username,
          productInterest: parsed.product_mentioned,
          urgency: parsed.urgency,
        },
        success: true,
      },
    });

    return {
      leadCaptured: true,
      customerId: customer.id,
      conversationId: conversation.id,
      message: 'Lead captured, WhatsApp message sent',
    };
  } else {
    // No phone number - generate reply to comment
    const reply = await generateReply({
      intent: intent.intent,
      parsedFields: parsed,
      conversationId: '', // No conversation yet
      orgId: params.orgId,
      message: params.comment.text,
    });

    // Ask commenter to DM or provide WhatsApp number
    const finalMessage = `${reply.replyText}\n\nPlease DM us or send your WhatsApp number for faster assistance!`;

    await prisma.aIProcessingTrace.create({
      data: {
        orgId: params.orgId,
        traceType: 'SOCIAL_LEAD_CAPTURED',
        payload: {
          platform: params.comment.platform,
          username: params.comment.username,
          noPhone: true,
          replyGenerated: true,
        },
        success: true,
      },
    });

    return {
      leadCaptured: false,
      message: finalMessage, // This would be posted as a reply to the comment
    };
  }
}

/**
 * Extract phone number from text (Kenyan formats)
 */
function extractPhoneNumber(text: string): string | null {
  // Kenyan phone patterns:
  // +254712345678
  // 0712345678
  // 712345678
  // 254712345678

  const patterns = [
    /\b\+?254[17]\d{8}\b/,
    /\b0[17]\d{8}\b/,
    /\b[17]\d{8}\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let phone = match[0];
      
      // Normalize to +254 format
      if (phone.startsWith('0')) {
        phone = '+254' + phone.substring(1);
      } else if (phone.startsWith('254')) {
        phone = '+' + phone;
      } else if (!phone.startsWith('+')) {
        phone = '+254' + phone;
      }

      return phone;
    }
  }

  return null;
}

