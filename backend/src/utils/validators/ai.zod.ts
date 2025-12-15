import { z } from 'zod';

/**
 * Zod schemas for LLM outputs - validation and type safety
 */

export const IntentClassificationSchema = z.object({
  intent: z.enum([
    'GENERAL_GREETING',
    'PRODUCT_INQUIRY',
    'PRICE_REQUEST',
    'ORDER_PLACEMENT',
    'PAYMENT_INTENT',
    'DELIVERY_QUESTION',
    'NEGOTIATION',
    'FOLLOW_UP',
    'COMPLAINT',
    'OUT_OF_SCOPE',
    'UNKNOWN',
  ]),
  confidence: z.number().min(0).max(1),
  explain: z.string().max(200),
});

export const EntityExtractionSchema = z.object({
  product_mentioned: z.string().nullable(),
  product_matches: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
  size: z.string().nullable(),
  color: z.string().nullable(),
  quantity: z.number().int().positive().nullable(),
  location_text: z.string().nullable(),
  urgency: z.enum(['high', 'medium', 'low']).nullable(),
  tone: z.enum(['angry', 'happy', 'neutral', 'confused']).nullable(),
  confidence_overall: z.number().min(0).max(1),
});

/**
 * Validate LLM output against schema with fallback
 */
export function validateLLMOutput<T>(schema: z.ZodSchema<T>, output: any, fallback: T): T {
  try {
    return schema.parse(output);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('LLM output validation failed:', error.errors);
    }
    return fallback;
  }
}

/**
 * Safe JSON parse with schema validation
 */
export function parseAndValidate<T>(schema: z.ZodSchema<T>, text: string, fallback: T): T {
  try {
    // Extract JSON from text if wrapped in markdown
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    
    const parsed = JSON.parse(jsonText);
    return schema.parse(parsed);
  } catch (error) {
    console.error('JSON parse/validation error:', error);
    return fallback;
  }
}

