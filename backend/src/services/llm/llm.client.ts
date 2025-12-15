import { LLMClient as BaseLLMClient } from '../../providers/llm/LLMClient';
import { env } from '../../env';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const baseClient = new BaseLLMClient();

/**
 * Hash prompt for deduplication (privacy-safe)
 */
function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

/**
 * Estimate token count (rough: ~4 chars per token)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Enhanced LLM Client with Sprint 3 methods
 */
export class EnhancedLLMClient {
  private baseClient: BaseLLMClient;

  constructor() {
    this.baseClient = new BaseLLMClient();
  }

  /**
   * Log LLM usage to database
   */
  private async logUsage(params: {
    orgId: string;
    userId?: string;
    prompt: string;
    response: string;
    model?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const promptHash = hashPrompt(params.prompt);
      const tokensUsed = estimateTokens(params.prompt + params.response);

      await prisma.aIUsage.create({
        data: {
          orgId: params.orgId,
          userId: params.userId,
          model: params.model || env.LLM_DEFAULT_MODEL,
          promptHash,
          tokensUsed,
          metadata: params.metadata || {},
        },
      });
    } catch (error) {
      console.error('Failed to log LLM usage:', error);
      // Don't throw - logging should not break main flow
    }
  }

  /**
   * Parse JSON response with fallback
   */
  private parseJSON<T>(text: string, fallback: T): T {
    try {
      // Extract JSON from text if wrapped in markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      
      return JSON.parse(jsonText) as T;
    } catch (error) {
      console.error('JSON parse error:', error, 'Text:', text);
      return fallback;
    }
  }

  /**
   * Classify intent from message
   */
  async classifyIntent(params: {
    message: string;
    contextMessages?: Array<{ role: string; content: string }>;
    productNames?: string[];
    orgId: string;
  }): Promise<{ intent: string; confidence: number; explain: string }> {
    if (env.LLM_PROVIDER === 'none') {
      // Rule-based fallback
      return this.classifyIntentRuleBased(params.message);
    }

    const prompt = `SYSTEM: You are Zyra's intent classifier. Return ONLY JSON in the schema:

{"intent":"<one of: GENERAL_GREETING, PRODUCT_INQUIRY, PRICE_REQUEST, ORDER_PLACEMENT, PAYMENT_INTENT, DELIVERY_QUESTION, NEGOTIATION, FOLLOW_UP, COMPLAINT, OUT_OF_SCOPE, UNKNOWN>", "confidence":0.0-1.0, "explain":"short explanation"}

CONSTRAINTS:
- Do not invent prices, phone numbers, or account numbers.
- Return valid JSON only, no extra text.

INPUT:
last_message: "${params.message}"
last_messages: ${JSON.stringify(params.contextMessages || [])}
nearby_products: ${JSON.stringify(params.productNames || [])}

TASK: Classify the intent. Return JSON only.`;

    try {
      const response = await this.baseClient.generateReply(prompt, {
        maxTokens: 150,
        temperature: 0.3,
      });

      await this.logUsage({
        orgId: params.orgId,
        prompt,
        response,
        metadata: { type: 'classifyIntent' },
      });

      const parsed = this.parseJSON<{ intent: string; confidence: number; explain: string }>(
        response,
        { intent: 'UNKNOWN', confidence: 0.3, explain: 'Parse failed' }
      );

      return {
        intent: parsed.intent || 'UNKNOWN',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        explain: parsed.explain || 'LLM classified',
      };
    } catch (error) {
      console.error('Intent classification error:', error);
      return this.classifyIntentRuleBased(params.message);
    }
  }

