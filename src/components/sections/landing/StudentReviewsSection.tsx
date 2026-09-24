'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Linkedin, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface ReviewItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  preRole?: string;
  postCompany?: string;
}

const ALL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-text-1',
    name: 'Abhay Pathania',
    role: 'Aspiring TSE Bug Bounty Hunter',
    avatar: '/images/Students/Abhay.svg',
    quote: "Finding my first critical vulnerability in a live bug bounty program was unbelievable. TSE's deep-dive modules on Web Application Security and Burp Suite methodologies gave me the exact hands-on mindset needed to uncover OWASP Top 10 exploits in real targets.",
    preRole: 'B.Tech CSE',
    postCompany: 'Bug Bounty Hunter',
  },
  {
    id: 'rev-text-12',
    name: 'Sukhjit Kaur',
    role: 'TSE AI Enthusiast',
    avatar: '/images/Students/Sukhjit.svg',
    quote: 'The learning environment was supportive and technically rich. I understood complex concepts easily, and the practical tasks helped me learn, experiment, and grow with confidence.',
    preRole: 'IT Student',
    postCompany: 'Security Research',
  },
  {
    id: 'rev-text-11',
    name: 'Piya Kohli',
    role: 'Pioneer TSE AI Engineer',
    avatar: '/images/Students/Piya.svg',
    quote: 'My 45-day training experience at Thread Security was a great learning experience. I learned the basics of Artificial Intelligence and Machine Learning and got practical knowledge through projects. I improved my skills in Python, data preprocessing, and machine learning models.',
    preRole: 'Information Tech',
    postCompany: 'AI & ML Trainee',
  },
  {
    id: 'rev-text-2',
    name: 'Jasjot Kaur',
    role: 'TSE Blue Teaming Aspirant',
    avatar: '/images/Students/Jasjot.svg',
    quote: 'The trainers were highly supportive throughout my learning journey. They explained concepts clearly, communicated well, and always helped resolve my doubts. Their practical approach and encouragement made the experience comfortable, engaging, and motivating.',
    preRole: 'Tech Graduate',
    postCompany: 'Thoughtworks',
  },
  {
    id: 'rev-text-3',
    name: 'Jatin',
    role: 'TSE Pentesting Aspirant',
    avatar: '/images/Students/Jatin.svg',
    quote: 'The learning environment was supportive and technically rich. I understood complex concepts easily, and the practical tasks helped me learn, experiment, and grow with confidence.',
    preRole: 'IT Student',
    postCompany: 'Security Research',
  },
  {
    id: 'rev-text-9',
    name: 'Shashikant',
    role: 'Ambitious Bug Bounty Hunter',
    avatar: '/images/Students/Shashi.svg',
    quote: 'I had zero professional cybersecurity experience before joining TSE. The curriculum starts with rock-solid fundamentals and escalates into advanced exploit analysis. The practical capstone projects made all the difference in my career.',
    preRole: 'Non-IT Background',
    postCompany: 'Bug Bounty Program',
  },
  {
    id: 'rev-text-4',
    name: 'Kashish Sharma',
    role: 'TSE Offensive Security Aspirant',
    avatar: '/images/Students/Kashish.svg',
    quote: 'They provided continuous guidance during practical tasks and helped me understand cybersecurity concepts by applying them in real scenarios. Their feedback helped me identify areas for improvement, strengthen my technical skills.',
    postCompany: 'Red Teaming',
  },
  {
    id: 'rev-text-13',
    name: 'Gurmandeep',
    role: 'TSE AI Enthusiast',
    avatar: '/images/Students/Gurmandeep.svg',
    quote: 'The learning environment was supportive and technically rich. I understood complex concepts easily, and the practical tasks helped me learn, experiment, and grow with confidence.',
    preRole: 'IT Student',
    postCompany: 'Security Research',
  },
  {
    id: 'rev-text-5',
    name: 'Mehak',
    role: 'TSE Application Security Aspirant',
    avatar: '/images/Students/Mehak.svg',
    quote: "TSE's community and mentor guidance are incredible. Whenever I was stuck in advanced labs or understanding complex server-side request forgery (SSRF) vectors, the instructors provided 1-on-1 guidance until the concept was completely clear.",
    preRole: 'BCA Graduate',
    postCompany: 'AppSec Team',
  },
  {
    id: 'rev-text-15',
    name: 'Nishika Sehgal',
    role: 'TSE AI Engineer Aspirant',
    avatar: '/images/Students/Nishika.svg',
    quote: 'The AI & ML curriculum at Thread Security gave me deep clarity on modern artificial intelligence pipelines, neural networks, and generative modeling. The mentorship and real-time guidance were instrumental in accelerating my technical capabilities.',
    preRole: 'BCA Graduate',
    postCompany: 'AI Engineer Trainee',
  },
  {
    id: 'rev-text-6',
    name: 'Mohit',
    role: 'TSE Offensive Security Aspirant',
    avatar: '/images/Students/Mohit.svg',
    quote: 'The real-world scenario simulations at TSE pushed my technical boundaries. Practicing evasion techniques, exploit payloads, and network pivoting inside isolated virtual labs prepared me for high-stakes corporate security roles.',
    preRole: 'Engineering Grad',
    postCompany: 'Offensive Security',
  },
  {
    id: 'rev-text-7',
    name: 'Piyush Kumar',
    role: 'TSE Cyber Security Aspirant',
    avatar: '/images/Students/Piyush.svg',
    quote: 'TSE transformed the way I understand network infrastructure and defense. Learning Linux system hardening, firewall configuration, and automated security scripts gave me practical skills that college textbooks never covered.',
    preRole: 'B.Tech Student',
    postCompany: 'Security Operations',
  },
  {
    id: 'rev-text-8',
    name: 'Priyanka Kumari',
    role: 'Offensive Security Analyst & Ethical Hacker',
    avatar: '/images/Students/Priyanka.svg',
    quote: 'The step-by-step guidance from industry veterans at TSE gave me immense clarity. I gained comprehensive hands-on skills in vulnerability chaining, privilege escalation, and writing professional penetration testing reports.',
    preRole: 'Computer Science',
    postCompany: 'Cyber Defense',
  },
  {
    id: 'rev-text-10',
    name: 'Tiksha Dhamija',
    role: 'Ambitious Ethical Hacker',
    avatar: '/images/Students/Tiksha.svg',
    quote: "TSE's focus on practical threat intelligence, MITRE ATT&CK framework mapping, and defensive countermeasures gave me the exact edge needed. The mentors truly care about every student's learning trajectory and career readiness.",
    preRole: 'Information Tech',
    postCompany: 'Threat Intelligence',
  },
  {
    id: 'rev-text-14',
    name: 'Harpreet Kaur',
    role: 'TSE AI Data-Science Aspirant',
    avatar: '/images/Students/Harpreet.svg',
    quote: 'The curriculum helped me clearly connect theory with real AI–Data Science applications, and the practical challenges really strengthened my understanding. It was a great learning experience overall, and a big shoutout to the PD team—especially Kunal sir—for making everything easier to grasp.',
    preRole: 'Information Tech',
    postCompany: 'AI Data Science',
  },
];

