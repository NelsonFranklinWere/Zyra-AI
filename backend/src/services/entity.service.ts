import { Product } from '@prisma/client';
import { env } from '../env';
import { extractEntitiesWithLLM } from './entity-llm';
import { LLMClient } from '../providers/llm/LLMClient';
import { env } from '../env';

export interface ExtractedEntity {
  type: string;
  value: any;
  confidence: number;
  productId?: string;
}

export interface EntityExtractionResult {
  products: Array<{ product: Product; confidence: number }>;
  quantity: number | null;
  size: string | null;
  color: string | null;
  location: string | null;
  confidenceOverall?: number;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[len1][len2];
}

function fuzzyMatch(text: string, products: Product[]): Array<{ product: Product; confidence: number }> {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const matches: Array<{ product: Product; score: number }> = [];

  for (const product of products) {
    if (!product.isActive) continue;

    let score = 0;
    const productText = `${product.name} ${product.sku || ''} ${product.description || ''}`.toLowerCase();

    // Exact match
    if (productText.includes(lowerText) || lowerText.includes(productText)) {
      score += 10;
    }

    // Word matches
    for (const word of words) {
      if (word.length > 3 && productText.includes(word)) {
        score += 2;
      }
    }

    // Fuzzy match
    const distance = levenshteinDistance(lowerText, product.name.toLowerCase());
    const maxLen = Math.max(lowerText.length, product.name.length);
    const similarity = 1 - distance / maxLen;
    if (similarity > 0.6) {
      score += similarity * 5;
    }

    if (score > 0) {
      matches.push({ product, score });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((m) => ({
      product: m.product,
      confidence: Math.min(m.score / 10, 1),
    }));
}

export function extractEntities(text: string, products: Product[]): EntityExtractionResult {
  const lowerText = text.toLowerCase();

  // Product matching
  const productMatches = fuzzyMatch(text, products);

  // Quantity extraction
  const quantityMatch = text.match(/\b(\d+)\s*(piece|pcs|units?|x|×|pairs?)\b/i) || 
                       text.match(/\b(i want|i need|i'll take)\s+(\d+)\b/i);
  const quantity = quantityMatch ? parseInt(quantityMatch[1] || quantityMatch[2] || '1') : null;

  // Size extraction
  const sizePatterns = [
    /\b(size|sz)\s*:?\s*(\d+)\b/i,
    /\b(\d+)\s*(shoe|size|inch)\b/i,
  ];
  let size: string | null = null;
  for (const pattern of sizePatterns) {
    const match = text.match(pattern);
    if (match) {
      size = match[2] || match[1];
      break;
    }
  }

  // Color extraction
  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'brown', 'gray', 'grey'];
  let color: string | null = null;
  for (const c of colors) {
    if (lowerText.includes(c)) {
      color = c;
      break;
    }
  }

  // Location extraction (basic)
  const locationPatterns = [
    /\b(in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/,
  ];
  let location: string | null = null;
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      location = match[2];
      break;
    }
  }

  // If rule-based extraction found products with high confidence, return early
  if (productMatches.length > 0 && productMatches[0].confidence > 0.7) {
    return {
      products: productMatches,
      quantity: quantity || 1,
      size,
      color,
      location,
      confidenceOverall: productMatches[0].confidence,
    };
  }

  // LLM fallback for entity extraction (if enabled and confidence is low)
  if (env.LLM_PROVIDER !== 'none' && productMatches.length === 0) {
    try {
      const llmResult = await extractEntitiesWithLLM(text, products);
      if (llmResult.confidenceOverall && llmResult.confidenceOverall > 0.6) {
        return llmResult;
      }
    } catch (error) {
      console.error('LLM entity extraction failed:', error);
    }
  }

  return {
    products: productMatches,
    quantity: quantity || 1,
    size,
    color,
    location,
    confidenceOverall: productMatches.length > 0 ? productMatches[0].confidence : 0.3,
  };
}

