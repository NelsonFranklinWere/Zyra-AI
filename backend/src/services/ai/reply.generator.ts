import { llmClient } from '../llm/llm.client';
import { PrismaClient } from '@prisma/client';
import { getBusinessMemory } from './memory/index';
import { renderTemplate } from '../template.service';
import { getTraceId } from '../../lib/trace';
import { sanitizeLLMOutput } from '../llmSafety.service';
import { env } from '../../env';

const prisma = new PrismaClient();

// Console is available in Node.js runtime
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export interface ReplyResult {
  replyText: string;
  actions: string[];
  templateUsed?: string;
  llmUsed?: boolean;
}

/**
 * Generate reply for customer message
 */
export async function generateReply(params: {
  intent: string;
  parsedFields: any;
  conversationId: string;
  orgId: string;
  message: string;
  contextMessages?: Array<{ role: string; content: string }>;
  traceId?: string;
}): Promise<ReplyResult> {
  const traceId = getTraceId(params.traceId);

  // Step 1: Check rules engine for hard overrides
  // Get conversation and latest message for rule evaluation
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  // Evaluate rules for auto-reply blocking using proper RuleEvaluationContext
  if (conversation && conversation.messages.length > 0) {
    const latestMessage = conversation.messages[0];
    
    // Check rules for block_auto_reply action first (before full evaluation)
    const rules = await prisma.conversationRule.findMany({
      where: {
        orgId: params.orgId,
        enabled: true,
      },
      orderBy: { priority: 'desc' },
    });

    // Check for block_auto_reply rules
    for (const rule of rules) {
      const ruleValue = rule.value as any;
      if (ruleValue.action === 'block_auto_reply' && ruleValue.conditions) {
        // Simple condition matching for block rules
        const ruleConditions = ruleValue.conditions || [];
        let matches = false;

        for (const condition of ruleConditions) {
          if (condition.field === 'intent' && condition.value === params.intent) {
            matches = true;
            break;
          }
          if (condition.field === 'message.text' && latestMessage.text.toLowerCase().includes((condition.value || '').toLowerCase())) {
            matches = true;
            break;
          }
        }

        if (matches) {
          await createTrace({
            traceId,
            orgId: params.orgId,
            conversationId: params.conversationId,
            traceType: 'AI_REPLY',
            payload: { blocked: true, rule: rule.key },
            success: true,
          });

          return {
            replyText: '',
            actions: ['BLOCK_AUTO_REPLY'],
          };
        }
      }
    }
  }

  // Step 2: Check for template matches
  const templates = await prisma.template.findMany({
    where: {
      orgId: params.orgId,
      status: 'approved',
    },
  });

  // Find matching template based on intent
  const intentTemplateMap: Record<string, string> = {
    GENERAL_GREETING: 'greeting',
    PRODUCT_INQUIRY: 'product_inquiry',
    PRICE_REQUEST: 'price_request',
    ORDER_PLACEMENT: 'order_placement',
    PAYMENT_INTENT: 'payment_request',
    DELIVERY_QUESTION: 'delivery_info',
  };

  const templateName = intentTemplateMap[params.intent];
  const matchingTemplate = templates.find((t: any) => t.name === templateName || t.name.includes(templateName || ''));

  if (matchingTemplate) {
    try {
      // Render template with variables
      const variables: Record<string, string> = {
        customer_name: params.parsedFields.customerName || 'there',
        product_name: params.parsedFields.product_mentioned || 'product',
        ...(params.parsedFields.quantity && { quantity: String(params.parsedFields.quantity) }),
      };

      let replyText = await renderTemplate(matchingTemplate.name, params.orgId, variables);

      // Optional: Paraphrase with LLM if tone is specified
      if (matchingTemplate.tone && env.LLM_PROVIDER !== 'none') {
        try {
          const paraphrased = await llmClient.paraphraseTemplate({
            templateContent: replyText,
            variables,
            tone: matchingTemplate.tone,
            orgId: params.orgId,
          });

          // Validate LLM output
          const sanitized = sanitizeLLMOutput(paraphrased, variables);
          if (sanitized.allowed) {
            replyText = paraphrased;
          }
        } catch (error) {
          console.error('Template paraphrasing failed:', error);
          // Use original template
        }
      }

      await createTrace({
        traceId,
        orgId: params.orgId,
        conversationId: params.conversationId,
        traceType: 'AI_REPLY',
        payload: { template: matchingTemplate.name, replyLength: replyText.length },
        success: true,
      });

      return {
        replyText,
        actions: [],
        templateUsed: matchingTemplate.name,
        llmUsed: false,
      };
    } catch (error) {
      console.error('Template rendering failed:', error);
      // Fall through to LLM generation
    }
  }

  // Step 3: Generate reply with LLM
  const businessMemory = await getBusinessMemory(params.orgId);

  // Get product info if available
  const products = await prisma.product.findMany({
    where: {
      orgId: params.orgId,
      isActive: true,
    },
    take: 5,
    select: {
      name: true,
      price: true,
    },
  });

  try {
    let replyText = await llmClient.generateReply({
      intent: params.intent,
      context: params.message,
      businessMemory,
      productInfo: products,
      orgId: params.orgId,
    });

    // Validate LLM output (safety check)
    const sanitized = sanitizeLLMOutput(replyText, {});
    if (!sanitized.allowed) {
      console.warn('LLM output blocked due to violations:', sanitized.violations);
      // Fallback to safe template
      replyText = generateSafeFallbackReply(params.intent);
    }

    // Determine actions based on intent and parsed fields
    const actions = determineActions(params.intent, params.parsedFields);

    await createTrace({
      traceId,
      orgId: params.orgId,
      conversationId: params.conversationId,
      traceType: 'AI_REPLY',
      payload: { replyLength: replyText.length, actions, llmUsed: true },
      success: true,
    });

    return {
      replyText,
      actions,
      llmUsed: true,
    };
  } catch (error) {
    console.error('LLM reply generation failed:', error);

    // Fallback to safe reply
    const fallbackReply = generateSafeFallbackReply(params.intent);

    await createTrace({
      traceId,
      orgId: params.orgId,
      conversationId: params.conversationId,
      traceType: 'AI_REPLY',
      payload: { fallback: true, error: String(error) },
      success: false,
      errorMsg: String(error),
    });

    return {
      replyText: fallbackReply,
      actions: [],
    };
  }
}

