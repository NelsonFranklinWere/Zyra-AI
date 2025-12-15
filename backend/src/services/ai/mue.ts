import { llmClient } from '../llm/llm.client';
import { env } from '../../env';
import { PrismaClient } from '@prisma/client';
import { cacheGet, cacheSet } from '../../lib/redis.client';
import { getTraceId } from '../../lib/trace';
// Note: fast-fuzzy can be added as dependency: npm install fast-fuzzy
// For now using simple substring matching

const prisma = new PrismaClient();

export interface MUEParseResult {
  product_mentioned: string | null;
  product_matches: Array<{ id: string; name: string; confidence: number }>;
  size: string | null;
  color: string | null;
  quantity: number | null;
  location_text: string | null;
  urgency: 'high' | 'medium' | 'low' | null;
  tone: 'angry' | 'happy' | 'neutral' | 'confused' | null;
  confidence_overall: number;
}

/**
 * Message Understanding Engine (MUE)
 * Extracts product candidates, size, color, qty, location hints, payment mention, urgency, tone
 */
export async function parseMessage(params: {
  message: string;
  conversationId?: string;
  orgId: string;
  products: Array<{ id: string; name: string; price?: number; description?: string }>;
  traceId?: string;
}): Promise<MUEParseResult> {
  const traceId = getTraceId(params.traceId);

  // Step 1: Product fuzzy matching
  const productMatches = fuzzyMatchProducts(params.message, params.products);

  // Step 2: Regex extraction for numbers/sizes
  const extractedFields = extractFieldsWithRegex(params.message);

  // Step 3: LLM fallback if ambiguity
  let llmResult: MUEParseResult | null = null;
  
  if (productMatches.length === 0 || extractedFields.confidence < 0.6) {
    try {
      llmResult = await llmClient.extractEntities({
        text: params.message,
        catalogSample: params.products.slice(0, 10), // Top 10 products
        orgId: params.orgId,
      });
    } catch (error) {
      console.error('MUE LLM extraction failed:', error);
    }
  }

  // Merge results
  const finalResult: MUEParseResult = {
    product_mentioned: productMatches[0]?.name || llmResult?.product_mentioned || null,
    product_matches: productMatches.length > 0 ? productMatches : (llmResult?.product_matches || []),
    size: extractedFields.size || llmResult?.size || null,
    color: extractedFields.color || llmResult?.color || null,
    quantity: extractedFields.quantity || llmResult?.quantity || null,
    location_text: extractedFields.location || llmResult?.location_text || null,
    urgency: extractedFields.urgency || llmResult?.urgency || null,
    tone: extractedFields.tone || llmResult?.tone || null,
    confidence_overall: Math.max(
      productMatches.length > 0 ? 0.7 : 0.3,
      extractedFields.confidence,
      llmResult?.confidence_overall || 0
    ),
  };

  // Write trace
  await createTrace({
    traceId,
    messageId: undefined,
    orgId: params.orgId,
    conversationId: params.conversationId,
    traceType: 'MUE_PARSED',
    payload: finalResult,
    success: true,
  });

  return finalResult;
}

/**
 * Fuzzy match products using fast-fuzzy
 */
function fuzzyMatchProducts(
  text: string,
  products: Array<{ id: string; name: string }>
): Array<{ id: string; name: string; confidence: number }> {
  const matches: Array<{ id: string; name: string; confidence: number }> = [];
  
  for (const product of products) {
    // Use simple substring matching (fast-fuzzy can be added as dependency)
    const productLower = product.name.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match
    if (textLower.includes(productLower)) {
      matches.push({ id: product.id, name: product.name, confidence: 0.9 });
    }
    // Word-based match
    else {
      const productWords = productLower.split(/\s+/);
      const matchedWords = productWords.filter((word) => textLower.includes(word));
      if (matchedWords.length >= 2 || (matchedWords.length === 1 && productWords.length === 1)) {
        const confidence = matchedWords.length / productWords.length;
        if (confidence >= 0.5) {
          matches.push({ id: product.id, name: product.name, confidence: Math.max(0.6, confidence) });
        }
      }
    }
  }

  // Sort by confidence
  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 5); // Top 5
}

