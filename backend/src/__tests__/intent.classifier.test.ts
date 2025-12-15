import { classifyIntent } from '../services/intent/intent.classifier';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');
jest.mock('../lib/redis.client');
jest.mock('../services/llm/llm.client');

const mockPrisma = {
  aIProcessingTrace: {
    create: jest.fn(),
  },
};

(PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

describe('Intent Classifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rule-based classification', () => {
    it('should detect greeting intent', async () => {
      const result = await classifyIntent({
        message: 'Hello, good morning!',
        orgId: 'test-org',
      });

      expect(result.intent).toBe('GENERAL_GREETING');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect product inquiry intent', async () => {
      const result = await classifyIntent({
        message: 'Do you have black sneakers?',
        orgId: 'test-org',
      });

      expect(['PRODUCT_INQUIRY', 'ORDER_PLACEMENT']).toContain(result.intent);
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should detect order placement intent', async () => {
      const result = await classifyIntent({
        message: 'I want to buy size 42 black sneakers',
        orgId: 'test-org',
      });

      expect(result.intent).toBe('ORDER_PLACEMENT');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect payment intent', async () => {
      const result = await classifyIntent({
        message: 'I have paid via M-Pesa',
        orgId: 'test-org',
      });

      expect(result.intent).toBe('PAYMENT_INTENT');
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('LLM fallback', () => {
    it('should use LLM when confidence is low', async () => {
      // This would require mocking the LLM client
      // For now, just verify the function doesn't throw
      const result = await classifyIntent({
        message: 'This is a very ambiguous message that might need LLM',
        orgId: 'test-org',
      });

      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.explanation).toBeDefined();
    });
  });

  describe('Sheng language support', () => {
    it('should detect greetings in Sheng', async () => {
      const result = await classifyIntent({
        message: 'Mambo, habari yako?',
        orgId: 'test-org',
      });

      expect(result.intent).toBe('GENERAL_GREETING');
    });
  });
});

