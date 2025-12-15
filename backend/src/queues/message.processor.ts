import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { detectIntent } from '../services/intent.service';
import { extractEntities } from '../services/entity.service';
import { evaluateRules, RuleAction } from '../services/rule.engine';
import { renderTemplate } from '../services/template.service';
import { createOrder } from '../services/order.service';
import { triggerStk } from '../services/payment.service';
import { saveOutboundMessage } from '../services/message.service';
import { getWhatsAppProvider } from '../providers/whatsapp';
import { createAnalyticsEvent } from '../services/analytics.service';
// Note: Using Sprint 3 AI services in message.processor.v2.ts
// This file uses the older Sprint 2 trace utility
import { PrismaClient } from '@prisma/client';

const tracePrisma = new PrismaClient();

async function createProcessingTrace(messageId: string, step: string, data: any) {
  try {
    await tracePrisma.aIProcessingTrace.create({
      data: {
        messageId,
        traceType: step.toUpperCase(),
        payload: data,
        success: true,
      },
    });
  } catch (error) {
    console.error('Failed to create trace:', error);
  }
}

const prisma = new PrismaClient();

export interface ProcessMessageJob {
  messageId: string;
}

async function executeAction(
  action: RuleAction,
  context: {
    conversation: any;
    message: any;
    orgId: string;
    customerPhone: string;
    entities: any;
  }
): Promise<void> {
  const { conversation, message, orgId, customerPhone, entities } = context;

  switch (action.type) {
    case 'send_message': {
      const templateName = action.params.template;
      if (!templateName) {
        throw new Error('Template name required for send_message action');
      }

      // Prepare template variables
      const variables: Record<string, string> = {
        customer_name: 'Customer',
        ...action.params.variables,
      };

      if (entities.products?.[0]) {
        variables.product_name = entities.products[0].product.name;
        variables.price = (parseFloat(entities.products[0].product.price.toString()) / 100).toFixed(2);
      }

      // Render template
      const text = await renderTemplate(templateName, orgId, variables);

      // Send via WhatsApp
      const provider = getWhatsAppProvider();
      await provider.sendText(customerPhone, text, { template: templateName });

      // Save message
      await saveOutboundMessage(conversation.id, text, orgId, customerPhone);

      await createAnalyticsEvent({
        orgId,
        eventType: 'action_executed',
        payload: {
          action: 'send_message',
          template: templateName,
          conversationId: conversation.id,
        },
      });
      break;
    }

    case 'create_order': {
      if (!entities.products?.[0]) {
        throw new Error('No product found for order creation');
      }

      const product = entities.products[0].product;
      const quantity = entities.quantity || 1;

      await createOrder({
        orgId,
        conversationId: conversation.id,
        customerPhone,
        items: [
          {
            productId: product.id,
            quantity,
            priceCents: Math.round(parseFloat(product.price.toString()) * 100),
          },
        ],
        metadata: {
          source: 'automated',
          intent: message.intent,
        },
      });

      await createAnalyticsEvent({
        orgId,
        eventType: 'order_created',
        payload: {
          conversationId: conversation.id,
          productId: product.id,
          quantity,
        },
      });
      break;
    }

    case 'trigger_payment': {
      // Get latest order for conversation
      const order = await prisma.order.findFirst({
        where: {
          conversationId: conversation.id,
          paymentStatus: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (order) {
        await triggerStk(order.id);
      }
      break;
    }

    case 'escalate_to_agent': {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          requiresHuman: true,
        },
      });

      await createAnalyticsEvent({
        orgId,
        eventType: 'conversation_escalated',
        payload: {
          conversationId: conversation.id,
        },
      });
      break;
    }

    case 'schedule_followup': {
      // For Sprint 2, just log - followup worker will handle this
      await createAnalyticsEvent({
        orgId,
        eventType: 'followup_scheduled',
        payload: {
          conversationId: conversation.id,
          delay: action.params.delaySeconds,
        },
      });
      break;
    }
  }
}

export async function processMessage(job: Job<ProcessMessageJob>): Promise<void> {
  const { messageId } = job.data;
  const startTime = Date.now();

  try {
    await createProcessingTrace(messageId, 'start', { messageId });

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

    // Load products
    const products = await prisma.product.findMany({
      where: {
        orgId: organization.id,
        isActive: true,
      },
    });

    await createProcessingTrace(messageId, 'context_loaded', { productsCount: products.length });

    // Detect intent
    const intentResult = await detectIntent(message.text, conversation.id, products);
    await createProcessingTrace(messageId, 'intent_detected', intentResult);

    await createAnalyticsEvent({
      orgId: organization.id,
      eventType: 'intent_detected',
      payload: {
        messageId,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
      },
    });

    // Extract entities
    const entities = extractEntities(message.text, products);
    await createProcessingTrace(messageId, 'entities_extracted', entities);

    // Update message with processing results
    await prisma.message.update({
      where: { id: messageId },
      data: {
        intent: intentResult.intent,
        entities: entities as any,
        processedAt: new Date(),
      },
    });

    // Evaluate rules
    const actions = await evaluateRules({
      conversation: conversation as any,
      message: message as any,
      intent: intentResult.intent,
      entities,
      products,
    });

    await createProcessingTrace(messageId, 'rules_evaluated', { actionsCount: actions.length });

    if (actions.length > 0) {
      await createAnalyticsEvent({
        orgId: organization.id,
        eventType: 'rule_matched',
        payload: {
          messageId,
          rulesCount: actions.length,
        },
      });

      // Execute actions
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        try {
          await executeAction(action, {
            conversation,
            message,
            orgId: organization.id,
            customerPhone: conversation.externalId,
            entities,
          });

          await createProcessingTrace(messageId, `action_executed_${i}`, {
            action: action.type,
            success: true,
          });
        } catch (error: any) {
          await createProcessingTrace(messageId, `action_executed_${i}`, {
            action: action.type,
            success: false,
            error: error.message,
          });
          throw error;
        }
      }
    }

    const duration = Date.now() - startTime;
    await createProcessingTrace(messageId, 'complete', { duration });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    await createProcessingTrace(messageId, 'error', {
      error: error.message,
      duration,
    });
    throw error;
  }
}

