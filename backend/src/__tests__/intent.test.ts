import { describe, it, expect } from '@jest/globals';
import { detectIntent } from '../services/intent.service';

describe('Intent Detection', () => {
  it('should detect product_inquiry intent', async () => {
    const result = await detectIntent('Do you have size 42 black shoes?');
    expect(result.intent).toBe('product_inquiry');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should detect order_request intent', async () => {
    const result = await detectIntent('I want to buy 2 pairs');
    expect(result.intent).toBe('order_request');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should detect greeting intent', async () => {
    const result = await detectIntent('Hello, how are you?');
    expect(result.intent).toBe('greeting');
    expect(result.confidence).toBeGreaterThan(0.5);
  });
});