/**
 * Extract fields using regex patterns
 */
function extractFieldsWithRegex(text: string): {
  size: string | null;
  color: string | null;
  quantity: number | null;
  location: string | null;
  urgency: 'high' | 'medium' | 'low' | null;
  tone: 'angry' | 'happy' | 'neutral' | 'confused' | null;
  confidence: number;
} {
  const lower = text.toLowerCase();
  let confidence = 0.5;

  // Size extraction (common patterns: size 42, size:42, 42 size, EU 42, US 10)
  const sizePatterns = [
    /\b(size|sizes?)\s*:?\s*(\d{1,2})\b/i,
    /\b(\d{1,2})\s*(?:size|shoe|us|eu|uk)?\b/i,
    /\b(eu|us|uk)\s*(\d{1,2})\b/i,
  ];
  let size: string | null = null;
  for (const pattern of sizePatterns) {
    const match = text.match(pattern);
    if (match) {
      size = match[2] || match[1];
      confidence += 0.1;
      break;
    }
  }

  // Color extraction (common colors)
  const colors = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'grey', 'gray', 'silver', 'gold', 'navy', 'beige', 'khaki',
    'nyeusi', 'nyeupe', 'nyekundu', // Swahili colors
  ];
  let color: string | null = null;
  for (const col of colors) {
    if (lower.includes(col)) {
      color = col;
      confidence += 0.1;
      break;
    }
  }

  // Quantity extraction
  const qtyPatterns = [
    /\b(\d+)\s*(?:pieces?|pairs?|items?|units?|pcs?)\b/i,
    /\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/i,
  ];
  let quantity: number | null = null;
  const numMap: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };
  for (const pattern of qtyPatterns) {
    const match = text.match(pattern);
    if (match) {
      quantity = numMap[match[1]?.toLowerCase()] || parseInt(match[1] || match[0]);
      confidence += 0.1;
      break;
    }
  }

  // Location hints (Nairobi areas, common phrases)
  const locationKeywords = [
    'kilimani', 'westlands', 'karen', 'langata', 'runda', 'lavington', 'parklands',
    'hurlingham', 'nairobi', 'nairobi west', 'nairobi east',
    'pickup', 'delivery', 'location', 'address', 'area',
  ];
  let location: string | null = null;
  for (const keyword of locationKeywords) {
    if (lower.includes(keyword)) {
      // Extract surrounding text
      const index = lower.indexOf(keyword);
      const context = text.substring(Math.max(0, index - 20), Math.min(text.length, index + keyword.length + 20));
      location = context.trim();
      confidence += 0.1;
      break;
    }
  }

  // Urgency detection
  let urgency: 'high' | 'medium' | 'low' | null = null;
  if (/(urgent|asap|now|quickly|immediately|haraka)/i.test(text)) {
    urgency = 'high';
    confidence += 0.1;
  } else if (/(soon|today|leo|kesho)/i.test(text)) {
    urgency = 'medium';
    confidence += 0.05;
  } else {
    urgency = 'low';
  }

  // Tone detection
  let tone: 'angry' | 'happy' | 'neutral' | 'confused' | null = null;
  if (/(angry|frustrated|disappointed|sad|upset)/i.test(text)) {
    tone = 'angry';
  } else if (/(happy|excited|thank|thanks|asante|great|good)/i.test(text)) {
    tone = 'happy';
  } else if (/(confused|not sure|unsure|how|what|where|when)/i.test(text)) {
    tone = 'confused';
  } else {
    tone = 'neutral';
  }

  return {
    size,
    color,
    quantity,
    location,
    urgency,
    tone,
    confidence: Math.min(1, confidence),
  };
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

