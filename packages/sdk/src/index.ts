import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ZyraConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  triggers: any;
  conditions: any;
  actions: any;
  schedule?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisRequest {
  id: string;
  sourceType: string;
  sourceId?: string;
  payload: any;
  modelUsed: string;
  params?: any;
  result?: any;
  confidence?: number;
  createdAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'scheduled' | 'ad-hoc';
  frequency?: 'daily' | 'weekly' | 'monthly';
  query: any;
  lastRunAt?: string;
  recipients?: any[];
  settings: any;
  createdAt: string;
}

export interface ZyraResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ZyraClient {
  private client: AxiosInstance;

  constructor(config: ZyraConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.zyra.com/api',
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new Error(`Zyra API Error: ${error.response.data.message || error.message}`);
        }
        throw error;
      }
    );
  }

  // Email Automation Methods
  async createEmailAutomation(automation: Omit<EmailAutomation, 'id' | 'createdAt' | 'updatedAt'>): Promise<ZyraResponse<EmailAutomation>> {
    const response: AxiosResponse<ZyraResponse<EmailAutomation>> = await this.client.post('/automations/email', automation);
    return response.data;
  }

  async getEmailAutomations(page = 1, limit = 10): Promise<ZyraResponse<{ data: EmailAutomation[]; pagination: any }>> {
    const response: AxiosResponse<ZyraResponse<{ data: EmailAutomation[]; pagination: any }>> = await this.client.get('/automations/email', {
      params: { page, limit }
    });
    return response.data;
  }

  async updateEmailAutomation(id: string, automation: Partial<EmailAutomation>): Promise<ZyraResponse> {
    const response: AxiosResponse<ZyraResponse> = await this.client.put(`/automations/email/${id}`, automation);
    return response.data;
  }

  async deleteEmailAutomation(id: string): Promise<ZyraResponse> {
    const response: AxiosResponse<ZyraResponse> = await this.client.delete(`/automations/email/${id}`);
    return response.data;
  }

  async triggerEmailAutomation(id: string, triggerPayload?: any): Promise<ZyraResponse<{ runId: string }>> {
    const response: AxiosResponse<ZyraResponse<{ runId: string }>> = await this.client.post(`/automations/email/${id}/trigger`, {
      triggerPayload
    });
    return response.data;
  }

  // AI Analysis Methods
  async analyzeContent(sourceType: string, sourceId: string, options?: any): Promise<ZyraResponse<AIAnalysisRequest>> {
    const response: AxiosResponse<ZyraResponse<AIAnalysisRequest>> = await this.client.post('/ai/analyze', {
      sourceType,
      sourceId,
      options
    });
    return response.data;
  }

  async getAIAnalysis(id: string): Promise<ZyraResponse<AIAnalysisRequest>> {
    const response: AxiosResponse<ZyraResponse<AIAnalysisRequest>> = await this.client.get(`/ai/analysis/${id}`);
    return response.data;
  }

  async generateCV(cvData: {
    personalInfo: any;
    experience: any[];
    education: any[];
    skills: string[];
    template?: string;
  }): Promise<ZyraResponse<{ content: string; html: string; tokens: number; cost: number }>> {
    const response: AxiosResponse<ZyraResponse<{ content: string; html: string; tokens: number; cost: number }>> = await this.client.post('/ai/generate/cv', cvData);
    return response.data;
  }

  async generateSocialContent(contentData: {
    platform: string;
    topic: string;
    tone: string;
    targetAudience: string;
    includeHashtags?: boolean;
    includeCallToAction?: boolean;
  }): Promise<ZyraResponse<{ content: string; engagementScore: number; hashtags: string[]; tokens: number; cost: number }>> {
    const response: AxiosResponse<ZyraResponse<{ content: string; engagementScore: number; hashtags: string[]; tokens: number; cost: number }>> = await this.client.post('/ai/generate/social', contentData);
    return response.data;
  }

  async generatePersona(personaData: {
    dataSource: string;
    sampleSize?: number;
    criteria?: any;
  }): Promise<ZyraResponse<{ persona: any; tokens: number; cost: number }>> {
    const response: AxiosResponse<ZyraResponse<{ persona: any; tokens: number; cost: number }>> = await this.client.post('/ai/generate/persona', personaData);
    return response.data;
  }

  // Reports Methods
  async createReport(report: Omit<Report, 'id' | 'createdAt'>): Promise<ZyraResponse<Report>> {
    const response: AxiosResponse<ZyraResponse<Report>> = await this.client.post('/reports', report);
    return response.data;
  }

  async getReports(): Promise<ZyraResponse<Report[]>> {
    const response: AxiosResponse<ZyraResponse<Report[]>> = await this.client.get('/reports');
    return response.data;
  }

  async runReport(id: string): Promise<ZyraResponse<{ runId: string }>> {
    const response: AxiosResponse<ZyraResponse<{ runId: string }>> = await this.client.post(`/reports/${id}/run`);
    return response.data;
  }

  async downloadReport(runId: string): Promise<Buffer> {
    const response: AxiosResponse<Buffer> = await this.client.get(`/reports/download/${runId}`, {
      responseType: 'arraybuffer'
    });
    return Buffer.from(response.data);
  }

  // Integration Methods
  async getIntegrationStatus(): Promise<ZyraResponse<{
    email: any;
    sms: any;
    social: any;
    payment: any;
  }>> {
    const response: AxiosResponse<ZyraResponse<{
      email: any;
      sms: any;
      social: any;
      payment: any;
    }>> = await this.client.get('/integrations/status');
    return response.data;
  }

  async requestVerification(provider: string, identifier: string, method: string): Promise<ZyraResponse<{ verificationId: string; message: string }>> {
    const response: AxiosResponse<ZyraResponse<{ verificationId: string; message: string }>> = await this.client.post('/integrations/verify', {
      provider,
      identifier,
      method
    });
    return response.data;
  }

  async confirmVerification(token: string): Promise<ZyraResponse<{ accountType: string; identifier: string; verified: boolean }>> {
    const response: AxiosResponse<ZyraResponse<{ accountType: string; identifier: string; verified: boolean }>> = await this.client.post('/integrations/verify/confirm', {
      token
    });
    return response.data;
  }

  async testConnection(type: string, config?: any): Promise<ZyraResponse<{ connected: boolean; message: string }>> {
    const response: AxiosResponse<ZyraResponse<{ connected: boolean; message: string }>> = await this.client.post('/integrations/test-connection', {
      type,
      config
    });
    return response.data;
  }

  // Utility Methods
  async healthCheck(): Promise<ZyraResponse<{ status: string; timestamp: string; uptime: number }>> {
    const response: AxiosResponse<ZyraResponse<{ status: string; timestamp: string; uptime: number }>> = await this.client.get('/health');
    return response.data;
  }
}

// Export default client factory
export function createZyraClient(config: ZyraConfig): ZyraClient {
  return new ZyraClient(config);
}

// Export types
export * from './types';
