import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { classifyIntent } from '../services/intent/intent.classifier';
import { parseMessage } from '../services/ai/mue';
import { generateReply } from '../services/ai/reply.generator';
import { executeAction, ActionType } from '../services/actions/processor';
import { processOrderFlow } from '../services/orders/order.ai';
import { saveOutboundMessage } from '../services/message.service';
import { getWhatsAppProvider } from '../providers/whatsapp';
import { createAnalyticsEvent } from '../services/analytics.service';
import { generateTraceId } from '../lib/trace';
import { env } from '../env';

const prisma = new PrismaClient();

export interface ProcessMessageJob {
  messageId: string;
}

/**
 * Enhanced message processor using Sprint 3 AI services
 * Falls back to Sprint 2 services if Sprint 3 is disabled
 */
export async function processMessage(job: Job<ProcessMessageJob>): Promise<void> {
  const { messageId } = job.data;
  const traceId = generateTraceId();
  const startTime = Date.now();

  try {
    // Load message and context
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!message || !message.conversation) {
      throw new Error('Message or conversation not found');
    }

    const { conversation, organization } = message;

    // Check if organization has automation enabled
    if (!organization.automationEnabled) {
      await prisma.aIProcessingTrace.create({
        data: {
          messageId,
          orgId: organization.id,
          conversationId: conversation.id,
          traceType: 'ACTION_EXECUTED',
          payload: { automationDisabled: true },
          success: true,
        },
      });
      return;
    }

    // Load products
    const products = await prisma.product.findMany({
      where: {
        orgId: organization.id,
        isActive: true,
      },
    });

    // Step 1: Classify intent (Sprint 3)
    const intentResult = await classifyIntent({
      message: message.text,
      conversationId: conversation.id,
      orgId: organization.id,
      products,
      traceId,
    });

    await createAnalyticsEvent({
      orgId: organization.id,
      eventType: 'intent_detected',
      payload: {
        messageId,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
      },
    });

    // Step 2: Parse message (MUE)
    const parsedFields = await parseMessage({
      message: message.text,
      conversationId: conversation.id,
      orgId: organization.id,
      products,
      traceId,
    });

    // Step 3: Generate reply
    const replyResult = await generateReply({
      intent: intentResult.intent,
      parsedFields,
      conversationId: conversation.id,
      orgId: organization.id,
      message: message.text,
      contextMessages: [], // Could load recent messages here
      traceId,
    });

    // Step 4: Handle order flow if ORDER_PLACEMENT intent
    if (intentResult.intent === 'ORDER_PLACEMENT') {
      try {
        const orderFlowResult = await processOrderFlow({
          conversationId: conversation.id,
          orgId: organization.id,
          message: message.text,
          messageId,
          traceId,
        });

        // If order flow provided a response, use it
        if (orderFlowResult.response) {
          replyResult.replyText = orderFlowResult.response;
          replyResult.actions.push(...orderFlowResult.actions);
        }
      } catch (error: any) {
        console.error('Order flow error:', error);
        // Continue with regular reply
      }
    }

    // Step 5: Send reply if generated
    if (replyResult.replyText && replyResult.replyText.trim()) {
      const provider = getWhatsAppProvider();
      await provider.sendText(conversation.externalId, replyResult.replyText);

      await saveOutboundMessage(conversation.id, replyResult.replyText, organization.id, conversation.externalId);

      await createAnalyticsEvent({
        orgId: organization.id,
        eventType: 'message_sent',
        payload: {
          conversationId: conversation.id,
          templateUsed: replyResult.templateUsed,
          llmUsed: replyResult.llmUsed,
        },
      });
    }

    // Step 6: Execute actions
    for (const actionName of replyResult.actions) {
      try {
        await executeAction(actionName as ActionType, {
          orgId: organization.id,
          conversationId: conversation.id,
          messageId,
          parsedFields,
          intent: intentResult.intent,
          metadata: {},
        }, traceId);
      } catch (error: any) {
        console.error(`Action execution failed for ${actionName}:`, error);
        // Continue with other actions
      }
    }

    // Update message with processing results
    await prisma.message.update({
      where: { id: messageId },
      data: {
        intent: intentResult.intent,
        entities: parsedFields as any,
        processedAt: new Date(),
      },
    });

    const duration = Date.now() - startTime;
    await prisma.aIProcessingTrace.create({
      data: {
        messageId,
        orgId: organization.id,
        conversationId: conversation.id,
        traceType: 'ACTION_EXECUTED',
        payload: {
          duration,
          intent: intentResult.intent,
          actionsExecuted: replyResult.actions.length,
        },
        success: true,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    await prisma.aIProcessingTrace.create({
      data: {
        messageId,
        orgId: undefined,
        traceType: 'ACTION_EXECUTED',
        payload: { error: error.message, duration },
        success: false,
        errorMsg: error.message,
      },
    });

    throw error;
  }
}

