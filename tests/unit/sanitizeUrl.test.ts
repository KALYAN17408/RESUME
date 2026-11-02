import { describe, it, expect } from 'vitest';
import { sanitizeUrl, cleanDisplayUrl } from '@/features/resumes/utils/sanitizeUrl';

describe('sanitizeUrl utility', () => {
  it('allows https and http protocols', () => {
    expect(sanitizeUrl('https://linkedin.com/in/alex')).toBe('https://linkedin.com/in/alex');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('prepends https to domain URLs without protocol', () => {
    expect(sanitizeUrl('github.com/alex')).toBe('https://github.com/alex');
    expect(sanitizeUrl('alexjohnson.dev/portfolio')).toBe('https://alexjohnson.dev/portfolio');
  });

  it('prepends mailto: to email addresses', () => {
    expect(sanitizeUrl('alex@example.com')).toBe('mailto:alex@example.com');
  });

  it('prepends tel: to phone numbers', () => {
    expect(sanitizeUrl('+1 (555) 342-8901')).toBe('tel:+15553428901');
  });

  it('blocks javascript: and malicious protocols', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('data:text/html;base64,...')).toBe('');
  });

  it('cleans URLs for human display', () => {
    expect(cleanDisplayUrl('https://www.linkedin.com/in/alex/')).toBe('linkedin.com/in/alex');
    expect(cleanDisplayUrl('mailto:alex@example.com')).toBe('alex@example.com');
    expect(cleanDisplayUrl('https://github.com/alex')).toBe('github.com/alex');
  });
});
