import { AIProvider } from './types';
import { createOpenAIProvider } from './providers/openai';
import { createGeminiProvider } from './providers/gemini';
import { createLocalProvider } from './providers/local';

export type AIModelType = 'openai' | 'gemini' | 'local';

export function getProvider(model: AIModelType, apiKey?: string): AIProvider {
  switch (model) {
    case 'openai':
      return createOpenAIProvider(apiKey);
    case 'gemini':
      return createGeminiProvider(apiKey);
    case 'local':
      return createLocalProvider(apiKey); // Note: apiKey is treated as baseURL if local
    default:
      return createOpenAIProvider(apiKey);
  }
}

export * from './types';