function TextReviewCard({ review }: { review: ReviewItem }) {
  return (
    <div className="bg-white border border-[#dbebff] rounded-[2rem] p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group w-[330px] sm:w-[380px] h-[410px] shrink-0 whitespace-normal">
      {/* LinkedIn Bubble Icon */}
      <a 
        href="https://linkedin.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="absolute top-5 right-5 w-7 h-7 bg-[#0066c2] rounded-full flex items-center justify-center text-white hover:bg-[#0055a5] hover:scale-105 active:scale-95 transition-all z-20 shadow-sm"
        aria-label={`View ${review.name}'s LinkedIn Profile`}
      >
        <Linkedin className="w-3.5 h-3.5 fill-current" />
      </a>

      {/* Profile Header Block with parenthesis/brackets & stars decoration */}
      <div className="flex flex-col items-center text-center mt-0.5 shrink-0">
        <div className="relative w-36 sm:w-40 h-22 sm:h-24 flex items-center justify-center">
          {/* SVG Brackets & Stars Decoration */}
          <svg className="absolute inset-0 w-full h-full text-[#0066c2]/35 pointer-events-none" viewBox="0 0 160 104" fill="none">
            {/* Left arcs */}
            <path d="M 38,23 A 31,31 0 0,0 38,81" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3" />
            <path d="M 32,17 A 38,38 0 0,0 32,87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            {/* Left Star */}
            <path d="M 25,12 L 26.5,15.5 L 30,16 L 27.5,18.5 L 28,22 L 25,20 L 22,22 L 22.5,18.5 L 20,16 L 23.5,15.5 Z" fill="#f97316" />
            {/* Right arcs */}
            <path d="M 122,23 A 31,31 0 0,1 122,81" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3" />
            <path d="M 128,17 A 38,38 0 0,1 128,87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            {/* Right Star */}
            <path d="M 135,92 L 136.5,88.5 L 140,88 L 137.5,85.5 L 138,82 L 135,84 L 132,82 L 132.5,85.5 L 130,88 L 133.5,88.5 Z" fill="#f97316" />
          </svg>

          {/* Avatar Image */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-slate-200 z-10 shadow-md bg-white">
            <Image 
              src={review.avatar} 
              alt={review.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <h4 className="text-[15px] sm:text-base font-bold text-slate-900 mt-1 leading-snug">{review.name}</h4>
        <p className="text-xs text-slate-500 font-medium italic mt-0.5 leading-tight line-clamp-1">{review.role}</p>
      </div>

      {/* Quote Content Block - Balanced & Vertically Centered */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto px-1 relative">
        <Quote className="w-4 h-4 text-[#0066c2]/40 mb-1.5 rotate-180 shrink-0" />
        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed text-center italic line-clamp-5 select-text">
          &ldquo;{review.quote}&rdquo;
        </p>
      </div>

      {/* Grounded Card Footer */}
      <div className="pt-2.5 border-t border-slate-100 w-full flex items-center justify-between text-[11px] shrink-0 mt-1">
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 truncate max-w-[190px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">{review.postCompany || 'Cybersecurity Alumni'}</span>
        </span>
        <span className="text-[10px] font-semibold text-[#0066c2] bg-blue-50/90 px-2 py-0.5 rounded-full border border-blue-100/80 shrink-0">
          Verified Review
        </span>
      </div>
    </div>
  );
}

export function StudentReviewsSection() {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.clientWidth > 640 ? 380 + 24 : 330 + 24;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    checkScrollState();
    const handleResize = () => checkScrollState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollState]);

  return (
    <section id="reviews" className="py-20 bg-slate-50/50 border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        
        {/* Section Title Header Centered */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300 text-xs font-medium tracking-[0.25em] uppercase mb-4 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <span>— REVIEWS —</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
            <span className="text-violet-600 font-bold">Stories</span> From People Like You
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
            Real journeys from learners and career-switchers who mastered hands-on offensive & defensive security at TSE.
          </p>
        </div>
      </div>

      {/* Slider Track with Floating Left & Right Navigation Buttons */}
      <div className="relative w-full group/slider">
        {/* Floating Left Button */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-xl border border-slate-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Floating Right Button */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-xl border border-slate-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Side gradient edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10" />

        {/* Scrollable Track */}
        <div 
          ref={scrollContainerRef}
          onScroll={checkScrollState}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 sm:px-14 lg:px-20 py-4 select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ALL_REVIEWS.map((review, idx) => (
            <div key={`${review.id}-${idx}`} className="snap-start shrink-0">
              <TextReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Centered Prev & Next Navigation Buttons */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Previous review"
          className="w-11 h-11 rounded-full border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Next review"
          className="w-11 h-11 rounded-full border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </section>
  );
}
