/**
 * Helper utilities for resolving and managing Blog Cover Images across TSE.
 */

export interface BlogMediaItem {
  id: string;
  url?: string | null;
  altText?: string | null;
  caption?: string | null;
  isCover?: boolean;
}

// Curated 1080x711 High-Definition Cybersecurity Hero Presets
export const CYBERSECURITY_COVER_PRESETS = [
  {
    id: 'preset-threat-intel',
    name: 'Threat Intelligence & Zero-Day',
    category: 'Threat Intelligence',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1080&h=711&q=80',
    altText: 'Cybersecurity operations center showing network telemetry and threat intelligence feeds',
  },
  {
    id: 'preset-soc-telemetry',
    name: 'SOC Telemetry & SIEM Pipeline',
    category: 'Cybersecurity',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&h=711&q=80',
    altText: 'Digital binary matrix stream and security operations center incident monitoring',
  },
  {
    id: 'preset-offensive-red-team',
    name: 'Offensive Security & Red Teaming',
    category: 'Ethical Hacking',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1080&h=711&q=80',
    altText: 'Terminal screen with exploit payloads and penetration testing console commands',
  },
  {
    id: 'preset-cloud-devsecops',
    name: 'Cloud Security & DevSecOps',
    category: 'Cloud',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&h=711&q=80',
    altText: 'Global satellite network nodes and cloud infrastructure defense layer',
  },
];

/**
 * Robustly extracts the cover image URL for any blog post.
 * Handles legacy records, null URLs, and prioritized Cloudinary media.
 */
export function getBlogCoverImageUrl(blog: any): string | null {
  if (!blog) return null;

  // 1. Direct coverImage relation if joined
  if (blog.coverImage?.url && typeof blog.coverImage.url === 'string' && blog.coverImage.url.startsWith('http')) {
    return blog.coverImage.url;
  }

  // 2. Match blog.coverImageId in media array
  if (blog.coverImageId && Array.isArray(blog.media) && blog.media.length > 0) {
    const matched = blog.media.find(
      (m: any) => m.id === blog.coverImageId && typeof m.url === 'string' && m.url.trim().length > 0 && m.url.startsWith('http')
    );
    if (matched?.url) return matched.url;
  }

  // 3. Search backwards in media array for the most recently added valid URL
  if (Array.isArray(blog.media) && blog.media.length > 0) {
    const reversed = [...blog.media].reverse();
    const valid = reversed.find(
      (m: any) => typeof m.url === 'string' && m.url.trim().length > 0 && m.url.startsWith('http')
    );
    if (valid?.url) return valid.url;
  }

  // 4. Check SEO ogImage
  if (blog.seo?.ogImage && typeof blog.seo.ogImage === 'string' && blog.seo.ogImage.startsWith('http')) {
    return blog.seo.ogImage;
  }

  return null;
}

/**
 * Extracts alt text for the blog cover image.
 */
export function getBlogCoverImageAlt(blog: any): string {
  if (!blog) return 'Cybersecurity Research Article';

  if (blog.coverImageId && Array.isArray(blog.media)) {
    const matched = blog.media.find((m: any) => m.id === blog.coverImageId);
    if (matched?.altText) return matched.altText;
  }

  if (Array.isArray(blog.media) && blog.media.length > 0) {
    const valid = blog.media.find((m: any) => m.altText);
    if (valid?.altText) return valid.altText;
  }

  return blog.title || 'Cybersecurity Research Article';
}
