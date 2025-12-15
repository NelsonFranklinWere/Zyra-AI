import { llmClient } from '../llm/llm.client';
import { env } from '../../env';
import { cacheGet, cacheSet } from '../../lib/redis.client';
import { PrismaClient } from '@prisma/client';
import { generateTraceId, getTraceId } from '../../lib/trace';

const prisma = new PrismaClient();

export interface IntentClassificationResult {
  intent: string;
  confidence: number;
  explanation: string;
}

/**
 * Keyword lists for rule-based intent detection (English + Sheng)
 */
const INTENT_KEYWORDS: Record<string, string[]> = {
  GENERAL_GREETING: [
    'hi', 'hello', 'hey', 'hallo', 'mambo', 'habari', 'niaje', 'sasa', 'niajambo',
    'good morning', 'good afternoon', 'good evening', 'greetings',
  ],
  PRODUCT_INQUIRY: [
    'do you have', 'have you got', 'available', 'in stock', 'show me', 'what products',
    'catalog', 'what do you sell', 'what\'s available', 'naweza pata', 'ninaweza kupata',
  ],
  PRICE_REQUEST: [
    'how much', 'price', 'cost', 'charge', 'pricing', 'amount', 'ni ngapi', 'pesa ngapi',
    'how many', 'bei gani', 'ngapi',
  ],
  ORDER_PLACEMENT: [
    'want', 'need', 'buy', 'order', 'get', 'take', 'i\'ll take', 'give me', 'send me',
    'nataka', 'nunua', 'order', 'order hii', 'nitumie', 'nifunge',
  ],
  PAYMENT_INTENT: [
    'paid', 'pay', 'payment', 'lipa', 'send money', 'mpesa', 'cash', 'nimeshalipa',
    'nimepay', 'nimepeana', 'nimeweka pesa',
  ],
  DELIVERY_QUESTION: [
    'deliver', 'delivery', 'bring', 'where', 'location', 'address', 'pickup',
    'leta wapi', 'delivery wapi', 'utaleta wapi', 'address gani',
  ],
  NEGOTIATION: [
    'discount', 'reduce', 'cheaper', 'lower price', 'negotiate', 'panga bei',
    'punguza', 'sawa kidogo', 'punguza price',
  ],
  COMPLAINT: [
    'problem', 'issue', 'wrong', 'bad', 'broken', 'complaint', 'not working', 'defective',
    'kuna tatizo', 'imeharibika', 'si sawa', 'nina shida',
  ],
};

/**
 * Hybrid Intent Classifier
 * 1. Fast rule-based (regex + keyword sets)
 * 2. LLM fallback if confidence < 0.7
 */
export async function classifyIntent(params: {
  message: string;
  conversationId?: string;
  orgId: string;
  contextMessages?: Array<{ role: string; content: string }>;
  products?: Array<{ id: string; name: string }>;
  traceId?: string;
}): Promise<IntentClassificationResult> {
  const traceId = getTraceId(params.traceId);
  
  // Check cache first (last 20 intents per org, TTL 1 hour)
  const cacheKey = `intent:${params.orgId}:${hashMessage(params.message)}`;
  const cached = await cacheGet<IntentClassificationResult>(cacheKey);
  if (cached) {
    await createTrace({
      traceId,
      messageId: undefined,
      orgId: params.orgId,
      conversationId: params.conversationId,
      traceType: 'INTENT_DETECTED',
      payload: { ...cached, source: 'cache' },
      success: true,
    });
    return cached;
  }

  // Step 1: Fast rule-based classification
  const ruleBasedResult = classifyIntentRuleBased(params.message);

  // Step 2: LLM fallback if confidence < 0.7 or LLM enabled
  let finalResult = ruleBasedResult;

  if (ruleBasedResult.confidence < 0.7 || (env.LLM_PROVIDER !== 'none' && ruleBasedResult.confidence < env.AI_MIN_CONFIDENCE)) {
    try {
      const llmResult = await llmClient.classifyIntent({
        message: params.message,
        contextMessages: params.contextMessages || [],
        productNames: params.products?.map((p) => p.name) || [],
        orgId: params.orgId,
      });

      // Use LLM result if it has higher confidence
      if (llmResult.confidence > ruleBasedResult.confidence) {
        finalResult = {
          intent: llmResult.intent,
          confidence: llmResult.confidence,
          explanation: llmResult.explain,
        };
      }
    } catch (error) {
      console.error('LLM intent classification failed:', error);
      // Fallback to rule-based result
    }
  }

  // Cache result (TTL 1 hour)
  await cacheSet(cacheKey, finalResult, 3600);

  // Write trace
  await createTrace({
    traceId,
    messageId: undefined,
    orgId: params.orgId,
    conversationId: params.conversationId,
    traceType: 'INTENT_DETECTED',
    payload: { ...finalResult, source: ruleBasedResult.confidence >= 0.7 ? 'rule-based' : 'hybrid' },
    success: true,
  });

  return finalResult;
}

/**
 * Rule-based intent classification using keyword matching
 */
function classifyIntentRuleBased(message: string): IntentClassificationResult {
  const lower = message.toLowerCase();
  let bestMatch: { intent: string; score: number } | null = null;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    let matches = 0;

    for (const keyword of keywords) {
      // Exact word match (better score)
      const wordRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (wordRegex.test(lower)) {
        score += 2;
        matches++;
      }
      // Partial match (lower score)
      else if (lower.includes(keyword)) {
        score += 1;
        matches++;
      }
    }

    // Normalize score by keyword count
    const normalizedScore = matches > 0 ? Math.min(1, score / (keywords.length * 1.5)) : 0;

    if (normalizedScore > 0 && (!bestMatch || normalizedScore > bestMatch.score)) {
      bestMatch = { intent, score: normalizedScore };
    }
  }

  if (bestMatch && bestMatch.score >= 0.3) {
    return {
      intent: bestMatch.intent,
      confidence: Math.min(0.9, bestMatch.score), // Cap at 0.9 for rule-based
      explanation: `Rule-based match: ${bestMatch.intent}`,
    };
  }

  return {
    intent: 'UNKNOWN',
    confidence: 0.3,
    explanation: 'No clear intent detected (rule-based)',
  };
}

/**
 * Hash message for cache key (simple, fast)
 */
function hashMessage(message: string): string {
  // Simple hash for cache key (not cryptographic)
  let hash = 0;
  const normalized = message.toLowerCase().trim();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
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
    // Don't throw - tracing should not break main flow
  }
}

