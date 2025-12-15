import { PrismaClient } from '@prisma/client';
import { LLMClient } from '../providers/llm/LLMClient';
import { env } from '../env';
import { checkOrgLLMBudget, recordLLMUsage, hashPrompt } from './llmUsage.service';
import { logLLMUsage } from './llmSafety.service';

const prisma = new PrismaClient();

export interface IntentResult {
  intent: string;
  confidence: number;
  explain: string;
}

const INTENT_PATTERNS: Record<string, RegExp[]> = {
  product_inquiry: [
    /\b(price|cost|how much|available|stock|in stock|do you have|have you got)\b/i,
  ],
  order_request: [
    /\b(want|buy|purchase|order|take|book|reserve|hold|i'll take|i need|i want)\b/i,
  ],
  payment_confirm: [
    /\b(paid|mpesa|sent|payment|transaction|paid via|just paid|completed payment)\b/i,
  ],
  delivery_query: [
    /\b(delivery|deliver|when|ETA|arrive|arrival|time|how long|where is)\b/i,
  ],
  greeting: [
    /\b(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/i,
  ],
  complaint: [
    /\b(problem|issue|wrong|bad|broken|complaint|not working|defective)\b/i,
  ],
};

export async function detectIntent(
  text: string,
  conversationId?: string,
  products?: any[]
): Promise<IntentResult> {
  const lowerText = text.toLowerCase();

  // Rule-based detection
  let bestMatch: { intent: string; score: number; explain: string } | null = null;

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    let score = 0;
    const matches: string[] = [];

    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        score += 1;
        const match = lowerText.match(pattern);
        if (match) matches.push(match[0]);
      }
    }

    if (score > 0) {
      const confidence = Math.min(score / patterns.length, 1);
      if (!bestMatch || confidence > bestMatch.score) {
        bestMatch = {
          intent,
          score: confidence,
          explain: `Matched patterns: ${matches.join(', ')}`,
        };
      }
    }
  }

  // If we have a confident match, return it
  if (bestMatch && bestMatch.score >= 0.5) {
    return {
      intent: bestMatch.intent,
      confidence: bestMatch.score,
      explain: bestMatch.explain,
    };
  }

  // LLM fallback (if enabled and confidence is low)
  if (env.LLM_PROVIDER !== 'none' && (!bestMatch || bestMatch.score < 0.5)) {
    try {
      // Get orgId from conversation if available
      let orgId: string | undefined;
      if (conversationId) {
        const conv = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });
        orgId = conv?.orgId;
      }

      // Check LLM budget if orgId available
      if (orgId) {
        const budgetCheck = await checkOrgLLMBudget(orgId);
        if (!budgetCheck.allowed) {
          console.warn(`LLM budget exceeded for org ${orgId}, using rule-based result`);
          // Use rule-based result or escalate
          return {
            intent: bestMatch?.intent || 'fallback',
            confidence: bestMatch?.score || 0.3,
            explain: bestMatch?.explain || 'LLM budget exceeded, using rule-based',
          };
        }
      }

      const llmResult = await detectIntentWithLLM(text, conversationId, products, orgId);
      if (llmResult.confidence > (bestMatch?.score || 0)) {
        return llmResult;
      }
    } catch (error) {
      console.error('LLM intent detection failed:', error);
    }
  }

  // Fallback
  return {
    intent: bestMatch?.intent || 'fallback',
    confidence: bestMatch?.score || 0.3,
    explain: bestMatch?.explain || 'No clear intent detected',
  };
}

async function detectIntentWithLLM(
  text: string,
  conversationId?: string,
  products?: any[]
): Promise<IntentResult> {
  const llmClient = new LLMClient();

  // Get context if available (last 1-3 messages)
  let contextMessages: Array<{ sender: string; text: string }> = [];
  if (conversationId) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    contextMessages = messages
      .reverse()
      .map((m) => ({ sender: m.sender, text: m.text }));
  }

  // Get nearby products (limit to top 10 for prompt size)
  const nearbyProducts = (products || [])
    .slice(0, 10)
    .map((p) => `${p.name}${p.sku ? ` (${p.sku})` : ''}`);

  // Build LLM prompt using production-quality template
  const prompt = `SYSTEM:
You are Zyra's intent classifier. Output ONLY valid JSON matching the schema:
{
  "intent": "<one of: product_inquiry, order_request, payment_confirm, delivery_query, greeting, complaint, fallback>",
  "confidence": <float 0.0 - 1.0>,
  "notes": "<short explanation, 0-140 chars>"
}

CONSTRAINTS:
- Use literal JSON only; do not add any extra text.
- If uncertain, return intent "fallback" with confidence <= 0.5.
- Do not invent product names or prices.
- Use short notes explaining top cues used.

INPUT:
- last_message: "${text}"
- context_messages: ${JSON.stringify(contextMessages)}
- nearby_products: ${JSON.stringify(nearbyProducts)}

TASK:
Classify the customer's intent based on 'last_message' and 'context_messages'.
Return JSON only.

END.`;

  const promptHash = hashPrompt(prompt);
  const startTime = Date.now();

  try {
    const response = await llmClient.generateReply(prompt, {
      maxTokens: 150,
      temperature: 0.3,
    });

    // Record LLM usage if orgId available
    if (orgId) {
      // Estimate tokens (rough: ~4 chars per token)
      const tokensUsed = Math.ceil(prompt.length / 4) + Math.ceil(response.length / 4);
      
      await recordLLMUsage({
        orgId,
        provider: env.LLM_PROVIDER,
        promptHash,
        promptLength: prompt.length,
        tokensUsed,
        metadata: {
          type: 'intent_classification',
          conversationId,
        },
      });

      // Also log for safety/audit
      await logLLMUsage({
        orgId,
        prompt,
        response,
        provider: env.LLM_PROVIDER,
        tokensUsed,
        metadata: {
          type: 'intent_classification',
          conversationId,
        },
      });
    }

    // Extract JSON from response (handle cases where LLM adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;

    const parsed = JSON.parse(jsonStr);
    
    // Validate and normalize response
    const validIntents = ['product_inquiry', 'order_request', 'payment_confirm', 'delivery_query', 'greeting', 'complaint', 'fallback'];
    const intent = validIntents.includes(parsed.intent) ? parsed.intent : 'fallback';
    const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));

    return {
      intent,
      confidence,
      explain: parsed.notes || 'LLM classified',
    };
  } catch (error: any) {
    console.error('LLM intent detection parse error:', error);
    return {
      intent: 'fallback',
      confidence: 0.5,
      explain: 'LLM response parse failed',
    };
  }
}

