import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Lora } from 'next/font/google';
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

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  preload: true,
});

import { OrganizationJsonLd, WebSiteJsonLd, SiteNavigationJsonLd } from '@/components/seo/JsonLd';
import { ChatbotWidget } from '@/src/components/chatbot/ChatbotWidget';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#04111c' },
  ],
};

const APP_URL =
  process.env.GCP_SEARCH_CONSOLE_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://www.threadsecurity.in';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Thread Security Education — Advanced Cybersecurity & AI Training Institute',
    template: '%s | Thread Security Education',
  },
  description:
    "India's premier Cybersecurity & AI Education & Training Institute. Master Ethical Hacking, SOC Analyst (L1/L2), Penetration Testing, DevSecOps, and AI Security with 100% practical sandboxed labs, 1-on-1 industry mentorship, and verified placement support.",
  keywords: [
    'Cybersecurity Training',
    'Cybersecurity Education',
    'Ethical Hacking Course & Certification',
    'SOC Analyst Training L1 L2',
    'Hands-on Cyber Defense Training',
    'DevSecOps Training & Certification',
    'AI Security Engineering Course',
    'Thread Security Education',
    'TSE Cyber Range',
    'VAPT Training Punjab India',
    'Live Mentor-Led Cyber Training',
    'Industrial Cybersecurity Internship',
    'Placement Guaranteed Cybersecurity Training',
    'Practical Sandboxed Security Labs',
    'Cybersecurity Training Institute India',
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
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Thread Security Education — Expert-Led Cybersecurity & AI Training',
    description:
      'Master Ethical Hacking, SOC Operations, DevSecOps, and AI Security with 100% practical sandboxed labs, 1-on-1 industry mentorship, and verified TS-ID credentials.',
    siteName: 'Thread Security Education',
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    images: [
      {
        url: '/images/og-thread-security-education.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Thread Security Education — Expert-Led Cybersecurity & AI Training Institute',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thread Security Education — Expert-Led Cybersecurity & AI Training',
    description:
      'Master Ethical Hacking, SOC Operations, DevSecOps, and AI Security with 100% practical sandboxed labs, 1-on-1 industry mentorship, and verified TS-ID credentials.',
    images: ['/images/og-thread-security-education.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${lora.variable}`}>
      <head>
        {/* Google Fonts: Lora Display & Editorial Typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />

        {/* Favicons & Site Web Manifest for Googlebot & Mobile Viewports */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-black antialiased">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <SiteNavigationJsonLd />
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
