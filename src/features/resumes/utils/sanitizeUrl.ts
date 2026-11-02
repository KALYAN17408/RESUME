/**
 * Sanitizes URLs to ensure only safe protocols (http, https, mailto, tel) are rendered as links.
 * Prevents javascript: or data: injection in resume links.
 */
export function sanitizeUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // If email without mailto, prepend mailto:
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  // If telephone without tel, check for phone pattern
  if (/^\+?[\d\s-()]{7,}$/.test(trimmed) && !trimmed.startsWith('http')) {
    return `tel:${trimmed.replace(/[^\d+]/g, '')}`;
  }

  // If starts with http:// or https://, validate protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // If domain-like (e.g. linkedin.com/in/... or github.com/...)
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // If already mailto: or tel:
  if (/^(mailto|tel):/i.test(trimmed)) {
    return trimmed;
  }

  return '';
}

/**
 * Extracts a readable clean display label from a URL
 * Example: "https://linkedin.com/in/alex" -> "linkedin.com/in/alex"
 */
export function cleanDisplayUrl(url?: string): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/^mailto:/i, '')
    .replace(/^tel:/i, '')
    .replace(/\/$/, '');
}
