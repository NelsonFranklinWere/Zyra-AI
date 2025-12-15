import { env } from '../../env';
import { LLMProvider } from './LLMClient';

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, using local fallback');
    }
  }

  async generateReply(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string> {
    if (!this.apiKey) {
      return `[OpenAI not configured] Response for: ${prompt.substring(0, 50)}...`;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options?.maxTokens || 150,
          temperature: options?.temperature || 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async classifyIntent(prompt: string): Promise<string> {
    return this.generateReply(prompt, { maxTokens: 50, temperature: 0.3 });
  }
}

