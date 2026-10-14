/**
 * Canonical Site Web URL Helper
 *
 * Guarantees a 100% valid, absolute HTTP/HTTPS URL for metadataBase,
 * sitemaps, robots.txt, and JSON-LD schemas.
 *
 * Safely strips any Google Search Console prefixes (such as `sc-domain:`)
 * and always guarantees a valid protocol so `new URL()` can never throw ERR_INVALID_URL.
 */
export function getSiteUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'https://www.threadsecurity.in';

  // Strip Google Search Console resource identifier prefix if present
  if (url.startsWith('sc-domain:')) {
    url = url.replace(/^sc-domain:/, '');
  }

  // Ensure absolute HTTP/HTTPS protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Remove trailing slashes
  return url.replace(/\/+$/, '');
}

/**
 * Returns a guaranteed valid URL object for metadataBase
 */
export function getSiteMetadataBase(): URL {
  try {
    return new URL(getSiteUrl());
  } catch {
    return new URL('https://www.threadsecurity.in');
  }
}
