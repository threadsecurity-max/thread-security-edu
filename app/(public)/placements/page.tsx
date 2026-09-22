import { Metadata } from 'next';
import PlacementHighlightsClient from '../placements/PlacementHighlightsClient';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080';

export const metadata: Metadata = {
  title: 'Placement Highlights & Alumni Career Outcomes | Thread Security',
  description: 'Explore verified career transformation stories and hiring partners of Thread Security Education alumni placed at top cybersecurity firms worldwide.',
  keywords: [
    'Cybersecurity Placements',
    'TSE Alumni Outcomes',
    'Cybersecurity Jobs India',
    'Ethical Hacking Hiring Partners',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/placements`,
  },
  openGraph: {
    title: 'Placement Highlights & Career Outcomes | Thread Security Education',
    description: 'Explore verified career transformation stories and hiring partners of TSE alumni.',
    url: `${APP_URL}/placements`,
    type: 'website',
  },
};

export default function PlacementsPage() {
  return <PlacementHighlightsClient />;
}
