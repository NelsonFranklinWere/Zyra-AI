/**
 * Enhanced LLM Service Examples with Correct OpenAI API Calls
 * These are production-ready implementations using the actual OpenAI SDK
 */

import OpenAI from 'openai';
import { env } from '../../env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize OpenAI client (use existing LLM client abstraction if available)
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * 1. Intent Detection Service
 */
export async function detectIntent(message: string, orgContext: any): Promise<{
  intent: 'order_request' | 'greeting' | 'pricing' | 'unknown';
  confidence: number;
}> {
  const prompt = `You are an AI assistant helping a business respond to customer WhatsApp messages.

Your job: Identify the user's intent based on the message.

Return ONLY JSON:
{
  "intent": "order_request | greeting | pricing | unknown",
  "confidence": 0.0 - 1.0
}

Message: "${message}"

Business context:
${JSON.stringify(orgContext, null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: env.LLM_DEFAULT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an intent classifier. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }, // Ensure JSON response
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    // Validate result
    if (!['order_request', 'greeting', 'pricing', 'unknown'].includes(result.intent)) {
      return { intent: 'unknown', confidence: 0.5 };
    }

    return {
      intent: result.intent,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    console.error('Intent detection error:', error);
    return { intent: 'unknown', confidence: 0.0 };
  }
}

/**
 * 2. Template Filling LLM Service
 */
export async function fillTemplate(
  template: string,
  variables: Record<string, string>
): Promise<string> {
  const prompt = `You are a template filler engine.

Fill the template below using ONLY the provided variables.
If a variable is missing, leave "{{placeholder}}" untouched.

Template:
${template}

Variables:
${JSON.stringify(variables, null, 2)}

Return ONLY the final message text.`;

  try {
    const response = await openai.chat.completions.create({
      model: env.LLM_DEFAULT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You fill templates. Return only the filled text, no JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0, // Deterministic for template filling
    });

    return response.choices[0]?.message?.content?.trim() || template;
  } catch (error) {
    console.error('Template filling error:', error);
    return template; // Fallback to original
  }
}

/**
 * 3. Message Classification + Rule Matching
 */
export async function classifyIncomingMessage(message: string): Promise<{
  category: 'greeting' | 'order' | 'pricing' | 'complaint' | 'unknown';
  reason: string;
}> {
  const prompt = `Classify this WhatsApp message into:
- "greeting"
- "order"
- "pricing"
- "complaint"
- "unknown"

Return JSON only:
{
  "category": "...",
  "reason": "..."
}

Message: "${message}"`;

  try {
    const response = await openai.chat.completions.create({
      model: env.LLM_DEFAULT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You classify messages. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    // Validate category
    const validCategories = ['greeting', 'order', 'pricing', 'complaint', 'unknown'];
    if (!validCategories.includes(result.category)) {
      result.category = 'unknown';
    }

    return {
      category: result.category,
      reason: result.reason || 'Classification completed',
    };
  } catch (error) {
    console.error('Classification error:', error);
    return { category: 'unknown', reason: 'Classification failed' };
  }
}

/**
 * 4. Safety Filter Wrapper
 */
export async function safeLLMCall(prompt: string): Promise<string> {
  // Add safety checks before calling OpenAI
  const blockedPatterns = [
    /suicide/i,
    /kill\s+(yourself|myself|himself|herself)/i,
    /self-harm/i,
    /violence/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(prompt)) {
      throw new Error('Safety filter triggered: Blocked content detected.');
    }
  }

  try {
    const response = await openai.chat.completions.create({
      model: env.LLM_DEFAULT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';

    // Post-filter response
    for (const pattern of blockedPatterns) {
      if (pattern.test(content)) {
        throw new Error('Safety filter triggered: Blocked content in response.');
      }
    }

    return content;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Safety filter')) {
      throw error;
    }
    console.error('LLM call error:', error);
    throw new Error('LLM service unavailable');
  }
}

/**
 * 5. Price Estimator / Order Reasoning
 */
export async function estimateOrderDetails(
  message: string,
  productCatalog: Array<{ id: string; name: string; price?: number }>
): Promise<{
  productId: string | null;
  productName: string | null;
  estimatedQuantity: number;
  confidence: number;
}> {
  const prompt = `The business sells products. Identify what the user wants and estimate quantity.

Message: "${message}"

Products:
${JSON.stringify(productCatalog, null, 2)}

Return JSON:
{
  "productId": "..." or null,
  "productName": "..." or null,
  "estimatedQuantity": 1,
  "confidence": 0.0 - 1.0
}`;

  try {
    const response = await openai.chat.completions.create({
      model: env.LLM_DEFAULT_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You analyze order requests. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    return {
      productId: result.productId || null,
      productName: result.productName || null,
      estimatedQuantity: Math.max(1, result.estimatedQuantity || 1),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    console.error('Order estimation error:', error);
    return {
      productId: null,
      productName: null,
      estimatedQuantity: 1,
      confidence: 0.0,
    };
  }
}

/**
 * Usage example with organization context
 */
export async function detectIntentWithOrgContext(
  message: string,
  orgId: string
): Promise<{ intent: string; confidence: number }> {
  // Fetch organization context from database
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      businessMemory: true,
      products: {
        where: { isActive: true },
        take: 10,
      },
    },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  const orgContext = {
    name: org.name,
    businessMemory: org.businessMemory,
    productNames: org.products.map((p) => p.name),
  };

  return detectIntent(message, orgContext);
}