/**
 * Determine actions based on intent and parsed fields
 */
function determineActions(intent: string, parsedFields: any): string[] {
  const actions: string[] = [];

  switch (intent) {
    case 'PRODUCT_INQUIRY':
      if (!parsedFields.product_matches || parsedFields.product_matches.length === 0) {
        actions.push('SEND_PRODUCT_CATALOG');
      }
      break;

    case 'ORDER_PLACEMENT':
      if (!parsedFields.size) {
        actions.push('ASK_FOR_SIZE');
      }
      if (!parsedFields.color) {
        actions.push('ASK_FOR_COLOR');
      }
      if (!parsedFields.location_text) {
        actions.push('ASK_FOR_LOCATION');
      }
      if (parsedFields.size && parsedFields.color && parsedFields.product_matches?.length > 0) {
        actions.push('START_ORDER');
      }
      break;

    case 'PAYMENT_INTENT':
      actions.push('REQUEST_PAYMENT_PROOF');
      break;
  }

  return actions;
}

/**
 * Generate safe fallback reply
 */
function generateSafeFallbackReply(intent: string): string {
  const fallbacks: Record<string, string> = {
    GENERAL_GREETING: 'Hello! How can I help you today?',
    PRODUCT_INQUIRY: 'Thanks for your interest! What product are you looking for?',
    PRICE_REQUEST: 'I can help you with pricing. Which product would you like to know about?',
    ORDER_PLACEMENT: 'I can help you place an order. Please let me know what you need.',
    PAYMENT_INTENT: 'I can help with payment. Which order are you paying for?',
    DELIVERY_QUESTION: 'I can help with delivery information. What would you like to know?',
  };

  return fallbacks[intent] || 'Thanks for your message! How can I assist you?';
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

