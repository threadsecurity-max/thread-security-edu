import React from 'react';
import { Metadata } from 'next';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutSubNav } from '@/components/about/AboutSubNav';
import { WhoWeAre } from '@/components/about/WhoWeAre';
import { BrandStory } from '@/components/about/BrandStory';
import { MissionVision } from '@/components/about/MissionVision';
import { WhatWeBring } from '@/components/about/WhatWeBring';
import { LearningJourney } from '@/components/about/LearningJourney';
import { VerificationDirectory } from '@/components/about/VerificationDirectory';
import { TransparencyDirectory } from '@/components/about/TransparencyDirectory';
import { EnrollmentChecklist } from '@/components/about/EnrollmentChecklist';
import { BrandPrinciples } from '@/components/about/BrandPrinciples';
import { AboutFAQ } from '@/components/about/AboutFAQ';
import { AboutCTA } from '@/components/about/AboutCTA';
import { AboutJsonLd } from '@/components/about/AboutJsonLd';

export const metadata: Metadata = {
  title: {
    absolute: 'About Thread Security | Our Mission, Vision & Cybersecurity Education',
  },
  description:
    'Discover Thread Security, our mission, vision, cybersecurity learning approach, verification information, and the details you should review before enrolling.',
  alternates: {
    canonical: 'https://threadsecurity.in/about',
  },
  openGraph: {
    title: 'About Thread Security | Our Mission, Vision & Cybersecurity Education',
    description:
      'Discover Thread Security, our mission, vision, cybersecurity learning approach, verification information, and the details you should review before enrolling.',
    url: 'https://threadsecurity.in/about',
    siteName: 'Thread Security Education',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Thread Security | Our Mission, Vision & Cybersecurity Education',
    description:
      'Discover Thread Security, our mission, vision, cybersecurity learning approach, verification information, and the details you should review before enrolling.',
  },
};

export default function AboutPage() {
  return (
    <div className="w-full bg-slate-950 text-white min-h-screen font-sans selection:bg-lime-400 selection:text-slate-950">
      <AboutHero />
      <AboutSubNav />
      <WhoWeAre />
      <BrandStory />
      <MissionVision />
      <WhatWeBring />
      <LearningJourney />
      <VerificationDirectory />
      <TransparencyDirectory />
      <EnrollmentChecklist />
      <BrandPrinciples />
      <AboutFAQ />
      <AboutCTA />
      <AboutJsonLd />
    </div>
  );
}
