import { env } from '../../env';
import { LLMProvider } from './LLMClient';

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Anthropic API key not configured, using local fallback');
    }
  }

  async generateReply(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string> {
    if (!this.apiKey) {
      return `[Anthropic not configured] Response for: ${prompt.substring(0, 50)}...`;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: options?.maxTokens || 150,
          temperature: options?.temperature || 0.7,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      return data.content[0]?.text || '';
    } catch (error: any) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  async classifyIntent(prompt: string): Promise<string> {
    return this.generateReply(prompt, { maxTokens: 50, temperature: 0.3 });
  }
}

