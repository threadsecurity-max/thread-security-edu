import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  serverExternalPackages: ['googleapis'],
  devIndicators: false,
  reactStrictMode: true,
  compress: true,
  experimental: {
    webpackMemoryOptimizations: true,
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-accordion',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip',
      'date-fns',
    ],
  },
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin/employee%20attendance/:path*',
        destination: '/admin/employee-attendance/:path*',
        permanent: false,
      },
      {
        source: '/mentor/blog',
        destination: '/mentor/blogs',
        permanent: false,
      },
      {
        source: '/mentor/blog/:path*',
        destination: '/mentor/blogs/:path*',
        permanent: false,
      },
      {
        source: '/auth/login',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: '/register',
        permanent: true,
      },
      {
        source: '/course/:slug',
        destination: '/courses/:slug',
        permanent: true,
      },
      {
        source: '/curriculum',
        destination: '/#curriculum-roadmap',
        permanent: true,
      },
      {
        source: '/certificate',
        destination: '/verify-certificate',
        permanent: true,
      },
      {
        source: '/certificate-verification',
        destination: '/verify-certificate',
        permanent: true,
      },
      {
        source: '/verify',
        destination: '/verify-certificate',
        permanent: true,
      },
      {
        source: '/batches',
        destination: '/#apply-batches',
        permanent: true,
      },
      {
        source: '/faq',
        destination: '/#faq',
        permanent: true,
      },
      {
        source: '/projects',
        destination: '/#projects',
        permanent: true,
      },
      {
        source: '/reviews',
        destination: '/#reviews',
        permanent: true,
      },
      {
        source: '/roadmap',
        destination: '/#curriculum-roadmap',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:slug(cybersecurity-course-in-jalandhar|ethical-hacking-course-in-jalandhar|ceh-course-in-jalandhar|cybersecurity-professional-course-in-jalandhar|bug-bounty-course-in-jalandhar|bug-bounty-hunting-course-in-jalandhar|penetration-testing-course-in-jalandhar|web-application-penetration-testing-course-in-jalandhar|soc-analyst-course-in-jalandhar|cybersecurity-professional-fellowship-course-in-jalandhar|defensive-cybersecurity-course-in-jalandhar|blue-team-course-in-jalandhar|soc-operations-course-in-jalandhar|web-penetration-testing-course-in-jalandhar|enterprise-red-teaming-course-in-jalandhar|adversary-simulation-course-in-jalandhar|web-security-course-in-jalandhar|advanced-ethical-hacking-course-in-jalandhar|artificial-intelligence-course-in-jalandhar|ai-course-in-jalandhar|python-for-ai-course-in-jalandhar|ai-programming-course-in-jalandhar|python-programming-for-ai-course-in-jalandhar|ai-security-course-in-jalandhar|responsible-ai-engineering-course-in-jalandhar|ai-security-responsible-ai-course-in-jalandhar|data-analysis-course-in-jalandhar|data-analytics-course-in-jalandhar|business-intelligence-course-in-jalandhar|power-bi-course-in-jalandhar|tableau-course-in-jalandhar|data-science-course-in-jalandhar|machine-learning-course-in-jalandhar|advanced-data-science-course-in-jalandhar|machine-learning-engineering-course-in-jalandhar|deep-learning-course-in-jalandhar|neural-networks-course-in-jalandhar|ai-security-llm-red-teaming-course-in-jalandhar|rag-security-vector-database-defense-course-in-jalandhar|enterprise-ai-governance-guardrails-course-in-jalandhar|model-inversion-model-stealing-defense-course-in-jalandhar|prompt-injection-jailbreak-defense-course-in-jalandhar|computer-vision-deepfake-intelligence-course-in-jalandhar|adversarial-machine-learning-evasion-attacks-course-in-jalandhar|ai-safety-dual-llm-moderation-course-in-jalandhar)',
        destination: '/courses/:slug',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/logos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