  /**
   * Rule-based intent classification fallback
   */
  private classifyIntentRuleBased(message: string): { intent: string; confidence: number; explain: string } {
    const lower = message.toLowerCase();

    // Greeting patterns
    if (/^(hi|hello|hey|hallo|mambo|habari|niaje)/i.test(message)) {
      return { intent: 'GENERAL_GREETING', confidence: 0.8, explain: 'Greeting keyword detected' };
    }

    // Order placement patterns
    if (/(want|need|buy|order|get|take|i'll take|give me|send me)/i.test(lower)) {
      return { intent: 'ORDER_PLACEMENT', confidence: 0.7, explain: 'Order keyword detected' };
    }

    // Price inquiry
    if (/(how much|price|cost|charge|pricing|amount)/i.test(lower)) {
      return { intent: 'PRICE_REQUEST', confidence: 0.7, explain: 'Price keyword detected' };
    }

    // Payment
    if (/(paid|pay|payment|lipa|send money|mpesa|cash)/i.test(lower)) {
      return { intent: 'PAYMENT_INTENT', confidence: 0.7, explain: 'Payment keyword detected' };
    }

    // Delivery
    if (/(deliver|delivery|bring|where|location|address|pickup)/i.test(lower)) {
      return { intent: 'DELIVERY_QUESTION', confidence: 0.7, explain: 'Delivery keyword detected' };
    }

    return { intent: 'UNKNOWN', confidence: 0.3, explain: 'No clear intent detected' };
  }

  /**
   * Extract entities using MUE (Message Understanding Engine)
   */
  async extractEntities(params: {
    text: string;
    catalogSample: Array<{ id: string; name: string }>;
    orgId: string;
  }): Promise<{
    product_mentioned: string | null;
    product_matches: Array<{ id: string; name: string; confidence: number }>;
    size: string | null;
    color: string | null;
    quantity: number | null;
    location_text: string | null;
    urgency: 'high' | 'medium' | 'low' | null;
    tone: 'angry' | 'happy' | 'neutral' | 'confused' | null;
    confidence_overall: number;
  }> {
    if (env.LLM_PROVIDER === 'none') {
      return this.extractEntitiesRuleBased(params.text, params.catalogSample);
    }

    const prompt = `SYSTEM: You are Zyra's extractor. Return ONLY JSON:

{
  "product_mentioned": null | "Black Sneaker",
  "product_matches": [{"id":"p1","name":"Black Sneaker","confidence":0.0-1.0}],
  "size": null | "42",
  "color": null | "black",
  "quantity": null | 1,
  "location_text": null | "Kilimani",
  "urgency": null | "high|medium|low",
  "tone": null | "angry|happy|neutral|confused",
  "confidence_overall": 0.0-1.0
}

INPUT:
text: "${params.text}"
catalog_sample: ${JSON.stringify(params.catalogSample)}

CONSTRAINTS: Use catalog only; do not invent products. Return JSON only.`;

    try {
      const response = await this.baseClient.generateReply(prompt, {
        maxTokens: 300,
        temperature: 0.2,
      });

      await this.logUsage({
        orgId: params.orgId,
        prompt,
        response,
        metadata: { type: 'extractEntities' },
      });

      const fallback = {
        product_mentioned: null,
        product_matches: [],
        size: null,
        color: null,
        quantity: null,
        location_text: null,
        urgency: null,
        tone: null,
        confidence_overall: 0.3,
      };

      return this.parseJSON(response, fallback);
    } catch (error) {
      console.error('Entity extraction error:', error);
      return this.extractEntitiesRuleBased(params.text, params.catalogSample);
    }
  }

  /**
   * Rule-based entity extraction fallback
   */
  private extractEntitiesRuleBased(
    text: string,
    catalog: Array<{ id: string; name: string }>
  ): any {
    const lower = text.toLowerCase();
    const result: any = {
      product_mentioned: null,
      product_matches: [],
      size: null,
      color: null,
      quantity: null,
      location_text: null,
      urgency: null,
      tone: null,
      confidence_overall: 0.3,
    };

    // Extract size (common patterns)
    const sizeMatch = text.match(/\b(size|sizes?)\s*:?\s*(\d{1,2})\b/i) || text.match(/\b(\d{1,2})\s*(?:size|shoe|us|eu)?\b/i);
    if (sizeMatch) {
      result.size = sizeMatch[2] || sizeMatch[1];
    }

    // Extract quantity
    const qtyMatch = text.match(/\b(\d+)\s*(?:pieces?|pairs?|items?|units?)\b/i) || text.match(/\b(?:one|two|three|four|five)\b/i);
    if (qtyMatch) {
      const numMap: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
      result.quantity = numMap[qtyMatch[1]?.toLowerCase()] || parseInt(qtyMatch[1] || qtyMatch[0]);
    }

    // Match products (simple keyword matching)
    for (const product of catalog) {
      const productWords = product.name.toLowerCase().split(/\s+/);
      if (productWords.some((word) => lower.includes(word))) {
        result.product_matches.push({
          id: product.id,
          name: product.name,
          confidence: 0.6,
        });
        result.product_mentioned = product.name;
      }
    }

    // Detect urgency
    if (/(urgent|asap|now|quickly|immediately)/i.test(text)) {
      result.urgency = 'high';
    } else if (/(soon|today)/i.test(text)) {
      result.urgency = 'medium';
    }

    return result;
  }

  /**
   * Paraphrase template with LLM
   */
  async paraphraseTemplate(params: {
    templateContent: string;
    variables: Record<string, string | number>;
    tone?: string;
    orgId: string;
  }): Promise<string> {
    if (env.LLM_PROVIDER === 'none') {
      // Simple replacement fallback
      let result = params.templateContent;
      for (const [key, value] of Object.entries(params.variables)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      }
      return result;
    }

    const prompt = `SYSTEM: You are Zyra. Produce a short reply (<= 2 sentences) in the tone: ${params.tone || 'friendly'}.

TEMPLATE: "${params.templateContent}"
VARIABLES: ${JSON.stringify(params.variables)}

CONSTRAINTS:
- Do not add or change placeholders (e.g., {{customer_name}}, {{order_id}} MUST NOT be changed).
- Do not invent numbers or account details.
- Output plain text only (the rendered message).

OUTPUT: plain text (the rendered message).`;

    try {
      const response = await this.baseClient.generateReply(prompt, {
        maxTokens: 200,
        temperature: 0.7,
      });

      await this.logUsage({
        orgId: params.orgId,
        prompt,
        response,
        metadata: { type: 'paraphraseTemplate' },
      });

      return response.trim();
    } catch (error) {
      console.error('Template paraphrasing error:', error);
      // Fallback to simple replacement
      let result = params.templateContent;
      for (const [key, value] of Object.entries(params.variables)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      }
      return result;
    }
  }

  /**
   * Generate AI reply
   */
  async generateReply(params: {
    intent: string;
    context: string;
    businessMemory?: any;
    productInfo?: Array<{ name: string; price: number }>;
    orgId: string;
  }): Promise<string> {
    if (env.LLM_PROVIDER === 'none') {
      return this.generateReplyRuleBased(params.intent, params.context);
    }

    const memoryContext = params.businessMemory
      ? `\nBusiness Instructions: ${JSON.stringify(params.businessMemory.instructions || {})}\nFAQs: ${JSON.stringify(params.businessMemory.faqs || [])}`
      : '';

    const productContext = params.productInfo
      ? `\nAvailable Products: ${JSON.stringify(params.productInfo.map((p) => ({ name: p.name, price: p.price })))}`
      : '';

    const prompt = `You are Zyra, a helpful sales assistant for a small business.

${memoryContext}

${productContext}

Customer Intent: ${params.intent}
Context: ${params.context}

INSTRUCTIONS:
- Be friendly, helpful, and concise (1-2 sentences max).
- Never invent prices, phone numbers, or account details.
- If unsure about prices, refer to product catalog or ask owner.
- Use the provided product information only.

Generate a helpful reply:`;

    try {
      const response = await this.baseClient.generateReply(prompt, {
        maxTokens: env.LLM_MAX_TOKENS,
        temperature: 0.7,
      });

      await this.logUsage({
        orgId: params.orgId,
        prompt,
        response,
        metadata: { type: 'generateReply', intent: params.intent },
      });

      return response.trim();
    } catch (error) {
      console.error('Reply generation error:', error);
      return this.generateReplyRuleBased(params.intent, params.context);
    }
  }

  /**
   * Rule-based reply generation fallback
   */
  private generateReplyRuleBased(intent: string, context: string): string {
    const replies: Record<string, string> = {
      GENERAL_GREETING: 'Hello! How can I help you today?',
      PRODUCT_INQUIRY: 'Thanks for your interest! What product are you looking for?',
      PRICE_REQUEST: 'I can help you with pricing. Which product would you like to know about?',
      ORDER_PLACEMENT: 'Great! I can help you place an order. What would you like?',
      PAYMENT_INTENT: 'I can help with payment. Please let me know which order you\'re paying for.',
      DELIVERY_QUESTION: 'I can help with delivery information. What would you like to know?',
    };

    return replies[intent] || 'Thanks for your message! How can I assist you?';
  }
}

export const llmClient = new EnhancedLLMClient();

