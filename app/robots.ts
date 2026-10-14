import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/*.css$',
          '/*.js$',
          '/_next/static/',
          '/images/',
          '/logos/',
        ],
        disallow: [
          '/admin/',
          '/mentor/',
          '/student/',
          '/api/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/checkout/',
          '/cart/',
          '/account/',
          '/staging/',
          '/test/',
          '/search?',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/*.css$',
          '/*.js$',
          '/_next/static/',
          '/images/',
          '/logos/',
        ],
        disallow: [
          '/admin/',
          '/mentor/',
          '/student/',
          '/api/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/checkout/',
          '/cart/',
          '/account/',
          '/staging/',
          '/test/',
          '/search?',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', '/images/', '/logos/', '/uploads/'],
        disallow: ['/admin/', '/mentor/', '/student/'],
      },
      {
        userAgent: '*',
        allow: [
          '/',
          '/*.css$',
          '/*.js$',
          '/_next/static/',
          '/favicon.ico',
          '/icon.png',
          '/apple-touch-icon.png',
          '/site.webmanifest',
          '/manifest.webmanifest',
          '/images/',
          '/logos/',
        ],
        disallow: [
          '/admin/',
          '/mentor/',
          '/student/',
          '/api/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/checkout/',
          '/cart/',
          '/account/',
          '/staging/',
          '/test/',
          '/search?',
        ],
      },
      // Block aggressive scraper bots from draining server bandwidth
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'RogstatBot'],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
