import { LLMProvider } from './LLMClient';

export class LocalProvider implements LLMProvider {
  async generateReply(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string> {
    // Mock LLM - returns a simple response
    return 'Thank you for your message. We are here to help you with your inquiry.';
  }

  async classifyIntent(prompt: string): Promise<string> {
    // Mock classification
    return JSON.stringify({
      intent: 'fallback',
      confidence: 0.5,
      explain: 'Local mock provider',
    });
  }
}

