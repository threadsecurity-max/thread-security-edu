import { Metadata } from 'next';
import Link from 'next/link';
import { Compass, BookOpen, Layers, Award, Building, LifeBuoy, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Website Sitemap | Thread Security Education',
  description:
    'Complete directory and sitemap of all public courses, training tracks, student resources, verifiable credential verification, and legal documentation at Thread Security Education.',
  alternates: {
    canonical: 'https://threadsecurity.in/sitemap',
  },
};

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: 'Core Programs & Courses',
      icon: BookOpen,
      links: [
        { label: 'All Courses Overview', href: '/courses' },
        { label: 'Cybersecurity & Ethical Hacking (CEH)', href: '/courses#cybersecurity' },
        { label: 'Artificial Intelligence & AI Security', href: '/courses#ai-security' },
        { label: 'SOC Analyst & Threat Hunting', href: '/courses#soc-analyst' },
        { label: 'Cloud DevSecOps & Infrastructure Security', href: '/courses#devsecops' },
        { label: 'Placement Highlights & Packages', href: '/placements' },
      ],
    },
    {
      title: 'Training Tracks & Internships',
      icon: Layers,
      links: [
        { label: 'Learning Paths Directory', href: '/learning-paths' },
        { label: '6 Months Industrial Training', href: '/learning-paths#six-months' },
        { label: '6 Weeks Summer Internship', href: '/learning-paths#six-weeks' },
        { label: '45 Days Intensive Security Program', href: '/learning-paths#forty-five-days' },
        { label: 'Live Sandboxed Labs Overview', href: '/#labs' },
      ],
    },
    {
      title: 'Events & Learning Resources',
      icon: Compass,
      links: [
        { label: 'Cybersecurity Workshops & Bootcamps', href: '/workshops' },
        { label: 'Research Articles & Security Blog', href: '/blog' },
        { label: 'Curriculum Roadmap Explorer', href: '/#curriculum-roadmap' },
        { label: 'Student Reviews & Success Stories', href: '/#reviews' },
        { label: 'Frequently Asked Questions (FAQ)', href: '/#faq' },
      ],
    },
    {
      title: 'Student & Verification Portal',
      icon: Award,
      links: [
        { label: 'Verify Certificate (TS-ID Portal)', href: '/verify-certificate' },
        { label: 'Student Dashboard & Portal', href: '/student' },
        { label: 'Assessment Taking Engine', href: '/student/assessment' },
        { label: 'Student Login', href: '/login' },
        { label: 'Contact & Campus Counseling', href: '/contact' },
      ],
    },
    {
      title: 'Legal, Compliance & Policies',
      icon: FileText,
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
        { label: 'Refund & Cancellation Policy', href: '/refund-policy' },
        { label: 'Disclaimer Notice', href: '/disclaimer' },
        { label: 'Cookie Preferences & Settings', href: '/cookie-settings' },
      ],
    },
  ];

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-4">
            <Compass className="w-3.5 h-3.5 text-purple-600" />
            <span>Complete Website Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-3">
            Sitemap
          </h1>
          <p className="text-sm text-slate-500">
            Quickly navigate across all educational programs, research blogs, verification tools, and institutional pages.
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitemapSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-200 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-purple-700 shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-sm tracking-tight">{section.title}</h2>
                </div>
                <ul className="space-y-2.5 text-xs">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        className="text-slate-600 hover:text-purple-700 hover:underline flex items-center gap-1.5 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
