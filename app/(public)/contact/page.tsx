import { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, Headphones } from 'lucide-react';
import { ContactFormClient } from '@/components/contact/ContactFormClient';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Contact Admissions & Counseling — Thread Security Education (TSE)',
  description: 'Connect with Thread Security Education admissions & career counseling team. Book a free 1-on-1 demo session for Cybersecurity & AI engineering masterclasses.',
  alternates: {
    canonical: 'https://threads-edu.com/contact',
  },
  openGraph: {
    title: 'Contact Admissions & Counseling | Thread Security Education',
    description: 'Book a free demo session and consult with senior faculty on Cybersecurity and AI engineering career pathways.',
    url: 'https://threads-edu.com/contact',
  },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://threads-edu.com' },
          { name: 'Contact Admissions', url: 'https://threads-edu.com/contact' },
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
                      <a href="tel:+919876543210" className="text-base font-bold text-black hover:text-[#7E3BED] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7E3BED] rounded">
                        +91 98765 43210
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0" aria-hidden="true">
                      <Mail className="w-5 h-5 text-security-green" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-gray-500 block uppercase font-bold">Official Admissions Email</span>
                      <a href="mailto:admissions@threads-edu.com" className="text-base font-bold text-black hover:text-[#7E3BED] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7E3BED] rounded">
                        admissions@threads-edu.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0" aria-hidden="true">
                      <MapPin className="w-5 h-5 text-security-green" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-gray-500 block uppercase font-bold">Academy Campus Location</span>
                      <span className="text-sm font-bold text-black block">
                        North Region Tech Hub, Punjab, India
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
