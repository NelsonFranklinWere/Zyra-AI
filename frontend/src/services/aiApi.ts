import { apiClient } from '@/lib/api-client';

export interface SimulateMessageRequest {
  message: string;
  conversationId?: string;
}

export interface SimulateMessageResponse {
  traceId: string;
  intent: {
    intent: string;
    confidence: number;
    explanation: string;
  };
  parsed: any;
  reply: {
    replyText: string;
    actions: string[];
  };
}

export interface Trace {
  id: string;
  traceType: string;
  payload: any;
  success: boolean;
  errorMsg?: string;
  createdAt: string;
}

export interface BusinessMemory {
  faqs?: Array<{ q: string; a: string }>;
  instructions?: Record<string, any>;
  negotiationRules?: Record<string, any>;
  deliveryRules?: Record<string, any>;
}

export const aiApi = {
  /**
   * Simulate message processing
   */
  async simulateMessage(data: SimulateMessageRequest): Promise<SimulateMessageResponse> {
    const response = await apiClient.post('/ai/simulate', data);
    return response.data.data;
  },

  /**
   * Get processing traces
   */
  async getTraces(params?: {
    conversationId?: string;
    traceType?: string;
  }): Promise<Trace[]> {
    const response = await apiClient.get('/ai/traces', { params });
    return response.data.data || [];
  },

  /**
   * Get business memory
   */
  async getMemory(): Promise<BusinessMemory | null> {
    const response = await apiClient.get('/ai/memory');
    return response.data.data || null;
  },

  /**
   * Update business memory
   */
  async updateMemory(memory: Partial<BusinessMemory>): Promise<BusinessMemory> {
    const response = await apiClient.put('/ai/memory', memory);
    return response.data.data;
  },

  /**
   * Process social comment
   */
  async processComment(comment: {
    text: string;
    username: string;
    platform: string;
    postId?: string;
    commentId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/ai/comment', comment);
    return response.data.data;
  },

  /**
   * Replay action for a message
   */
  async replayAction(messageId: string, action: string): Promise<any> {
    const response = await apiClient.post('/ai/replay-action', {
      messageId,
      action,
    });
    return response.data.data;
  },
};

