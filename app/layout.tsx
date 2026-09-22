import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '@/src/styles/tokens.css';
import '@/src/styles/typography.css';
import '@/src/styles/glass.css';
import '@/src/styles/utilities.css';
import '@/src/styles/landing.css';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  preload: true,
});

import { OrganizationJsonLd } from '@/components/seo/JsonLd';
import { ChatbotWidget } from '@/src/components/chatbot/ChatbotWidget';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:8080'
  ),
  title: {
    default: 'Thread Security Education (TSE) — Practical Cybersecurity & AI Training Academy',
    template: '%s | Thread Security Education (TSE)',
  },
  description:
    "North India's premier Cybersecurity & AI Training Academy. Master Ethical Hacking, SOC Operations, DevSecOps, and AI Security with 100% practical sandboxed labs, 1-on-1 mentorship, and placement support.",
  keywords: [
    'Cybersecurity Training Punjab',
    'AI Security Engineering',
    'Ethical Hacking Course',
    'SOC Analyst Training',
    'Thread Security Education',
    'TSE Academy',
    'VAPT Certification',
    'DevSecOps',
    'Practical Sandboxed Labs',
  ],
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'QmebTToupewaQ9lJBaJIaj--HfxPkJl2dbe-p2k38CI',
  },
  authors: [{ name: 'Thread Security Education Team' }],
  icons: {
    icon: [
      { url: '/logos/TSE Logo Light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/logos/TSE Logo Dark.svg', media: '(prefers-color-scheme: dark)' },
    ],
    shortcut: '/logos/TSE Logo Light.svg',
    apple: '/logos/TSE Logo Light.svg',
  },
  openGraph: {
    title: 'Thread Security Education — Practical Cybersecurity & AI Training Academy',
    description:
      'Master Ethical Hacking, SOC Operations, DevSecOps, and AI Security with 100% practical sandboxed labs, expert mentorship, and verified TS-ID certificates.',
    siteName: 'Thread Security Education',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/logos/TSE Logo Dark.svg',
        width: 1200,
        height: 630,
        alt: 'Thread Security Education LMS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thread Security Education — Cybersecurity & AI LMS',
    description:
      'Structured curriculum, practical sandboxed labs, expert mentorship, and cryptographically verified certificates.',
    images: ['/logos/TSE Logo Dark.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* Preload critical LCP hero image asset */}
        <link rel="preload" as="image" href="/images/TSE Design.svg" fetchPriority="high" />
        <link rel="preload" as="image" href="/images/TSE Hero Grid Base.svg" fetchPriority="high" />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-black antialiased">
        <OrganizationJsonLd />
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
