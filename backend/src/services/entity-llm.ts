// LLM fallback functions for entity extraction
import { Product } from '@prisma/client';
import { LLMClient } from '../providers/llm/LLMClient';
import { EntityExtractionResult } from './entity.service';

export async function extractEntitiesWithLLM(
  text: string,
  products: Product[]
): Promise<EntityExtractionResult> {
  const llmClient = new LLMClient();

  // Limit catalog to top 10 products to reduce prompt size
  const catalog = products.slice(0, 10).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku || '',
    variants: [], // Could be extracted from metadata if available
  }));

  const prompt = `SYSTEM:
You are Zyra's entity extractor. Output ONLY JSON with this schema:
{
  "entities": {
    "product_mentioned": "<string or null>",
    "product_matches": [ {"product_id": "<id or null>", "name": "<string>", "confidence": <0.0-1.0> } ],
    "size": "<string or null>",
    "color": "<string or null>",
    "quantity": <integer or null>,
    "location_text": "<string or null>",
    "payment_reference": "<string or null>"
  },
  "confidence_overall": <float 0.0-1.0>,
  "notes": "<short explanation>"
}

CONSTRAINTS:
- Only use product names provided in 'catalog' for matching; do NOT hallucinate new products.
- If you are not sure about product, return product_mentioned=null and an empty array for product_matches.
- Return numeric values (quantity) as integers or null.
- Return JSON only.

INPUT:
- text: "${text}"
- catalog: ${JSON.stringify(catalog)}
- locale hints: { "country": "Kenya", "currency": "KES" }

TASK:
Extract entities from 'text' and attempt to match to catalog entries. Provide confidences.

END.`;

  try {
    const response = await llmClient.generateReply(prompt, {
      maxTokens: 200,
      temperature: 0.2,
    });

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;

    const parsed = JSON.parse(jsonStr);
    const entities = parsed.entities || {};

    // Map LLM product matches to actual Product objects
    const matchedProducts: Array<{ product: Product; confidence: number }> = [];
    if (entities.product_matches && Array.isArray(entities.product_matches)) {
      for (const match of entities.product_matches) {
        if (match.product_id) {
          const product = products.find((p) => p.id === match.product_id);
          if (product) {
            matchedProducts.push({
              product,
              confidence: Math.max(0, Math.min(1, match.confidence || 0.5)),
            });
          }
        }
      }
    }

    return {
      products: matchedProducts,
      quantity: entities.quantity ? parseInt(entities.quantity) : null,
      size: entities.size || null,
      color: entities.color || null,
      location: entities.location_text || null,
      confidenceOverall: Math.max(0, Math.min(1, parsed.confidence_overall || 0.5)),
    };
  } catch (error: any) {
    console.error('LLM entity extraction parse error:', error);
    return {
      products: [],
      quantity: null,
      size: null,
      color: null,
      location: null,
      confidenceOverall: 0.3,
    };
  }
}

