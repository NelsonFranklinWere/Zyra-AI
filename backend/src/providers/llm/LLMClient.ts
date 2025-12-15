import { env } from '../../env';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { LocalProvider } from './LocalProvider';

export interface LLMProvider {
  generateReply(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string>;
  classifyIntent(prompt: string): Promise<string>;
}

export class LLMClient implements LLMProvider {
  private provider: LLMProvider;

  constructor() {
    switch (env.LLM_PROVIDER) {
      case 'openai':
        this.provider = new OpenAIProvider();
        break;
      case 'anthropic':
        this.provider = new AnthropicProvider();
        break;
      case 'local':
      case 'none':
      default:
        this.provider = new LocalProvider();
        break;
    }
  }

  async generateReply(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string> {
    return this.provider.generateReply(prompt, options);
  }

  async classifyIntent(prompt: string): Promise<string> {
    return this.provider.classifyIntent(prompt);
  }
}

