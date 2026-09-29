import { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, Headphones } from 'lucide-react';
import { ContactFormClient } from '@/components/contact/ContactFormClient';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const APP_URL =
  process.env.GCP_SEARCH_CONSOLE_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  'https://threadsecurity.in';

export const metadata: Metadata = {
  title: 'Cyber Security Training Institute in Jalandhar, Punjab | Contact & Admissions',
  description:
    'Visit Thread Security Education campus at Vasal Mall, Jalandhar, Punjab. Enroll in offline & online cyber security courses, ethical hacking training, 45-day summer internships, and 6-month industrial programs. Speak to our expert career counselors today.',
  keywords: [
    'cyber security course in Jalandhar',
    'cybersecurity training in Jalandhar',
    'cyber security institute in Jalandhar',
    'cyber security academy in Jalandhar',
    'cyber security classes in Jalandhar',
    'cyber security coaching in Jalandhar',
    'cyber security training institute Jalandhar',
    'cyber security course near me',
    'cyber security training near me',
    'cyber security training center Jalandhar',
    'cyber security course Punjab',
    'cyber security training Punjab',
    'ethical hacking course Jalandhar',
    'VAPT training Jalandhar',
    'SOC analyst course Jalandhar',
    'cyber security course in Amritsar',
    'cyber security course in Ludhiana',
    'cyber security course in Mohali',
    'cyber security course in Chandigarh',
    'Thread Security Education',
  ],
  alternates: {
    canonical: `${APP_URL}/contact`,
  },
  openGraph: {
    title: 'Cyber Security Training Institute in Jalandhar, Punjab | Thread Security Education',
    description:
      'Visit our physical campus at Vasal Mall, Jalandhar, Punjab. Book a free 1-on-1 counseling session for Cyber Security & AI programs.',
    url: `${APP_URL}/contact`,
    type: 'website',
    images: [
      {
        url: `${APP_URL}/images/og-thread-security-education.png`,
        width: 1200,
        height: 630,
        alt: 'Contact Thread Security Education Campus — Jalandhar, Punjab',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyber Security Training Institute in Jalandhar, Punjab | Thread Security Education',
    description:
      'Visit our physical campus at Vasal Mall, Jalandhar, Punjab or join interactive online live batches.',
    images: [`${APP_URL}/images/og-thread-security-education.png`],
  },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Contact Admissions', url: '/contact' },
        ]}
      />
      <div className="min-h-screen bg-white text-black py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/15 text-black font-mono text-xs font-bold tracking-wide mb-4">
              <Headphones className="w-4 h-4 text-[#7E3BED]" aria-hidden="true" />
              <span>ADMISSIONS & CAREER COUNSELING</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black text-center mb-4">
              Connect With Our Career Experts
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              Have questions about our Cybersecurity & AI Training programs? Book a 1-on-1 demo session or speak with our counseling team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Contact Details & Info */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                <h2 className="text-2xl font-extrabold text-black">Get in Touch</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Whether you're looking to start a career in cybersecurity or upskill your security operations, our advisors are here to help you.
                </p>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0" aria-hidden="true">
                      <Phone className="w-5 h-5 text-security-green" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-gray-500 block uppercase font-bold">Call / WhatsApp Support</span>
                      <a href="tel:+917347398956" className="text-base font-bold text-black hover:text-[#7E3BED] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7E3BED] rounded font-mono">
                        +91 7347398956
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0" aria-hidden="true">
                      <Mail className="w-5 h-5 text-security-green" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-gray-500 block uppercase font-bold">Official Admissions Email</span>
                      <a href="mailto:edu@threadsecurity.in" className="text-base font-bold text-black hover:text-[#7E3BED] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7E3BED] rounded font-mono">
                        edu@threadsecurity.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0" aria-hidden="true">
                      <MapPin className="w-5 h-5 text-security-green" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-gray-500 block uppercase font-bold">Education Campus Location</span>
                      <span className="text-sm font-semibold text-black block leading-snug">
                        3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black text-white space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-security-green font-mono">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>Counseling Hours</span>
                  </div>
                  <p className="text-gray-300">Monday — Saturday: 9:00 AM to 7:00 PM IST</p>
                </div>
              </div>
            </div>

            {/* Right Column: Free Demo & Contact Form */}
            <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-xl">
              <h2 className="text-2xl font-extrabold text-black mb-2">Book Your Free Demo Class</h2>
              <p className="text-sm text-gray-600 mb-8 font-medium">
                Fill out your details below and our senior career advisor will reach out within 2 hours.
              </p>

              <ContactFormClient />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
