/**
 * Lightweight server-side HTML Sanitizer for Rich Text / Blog / Notes content.
 * Prevents stored XSS, script injection, and dangerous URL protocols.
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return '';

  // 1. Remove dangerous script and iframe tags entirely
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // 2. Remove inline event handlers (e.g. onerror=..., onload=..., onclick=...)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 3. Neutralize dangerous URL protocols (javascript:, vbscript:, data:text/html)
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*(?:javascript|vbscript|data):[^"'>\s]*/gi, 'href="#"');

  return sanitized;
}

/**
 * Escapes plain text string for safe rendering in HTML contexts.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
