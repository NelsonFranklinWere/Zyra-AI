import { processOrderFlow } from '../services/orders/order.ai';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

describe('Order AI Integration', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      conversation: {
        findUnique: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      aISessionMemory: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      aIProcessingTrace: {
        create: jest.fn(),
      },
    };

    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Order flow state machine', () => {
    it('should ask for missing size', async () => {
      mockPrisma.aISessionMemory.findFirst.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'Black Sneakers', price: 3500 },
      ]);
      mockPrisma.conversation.findUnique.mockResolvedValue({
        id: 'conv1',
        externalId: '+254712345678',
      });

      const result = await processOrderFlow({
        conversationId: 'conv1',
        orgId: 'org1',
        message: 'I want black sneakers',
      });

      expect(result.state.status).toBe('collecting_info');
      expect(result.actions).toContain('ASK_FOR_SIZE');
      expect(result.response).toContain('size');
    });

    it('should ask for missing color', async () => {
      mockPrisma.aISessionMemory.findFirst.mockResolvedValue({
        memory: {
          orderState: {
            status: 'collecting_info',
            productId: 'p1',
            size: '42',
          },
        },
      });

      const result = await processOrderFlow({
        conversationId: 'conv1',
        orgId: 'org1',
        message: 'Size 42',
      });

      expect(result.actions).toContain('ASK_FOR_COLOR');
    });

    it('should create order when all fields present', async () => {
      mockPrisma.aISessionMemory.findFirst.mockResolvedValue({
        memory: {
          orderState: {
            status: 'collecting_info',
            productId: 'p1',
            size: '42',
            color: 'black',
            quantity: 1,
            location: 'Kilimani',
          },
        },
      });
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        name: 'Black Sneakers',
        price: 3500,
      });
      mockPrisma.conversation.findUnique.mockResolvedValue({
        id: 'conv1',
        externalId: '+254712345678',
      });
      mockPrisma.order.create.mockResolvedValue({
        id: 'order1',
        totalCents: 350000,
      });

      // Mock createOrder from order.service
      jest.mock('../services/order.service', () => ({
        createOrder: jest.fn().mockResolvedValue({
          id: 'order1',
          totalCents: 350000,
        }),
      }));

      const result = await processOrderFlow({
        conversationId: 'conv1',
        orgId: 'org1',
        message: 'Kilimani',
      });

      expect(result.state.status).toBe('confirmed');
      expect(result.actions).toContain('CONFIRM_ORDER');
      expect(result.actions).toContain('INIT_STK_PUSH');
    });
  });
});

