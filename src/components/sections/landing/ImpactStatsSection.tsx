'use client';

import { motion } from 'framer-motion';

interface StatItem {
  value: string;
  label: string;
}

const STATS_DATA: StatItem[] = [
  {
    value: '2000+',
    label: 'Students Empowered',
  },
  {
    value: '80+',
    label: 'Academic & Industry Engagements',
  },
  {
    value: '130+',
    label: 'Practical Learning Industry Sessions',
  },
  {
    value: '50+',
    label: 'Hiring Partners',
  },
];

export function ImpactStatsSection() {
  return (
    <section 
      aria-label="Impact Created and Placement Statistics"
      className="relative py-12 md:py-16 bg-white overflow-hidden"
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center text-center mb-8 sm:mb-12"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-medium tracking-[0.2em] sm:tracking-[0.25em] text-black uppercase font-sans">
            IMPACT CREATED
          </h2>
          {/* Luminous violet-blue accent gradient underline */}
          <div className="h-1 w-16 sm:w-20 mt-2.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 shadow-[0_0_12px_rgba(126,59,237,0.5)]" />
        </motion.div>

        {/* Connected Coupon / Ticket Strip Card with Violet-Black Gradient & Grain Noise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_16px_40px_-12px_rgba(20,5,40,0.35)] border border-violet-950/30"
          style={{
            background: 'linear-gradient(135deg, #090214 0%, #170430 25%, #290850 50%, #15032b 75%, #080112 100%)',
          }}
        >
          {/* Ambient Glow Effects */}
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-violet-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* SVG Fractal Noise Overlay for textured film-grain look */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-full h-full opacity-25 mix-blend-overlay"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="impact-stats-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#impact-stats-noise)" />
          </svg>

          {/* Grid Layout of the 4 stats */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 py-2 sm:py-3">
            {STATS_DATA.map((stat, idx) => {
              const isLast = idx === STATS_DATA.length - 1;
              return (
                <div
                  key={stat.label}
                  className={`group relative flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 px-4 sm:px-6 text-center transition-colors duration-300 hover:bg-white/[0.04] ${
                    !isLast ? 'lg:border-r lg:border-dashed lg:border-white/15' : ''
                  } ${
                    idx % 2 === 0 ? 'sm:border-r sm:border-dashed sm:border-white/15 lg:border-r-0' : ''
                  } ${
                    idx < 2 ? 'border-b sm:border-b lg:border-b-0 border-dashed border-white/15' : ''
                  }`}
                >
                  {/* Semicircular Punch-Hole Notches at Column Dividers (Desktop) */}
                  {!isLast && (
                    <>
                      {/* Top Semicircle Cutout */}
                      <div 
                        aria-hidden="true" 
                        className="hidden lg:block absolute -top-4 -right-4 w-8 h-8 rounded-full bg-white z-20 pointer-events-none shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12)]" 
                      />
                      {/* Bottom Semicircle Cutout */}
                      <div 
                        aria-hidden="true" 
                        className="hidden lg:block absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-white z-20 pointer-events-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]" 
                      />
                    </>
                  )}

                  {/* Value / Main Number */}
                  <div className="relative mb-2 sm:mb-3">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)] font-sans">
                      {stat.value}
                    </span>
                  </div>

                  {/* Label */}
                  <span className="text-xs sm:text-sm font-medium tracking-[0.14em] sm:tracking-[0.18em] text-violet-200/90 uppercase font-sans">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
