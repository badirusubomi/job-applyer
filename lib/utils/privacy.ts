/**
 * Privacy Utility for PII Masking
 * Replaces sensitive information with placeholders before sending to LLMs
 */

export interface PrivacyConfig {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const PLACEHOLDERS = {
  name: '{{USER_NAME}}',
  email: '{{USER_EMAIL}}',
  phone: '{{USER_PHONE}}',
  address: '{{USER_ADDRESS}}',
};

/**
 * Masks PII in a given string based on the provided configuration.
 */
export function maskPii(text: string, config: PrivacyConfig): string {
  if (!text) return text;
  let masked = text;

  if (config.name) {
    masked = masked.replaceAll(config.name, PLACEHOLDERS.name);
  }
  if (config.email) {
    masked = masked.replaceAll(config.email, PLACEHOLDERS.email);
  }
  if (config.phone) {
    masked = masked.replaceAll(config.phone, PLACEHOLDERS.phone);
  }
  if (config.address) {
    masked = masked.replaceAll(config.address, PLACEHOLDERS.address);
  }

  return masked;
}

/**
 * Recursively unmasks PII placeholders in a JSON object or string.
 */
export function unmaskPii(data: any, config: PrivacyConfig): any {
  if (typeof data === 'string') {
    let unmasked = data;
    if (config.name) unmasked = unmasked.replaceAll(PLACEHOLDERS.name, config.name);
    if (config.email) unmasked = unmasked.replaceAll(PLACEHOLDERS.email, config.email);
    if (config.phone) unmasked = unmasked.replaceAll(PLACEHOLDERS.phone, config.phone);
    if (config.address) unmasked = unmasked.replaceAll(PLACEHOLDERS.address, config.address);
    return unmasked;
  }

  if (Array.isArray(data)) {
    return data.map(item => unmaskPii(item, config));
  }

  if (data !== null && typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      result[key] = unmaskPii(data[key], config);
    }
    return result;
  }

  return data;
}
