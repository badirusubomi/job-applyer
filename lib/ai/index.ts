import { AIProvider } from './types';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { LocalProvider } from './providers/local';

export type AIModelType = 'openai' | 'gemini' | 'local';

export function getProvider(model: AIModelType): AIProvider {
  switch (model) {
    case 'openai':
      return OpenAIProvider;
    case 'gemini':
      return GeminiProvider;
    case 'local':
      return LocalProvider;
    default:
      return OpenAIProvider;
  }
}

export * from './types';
