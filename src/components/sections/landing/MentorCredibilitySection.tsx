'use client';

import Image from 'next/image';

const LOGO_DATA = [
  { file: '1.svg', name: 'Govt College Nagrota Bagwan' },
  { file: '2.svg', name: 'GNA University' },
  { file: '3.svg', name: 'CT Group of Institutions' },
  { file: '4.svg', name: 'DAVIET Jalandhar' },
  { file: '5.svg', name: 'Govt College Dharamshala' },
  { file: '6.svg', name: 'Apeejay Institute Jalandhar' },
  { file: '7.svg', name: 'SBBS University' },
  { file: '8.svg', name: 'Innocent Hearts Group' },
  { file: 'Gautam Group of colleges.svg', name: 'Gautam Group of Colleges' },
  { file: 'GL Bajaj.svg', name: 'GL Bajaj Institute of Technology' },
  { file: 'Govt College Jwala Ji.svg', name: 'Govt College Jwalamukhi' },
  { file: 'Hp University.svg', name: 'Himachal Pradesh University' },
  { file: 'Lala Jagat Nairan.svg', name: 'Lala Jagat Narain College' },
  { file: 'LAUREATE INSTITUTE OF MANAGEMENT AND INFORMATION TECHNOLOGY.svg', name: 'Laureate Institute of Mgmt & IT' },
  { file: 'Pt Sant Ram College.svg', name: 'Pt. Sant Ram College' },
  { file: 'Rajiv Gandhi.svg', name: 'Rajiv Gandhi Govt Engg College' },
  { file: 'SVSDPG.svg', name: 'SVSD PG College' },
  { file: 'University of Information Technology.svg', name: 'UIIT Himachal Pradesh' }
];

interface MentorData {
  id: string;
  title: string;
  company: string;
  bio: string;
  expertise: string;
  user: {
    name: string;
  };
}

interface MentorCredibilitySectionProps {
  mentors: MentorData[];
}

export function MentorCredibilitySection({ mentors }: MentorCredibilitySectionProps) {
  // Triple the logo list to guarantee a smooth continuous loop
  const tripledLogos = [...LOGO_DATA, ...LOGO_DATA, ...LOGO_DATA];

  return (
    <section className="relative py-12 bg-white border-t border-slate-100 overflow-hidden">
      {/* Context title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
          Trusted by Students from Prominent Institutions
        </p>
      </div>

      {/* Full-bleed Marquee Container */}
      <div className="relative w-full overflow-hidden">
        {/* Fade gradients on side edges for seamless visual blending */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-48 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-48 z-10 bg-gradient-to-l from-white to-transparent" />

        {/* Marquee Track */}
        <div
          className="flex gap-6 sm:gap-8 items-center w-max hover:[animation-play-state:paused] py-3 px-4"
          style={{
            animation: 'marquee-scroll 38s linear infinite',
          }}
        >
          {tripledLogos.map((logo, idx) => (
            <div
              key={`${logo.file}-${idx}`}
              className="group flex flex-col items-center justify-center shrink-0 w-[240px] sm:w-[260px] bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg cursor-pointer"
            >
              <div className="relative w-full h-[70px] sm:h-[80px] mb-2.5 transition-all duration-300">
                <Image
                  src={`/University Logos/${logo.file}`}
                  alt={logo.name}
                  fill
                  sizes="(max-width: 640px) 240px, 260px"
                  className="object-contain opacity-75 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 group-hover:text-slate-900 text-center tracking-tight leading-snug line-clamp-1 w-full transition-colors duration-300">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Styled JSX for the smooth marquee keyframe animation */}
      <style jsx>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.3333%);
          }
        }
      `}</style>
    </section>
  );
}
