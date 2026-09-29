import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.GCP_SEARCH_CONSOLE_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'https://threadsecurity.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
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
          '/(admin)/',
          '/mentor/',
          '/(mentor)/',
          '/student/',
          '/(student)/',
          '/api/',
          '/dev/',
          '/_next/',
          '/login',
          '/register',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/mentor/',
          '/student/',
          '/api/',
          '/login',
          '/register',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/mentor/',
          '/student/',
          '/api/',
          '/login',
          '/register',
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
