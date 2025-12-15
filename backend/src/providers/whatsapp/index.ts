import { env } from '../../env';
import { MockWhatsAppProvider } from './mock.provider';
import { MetaWhatsAppProvider } from './meta.provider';
import { Dialog360Provider } from './360dialog.provider';
import { IWhatsAppProvider } from './types';

let providerInstance: IWhatsAppProvider | null = null;

export function getWhatsAppProvider(): IWhatsAppProvider {
  if (!providerInstance) {
    switch (env.WA_PROVIDER) {
      case 'meta':
        providerInstance = new MetaWhatsAppProvider();
        break;
      case '360dialog':
        providerInstance = new Dialog360Provider();
        break;
      case 'mock':
      default:
        providerInstance = new MockWhatsAppProvider();
        break;
    }
  }

  return providerInstance;
}

export { IWhatsAppProvider } from './types';

