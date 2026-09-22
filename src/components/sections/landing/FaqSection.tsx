'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, GraduationCap, Laptop, Briefcase } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    id: 'courses',
    label: 'Courses',
    icon: <GraduationCap className="w-4 h-4" />,
    items: [
      {
        question: "What makes Thread Security's curriculum different from standard training programs?",
        answer: "Unlike theoretical bootcamps, our curriculum is 100% lab-first. You start attacking and defending live systems in sandboxed environments from day one. All modules are mapped directly to standard industry frameworks like OWASP Top 10 and MITRE ATT&CK.",
      },
      {
        question: 'Which specialization track should I choose to get hired quickly?',
        answer: 'Both Cybersecurity and AI roles are in high demand. If you enjoy threat hunting, network monitoring, and system defense, our Blue Team / SOC track is best. For securing cloud infrastructures and CI/CD pipelines, choose DevSecOps.',
      },
      {
        question: 'Do you prepare students for top industry certifications?',
        answer: 'Yes. While our primary focus is operational competence, our specialized tracks thoroughly prepare you for key credentials like CEH, CompTIA Security+, AWS Certified Security, and OSCP through practical hands-on labs.',
      },
      {
        question: 'What kind of credentials will I receive upon graduation?',
        answer: 'You will receive a TS-ID (Thread Security Identifier) verified credential. It is a secure digital record on our directory that lets employers cryptographically verify your lab accomplishments, progress, and capstone scores.',
      },
      {
        question: 'What is the fee structure and do you offer installment options?',
        answer: 'We offer flexible, transparent payment structures including early-bird discounts and monthly installment options. We also provide customized training packages for enterprise security teams. Contact our HQ support team for a full pricing breakdown.',
      },
    ],
  },
  {
    id: 'learning',
    label: 'Learning',
    icon: <Laptop className="w-4 h-4" />,
    items: [
      {
        question: 'Do I need a high-end computer to run the virtual sandboxed labs?',
        answer: 'No. Our sandboxed lab environments run entirely in the cloud. You only need a standard web browser and an internet connection to spawn live targets and execute exploitation exercises.',
      },
      {
        question: 'How is the 1-on-1 mentorship structured?',
        answer: 'You are paired with active security professionals, SOC leads, and cloud security engineers. You get direct code/exploit reviews, weekly doubt-clearing sessions, and career counseling.',
      },
      {
        question: 'What happens if I get stuck on a difficult lab assignment?',
        answer: 'You can get help directly through our active student Discord community, where mentors and peers are available 24/7. We also host live lab walkthroughs and Q&A sessions weekly.',
      },
      {
        question: 'Can I balance the learning schedule with a full-time job or university?',
        answer: 'Yes. Our tracks are designed for busy learners, requiring 10-15 hours per week. All lectures are recorded, and you have 24/7 access to labs so you can progress at your own pace.',
      },
    ],
  },
  {
    id: 'placements',
    label: 'Placements',
    icon: <Briefcase className="w-4 h-4" />,
    items: [
      {
        question: 'How does the placement program connect students to companies?',
        answer: 'We have direct recruitment partnerships with top consulting firms, financial institutions, and technology corporations. Once you pass your capstone and lab validations, you get referred directly to open roles.',
      },
      {
        question: 'What is the mock interview and resume review process?',
        answer: 'We conduct realistic mock interviews (technical and HR rounds) led by active CISOs and hiring managers. We also review and optimize your GitHub portfolio, TS-ID directory page, and CV.',
      },
      {
        question: 'What is the average salary range for your placed graduates?',
        answer: 'Graduates entering SOC analyst, cloud security engineer, or junior pentester roles typically secure competitive entry-to-mid-level packages. Our private alumni network spans 2,000+ placed professionals globally.',
      },
    ],
  },
];

export function FaqSection() {
  const [activeCategory, setActiveCategory] = useState('courses');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const currentCategory = FAQ_DATA.find((cat) => cat.id === activeCategory) || FAQ_DATA[0];

  return (
    <section id="faq" className="py-20 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.25em] uppercase text-violet-600 mb-4 font-mono">
            <span className="w-6 h-px bg-violet-600/30" />
            FAQS
            <span className="w-6 h-px bg-violet-600/30" />
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
            Frequently <span className="text-violet-600">Asked Questions</span>
          </h2>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-2 shadow-sm shrink-0">
            {FAQ_DATA.map((cat) => {
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setExpandedIndex(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-violet-50/70 text-violet-600 border-l-2 border-violet-600 pl-3.5'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={isActive ? 'text-violet-600' : 'text-slate-400'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          <div className="flex-1 w-full space-y-4">
            {currentCategory.items.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200/60 rounded-2xl bg-white overflow-hidden shadow-sm hover:border-slate-300 transition-colors duration-300"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full text-left flex items-center justify-between p-5 font-medium text-slate-800 hover:text-violet-600 transition-colors duration-200"
                  >
                    <span className="pr-4 leading-snug">{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-violet-600' : ''
                      }`}
                    />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
