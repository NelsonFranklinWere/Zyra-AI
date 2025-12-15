export interface WhatsAppMessage {
  from: string;
  to: string;
  text?: string;
  type: 'text' | 'template' | 'media';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface WhatsAppSendOptions {
  template?: string;
  templateVariables?: Record<string, string>;
  buttons?: Array<{ id: string; title: string }>;
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    caption?: string;
  };
}

export interface IWhatsAppProvider {
  sendText(to: string, text: string, options?: WhatsAppSendOptions): Promise<string>;
  sendTemplate(
    to: string,
    templateName: string,
    variables: Record<string, string>
  ): Promise<string>;
  registerWebhook(app: any): void;
  name(): string;
}

