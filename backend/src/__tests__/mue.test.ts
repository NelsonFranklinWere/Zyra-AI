import { parseMessage } from '../services/ai/mue';
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

describe('Message Understanding Engine (MUE)', () => {
  const mockProducts = [
    { id: 'p1', name: 'Black Sneakers', price: 3500 },
    { id: 'p2', name: 'White Running Shoes', price: 4200 },
    { id: 'p3', name: 'Red Canvas', price: 2800 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Product matching', () => {
    it('should match products by name', async () => {
      const result = await parseMessage({
        message: 'Do you have black sneakers?',
        orgId: 'test-org',
        products: mockProducts,
      });

      expect(result.product_matches.length).toBeGreaterThan(0);
      expect(result.product_matches[0].name.toLowerCase()).toContain('black');
    });

    it('should handle partial product name matches', async () => {
      const result = await parseMessage({
        message: 'I want sneakers',
        orgId: 'test-org',
        products: mockProducts,
      });

      expect(result.product_matches.length).toBeGreaterThan(0);
    });
  });

  describe('Size extraction', () => {
    it('should extract size from message', async () => {
      const result = await parseMessage({
        message: 'Do you have size 42?',
        orgId: 'test-org',
        products: mockProducts,
      });

      expect(result.size).toBe('42');
    });

    it('should extract size in different formats', async () => {
      const testCases = [
        { message: 'size 42', expected: '42' },
        { message: 'EU 42', expected: '42' },
        { message: 'size: 42', expected: '42' },
      ];

      for (const testCase of testCases) {
        const result = await parseMessage({
          message: testCase.message,
          orgId: 'test-org',
          products: mockProducts,
        });
        expect(result.size).toBe(testCase.expected);
      }
    });
  });

  describe('Color extraction', () => {
    it('should extract color from message', async () => {
      const result = await parseMessage({
        message: 'I want black sneakers',
        orgId: 'test-org',
        products: mockProducts,
      });

      expect(result.color).toBe('black');
    });
  });

  describe('Quantity extraction', () => {
    it('should extract numeric quantity', async () => {
      const result = await parseMessage({
        message: 'I want 2 pairs of sneakers',
        orgId: 'test-org',
        products: mockProducts,
      });

      expect(result.quantity).toBe(2);
    });

    it('should extract word-based quantity', async () => {
      const result = await parseMessage({
        message: 'I want two pairs',
        orgId: 'test-org',
        products: mockProducts,
      });

      expect(result.quantity).toBe(2);
    });
  });

  describe('Location extraction', () => {
    it('should extract location hints', async () => {
      const result = await parseMessage({
        message: 'Can you deliver to Kilimani?',
        orgId: 'test-org',
        products: mockProducts,
      });

      expect(result.location_text).toBeDefined();
      expect(result.location_text?.toLowerCase()).toContain('kilimani');
    });
  });

  describe('Urgency detection', () => {
    it('should detect high urgency', async () => {
      const result = await parseMessage({
        message: 'I need this urgently, ASAP!',
        orgId: 'test-org',
        products: mockProducts,
      });

      expect(result.urgency).toBe('high');
    });

    it('should detect medium urgency', async () => {
      const result = await parseMessage({
        message: 'I need it today',
        orgId: 'test-org',
        products: mockProducts,
      });

      expect(result.urgency).toBe('medium');
    });
  });
});

