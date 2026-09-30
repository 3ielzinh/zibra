export const SITE_URL = 'https://zibraoficial.com.br';
export const SITE_NAME = 'ZIBRA';

export function absoluteUrl(value: string): string {
  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
