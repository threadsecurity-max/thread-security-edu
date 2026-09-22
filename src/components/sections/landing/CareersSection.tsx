'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Shield, 
  Flame, 
  Smartphone, 
  FileCheck, 
  ShieldAlert, 
  Code, 
  Target, 
  Briefcase, 
  Layers, 
  Brain, 
  Cpu, 
  Workflow, 
  Sparkles, 
  Database, 
  BarChart3, 
  Network, 
  Activity, 
  GitBranch, 
  Search, 
  Terminal, 
  Server, 
  Cloud, 
  ChevronRight
} from 'lucide-react';

interface CareerCard {
  title: string;
  category: 'Cyber Security' | 'AI & Data' | 'Architecture';
  image: string;
  icon: React.ReactNode;
  color: string;
}

const CAREERS: CareerCard[] = [
  // Security Roles
  {
    title: 'SOC Analyst',
    category: 'Cyber Security',
    image: '/images/soc-analyst.jpg',
    icon: <Shield className="w-4 h-4" />,
    color: '#C6FF34'
  },
  {
    title: 'Incident Responder',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Flame className="w-4 h-4" />,
    color: '#FF5A5A'
  },
  {
    title: 'Mobile Security Analyst',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Smartphone className="w-4 h-4" />,
    color: '#00F0FF'
  },
  {
    title: 'Security Compliance',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <FileCheck className="w-4 h-4" />,
    color: '#00FF88'
  },
  {
    title: 'Security Engineer',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <ShieldAlert className="w-4 h-4" />,
    color: '#C6FF34'
  },
  {
    title: 'Application Security Engineer',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Code className="w-4 h-4" />,
    color: '#9D62FF'
  },
  {
    title: 'Penetration Tester',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Target className="w-4 h-4" />,
    color: '#FF2E63'
  },
  {
    title: 'Security Consultant',
    category: 'Cyber Security',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Briefcase className="w-4 h-4" />,
    color: '#FFB800'
  },
  // Architecture
  {
    title: 'Solution Architect',
    category: 'Architecture',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Layers className="w-4 h-4" />,
    color: '#00D2FF'
  },
  // AI / ML / Data
  {
    title: 'AI Engineer',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Brain className="w-4 h-4" />,
    color: '#A855F7'
  },
  {
    title: 'AI OOPs Engineer',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Cpu className="w-4 h-4" />,
    color: '#FF6B00'
  },
  {
    title: 'ML Engineer',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Workflow className="w-4 h-4" />,
    color: '#C084FC'
  },
  {
    title: 'Gen AI Engineer',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Sparkles className="w-4 h-4" />,
    color: '#2DD4BF'
  },
  {
    title: 'Data Scientist',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Database className="w-4 h-4" />,
    color: '#60A5FA'
  },
  {
    title: 'Data Analyst',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <BarChart3 className="w-4 h-4" />,
    color: '#34D399'
  },
  {
    title: 'Deep Learning Engineer',
    category: 'AI & Data',
    image: '/images/deep-learning-engineer.jpg',
    icon: <Network className="w-4 h-4" />,
    color: '#A78BFA'
  },
  {
    title: 'Agentic AI Engineer',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Activity className="w-4 h-4" />,
    color: '#F472B6'
  },
  {
    title: 'Data Engineer',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <GitBranch className="w-4 h-4" />,
    color: '#22D3EE'
  },
  {
    title: 'RAG Engineer',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Search className="w-4 h-4" />,
    color: '#FBBF24'
  },
  {
    title: 'Prompt Engineer',
    category: 'AI & Data',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=600&h=800',
    icon: <Terminal className="w-4 h-4" />,
    color: '#FB7185'
  }
];

export function CareersSection() {
  const [isPaused, setIsPaused] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Smooth, organic parallax scroll animation for background dome & celestial layers
  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate relative vertical offset from the center of viewport
      const offset = (rect.top - windowHeight * 0.4) * -0.12;
      setParallaxOffset(offset);
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrollToCounselling = () => {
    const element = document.getElementById('counselling-section') || document.querySelector('section[id="features"]')?.nextElementSibling;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="careers-forged" 
      className="relative bg-gradient-to-b from-[#0d0d12] via-[#0d0a1a] to-[#070312] text-white pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden"
    >
      {/* ── 3D SPHERICAL DOME PARALLAX BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Background dome structure without glow */}
        
        {/* Layer 1: Subtle Outer Orbit Ring */}
        <div 
          className="absolute top-[16%] left-1/2 w-[1100px] h-[1100px] rounded-full border border-white/[0.04] opacity-70 transition-transform duration-500 ease-out will-change-transform" 
          style={{
            transform: `translate3d(-50%, ${parallaxOffset * 0.22}px, 0)`
          }}
        />

        {/* Layer 2: Mid Hemisphere Ring */}
        <div 
          className="absolute top-[32%] left-1/2 w-[850px] h-[850px] rounded-full border border-white/[0.06] bg-gradient-to-b from-white/[0.015] to-transparent transition-transform duration-500 ease-out will-change-transform" 
          style={{
            transform: `translate3d(-50%, ${parallaxOffset * 0.14}px, 0)`
          }}
        />

        {/* Layer 3: Lower Curved Horizon Stage */}
        <div 
          className="absolute top-[60%] left-1/2 w-[720px] sm:w-[900px] h-[900px] rounded-full bg-gradient-to-b from-[#181824] via-[#130e24] to-[#070312] shadow-[0_-25px_60px_rgba(0,0,0,0.9)] transition-transform duration-500 ease-out will-change-transform" 
          style={{
            transform: `translate3d(-50%, ${parallaxOffset * 0.08}px, 0)`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        
        {/* ── SECTION TOP HEADLINE ── */}
        <div className="text-center max-w-3xl mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl md:text-7xl font-bold uppercase text-white tracking-tight leading-[1.15]">
            Seamless pathways to plug <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              talent into the industry
            </span>
          </h2>
        </div>

        {/* ── SYNCHRONIZED SYMMETRICAL ARC MARQUEE WITH LARGE CENTRAL TSE LOGO ── */}
        <div className="relative w-full max-w-4xl h-[220px] sm:h-[280px] mb-6 flex items-center justify-center">
          
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 320" fill="none">
            <defs>
              {/* Symmetrical Left to Center Arc Path */}
              <path id="left-arc-sync" d="M 60 280 A 440 220 0 0 1 500 60" />
              {/* Symmetrical Right to Center Arc Path (Mirrored) */}
              <path id="right-arc-sync" d="M 940 280 A 440 220 0 0 0 500 60" />

              <linearGradient id="arc-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="25%" stopColor="#C6FF34" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#C6FF34" stopOpacity="1" />
                <stop offset="75%" stopColor="#7E3BED" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Static Ambient Semi-Circular Arc Line */}
            <path 
              d="M 60 280 A 440 220 0 0 1 940 280" 
              stroke="url(#arc-line-grad)" 
              strokeWidth="2.5" 
              strokeDasharray="5 5" 
            />

            {/* ════════════════════════════════════════════════════════════════════════
                SYNCHRONIZED ADJACENT PAIR 1 (Begin = 0s)
               ════════════════════════════════════════════════════════════════════════ */}
            {/* Left Pair 1: Python */}
            <g>
              <animateMotion dur="12s" repeatCount="indefinite" begin="0s">
                <mpath href="#left-arc-sync" />
              </animateMotion>
              <animate attributeName="opacity" values="0; 1; 1; 0.4; 0" keyTimes="0; 0.12; 0.85; 0.95; 1" dur="12s" repeatCount="indefinite" begin="0s" />
              <animateTransform attributeName="transform" type="scale" values="0.7; 1.2; 1.05; 0.7; 0.2" keyTimes="0; 0.15; 0.85; 0.95; 1" additive="sum" dur="12s" repeatCount="indefinite" begin="0s" />
              <circle r="22" fill="#0f241a" stroke="#10b981" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(16,185,129,0.5))" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-emerald-400">
                  <Code className="w-5 h-5" />
                </div>
              </foreignObject>
            </g>

            {/* Right Pair 1 (Adjacent & Synced): PyTorch */}
            <g>
              <animateMotion dur="12s" repeatCount="indefinite" begin="0s">
                <mpath href="#right-arc-sync" />
              </animateMotion>
              <animate attributeName="opacity" values="0; 1; 1; 0.4; 0" keyTimes="0; 0.12; 0.85; 0.95; 1" dur="12s" repeatCount="indefinite" begin="0s" />
              <animateTransform attributeName="transform" type="scale" values="0.7; 1.2; 1.05; 0.7; 0.2" keyTimes="0; 0.15; 0.85; 0.95; 1" additive="sum" dur="12s" repeatCount="indefinite" begin="0s" />
              <circle r="22" fill="#28170d" stroke="#fb923c" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(251,146,60,0.5))" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-orange-400">
                  <Cpu className="w-5 h-5" />
                </div>
              </foreignObject>
            </g>

            {/* ════════════════════════════════════════════════════════════════════════
                SYNCHRONIZED ADJACENT PAIR 2 (Begin = 3s)
               ════════════════════════════════════════════════════════════════════════ */}
            {/* Left Pair 2: Docker */}
            <g>
              <animateMotion dur="12s" repeatCount="indefinite" begin="3s">
                <mpath href="#left-arc-sync" />
              </animateMotion>
              <animate attributeName="opacity" values="0; 1; 1; 0.4; 0" keyTimes="0; 0.12; 0.85; 0.95; 1" dur="12s" repeatCount="indefinite" begin="3s" />
              <animateTransform attributeName="transform" type="scale" values="0.7; 1.2; 1.05; 0.7; 0.2" keyTimes="0; 0.15; 0.85; 0.95; 1" additive="sum" dur="12s" repeatCount="indefinite" begin="3s" />
              <circle r="22" fill="#15240e" stroke="#C6FF34" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(198,255,52,0.5))" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-[#C6FF34]">
                  <Layers className="w-5 h-5" />
                </div>
              </foreignObject>
            </g>

            {/* Right Pair 2 (Adjacent & Synced): OpenAI */}
            <g>
              <animateMotion dur="12s" repeatCount="indefinite" begin="3s">
                <mpath href="#right-arc-sync" />
              </animateMotion>
              <animate attributeName="opacity" values="0; 1; 1; 0.4; 0" keyTimes="0; 0.12; 0.85; 0.95; 1" dur="12s" repeatCount="indefinite" begin="3s" />
              <animateTransform attributeName="transform" type="scale" values="0.7; 1.2; 1.05; 0.7; 0.2" keyTimes="0; 0.15; 0.85; 0.95; 1" additive="sum" dur="12s" repeatCount="indefinite" begin="3s" />
              <circle r="22" fill="#20112d" stroke="#a855f7" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(168,85,247,0.5))" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-violet-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </foreignObject>
            </g>

            {/* ════════════════════════════════════════════════════════════════════════
                SYNCHRONIZED ADJACENT PAIR 3 (Begin = 6s)
               ════════════════════════════════════════════════════════════════════════ */}
            {/* Left Pair 3: AWS Cloud */}
            <g>
              <animateMotion dur="12s" repeatCount="indefinite" begin="6s">
                <mpath href="#left-arc-sync" />
              </animateMotion>
              <animate attributeName="opacity" values="0; 1; 1; 0.4; 0" keyTimes="0; 0.12; 0.85; 0.95; 1" dur="12s" repeatCount="indefinite" begin="6s" />
              <animateTransform attributeName="transform" type="scale" values="0.7; 1.2; 1.05; 0.7; 0.2" keyTimes="0; 0.15; 0.85; 0.95; 1" additive="sum" dur="12s" repeatCount="indefinite" begin="6s" />
              <circle r="22" fill="#0e2230" stroke="#38bdf8" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(56,189,248,0.5))" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-sky-400">
                  <Cloud className="w-5 h-5" />
                </div>
              </foreignObject>
            </g>

            {/* Right Pair 3 (Adjacent & Synced): VectorDB */}
            <g>
              <animateMotion dur="12s" repeatCount="indefinite" begin="6s">
                <mpath href="#right-arc-sync" />
              </animateMotion>
              <animate attributeName="opacity" values="0; 1; 1; 0.4; 0" keyTimes="0; 0.12; 0.85; 0.95; 1" dur="12s" repeatCount="indefinite" begin="6s" />
              <animateTransform attributeName="transform" type="scale" values="0.7; 1.2; 1.05; 0.7; 0.2" keyTimes="0; 0.15; 0.85; 0.95; 1" additive="sum" dur="12s" repeatCount="indefinite" begin="6s" />
              <circle r="22" fill="#0e1f30" stroke="#60a5fa" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(96,165,250,0.5))" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-blue-400">
                  <Database className="w-4 h-4" />
                </div>
              </foreignObject>
            </g>

            {/* ════════════════════════════════════════════════════════════════════════
                SYNCHRONIZED ADJACENT PAIR 4 (Begin = 9s)
               ════════════════════════════════════════════════════════════════════════ */}
            {/* Left Pair 4: Kubernetes */}
            <g>
              <animateMotion dur="12s" repeatCount="indefinite" begin="9s">
                <mpath href="#left-arc-sync" />
              </animateMotion>
              <animate attributeName="opacity" values="0; 1; 1; 0.4; 0" keyTimes="0; 0.12; 0.85; 0.95; 1" dur="12s" repeatCount="indefinite" begin="9s" />
              <animateTransform attributeName="transform" type="scale" values="0.7; 1.2; 1.05; 0.7; 0.2" keyTimes="0; 0.15; 0.85; 0.95; 1" additive="sum" dur="12s" repeatCount="indefinite" begin="9s" />
              <circle r="22" fill="#151330" stroke="#818cf8" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(129,140,248,0.5))" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-indigo-400">
                  <Server className="w-5 h-5" />
                </div>
              </foreignObject>
            </g>

            {/* Right Pair 4 (Adjacent & Synced): Linux Terminal */}
            <g>
              <animateMotion dur="12s" repeatCount="indefinite" begin="9s">
                <mpath href="#right-arc-sync" />
              </animateMotion>
              <animate attributeName="opacity" values="0; 1; 1; 0.4; 0" keyTimes="0; 0.12; 0.85; 0.95; 1" dur="12s" repeatCount="indefinite" begin="9s" />
              <animateTransform attributeName="transform" type="scale" values="0.7; 1.2; 1.05; 0.7; 0.2" keyTimes="0; 0.15; 0.85; 0.95; 1" additive="sum" dur="12s" repeatCount="indefinite" begin="9s" />
              <circle r="22" fill="#26220d" stroke="#f59e0b" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(245,158,11,0.5))" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-amber-400">
                  <Terminal className="w-4 h-4" />
                </div>
              </foreignObject>
            </g>

            {/* ── APEX CENTER: PROMINENT, LARGE & UNCONSTRAINED TSE HEROFILL LOGO ── */}
            <g transform="translate(500, 65)" className="cursor-pointer">
              {/* Grand Standalone TSE Logo with high-intensity glowing aura */}
              <foreignObject x="-220" y="-110" width="440" height="220">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image 
                    src="/logos/herofill.svg" 
                    alt="TSE Logo" 
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-300"
                    priority
                  />
                </div>
              </foreignObject>
            </g>
          </svg>

        </div>

        {/* ── CENTER VISION & AIM CONTENT (Nested comfortably below Arc) ── */}
        <div className="text-center max-w-xl px-4 space-y-4 mb-20 relative z-20">
          
          {/* AIM Statement */}
          <h3 className="text-lg sm:text-4xl font-bold text-white tracking-tight leading-snug">
            Our Vision is to build <span className="text-[#C6FF34]">future archivers</span> ready of industry.
          </h3>

          {/* Tagline */}
          <p className="text-xs sm:text-xl text-slate-300 font-normal leading-relaxed max-w-md mx-auto">
            Transforming raw ambition into operational excellence — master live Cyber defense operations and production AI systems with 100% practical execution.
          </p>

          {/* Minimalist Action Pill Button */}
          <div className="pt-2">
            <button 
              onClick={scrollToCounselling}
              className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/[0.08] text-white hover:text-[#C6FF34] font-medium text-xs sm:text-sm px-6 py-2.5 rounded-full border border-white/25 hover:border-[#C6FF34]/60 transition-all duration-300"
            >
              <span>Explore all career paths</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ── LOWER 3D SPHERE STAGE: FULL-WIDTH MARQUEE ── */}
      <div className="w-full relative pt-4 z-20 overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight">
            One platform, <span className="text-slate-300 font-light">endless career paths</span>
          </h3>
        </div>

        {/* 100% Full-Width Horizontal Splash Image Marquee */}
        <div 
          className="relative w-full flex overflow-hidden py-4 group/marquee"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex gap-5 sm:gap-6 animate-marquee whitespace-nowrap"
            style={{ 
              animationPlayState: isPaused ? 'paused' : 'running',
              animationDuration: '55s' 
            }}
          >
            {/* Render 20 splash image cards */}
            {CAREERS.map((career, idx) => (
              <CareerNode key={`c-${career.title}-${idx}`} career={career} />
            ))}
            {/* Duplicate for infinite marquee loop */}
            {CAREERS.map((career, idx) => (
              <CareerNode key={`c-dup-${career.title}-${idx}`} career={career} />
            ))}
          </div>
        </div>

        {/* Bottom Slider Progress Indicator (Reference Match) */}
        <div className="max-w-[160px] mx-auto flex items-center justify-center px-4 mt-8">
          <div className="relative w-full h-[2.5px] bg-white/20 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-white rounded-full animate-progress-slider shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ 
                width: '35%',
                animationPlayState: isPaused ? 'paused' : 'running'
              }}
            />
          </div>
        </div>

      </div>

      {/* ── SEAMLESS BOTTOM TRANSITION BLEED INTO CERTIFICATES SECTION ── */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-b from-transparent via-[#070312]/70 to-[#070312] pointer-events-none z-10" />

      {/* Styled JSX for hardware-accelerated animations */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(calc(-50% - 10px), 0, 0); }
        }
        @keyframes progress-slider {
          0% { left: 0%; }
          50% { left: 65%; }
          100% { left: 0%; }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-progress-slider {
          animation: progress-slider 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

// Sub-component for individual Splash Image Portrait Career Cards (matching reference image)
function CareerNode({ career }: { career: CareerCard }) {
  return (
    <div className="relative w-[190px] h-[270px] sm:w-[225px] sm:h-[305px] rounded-2xl overflow-hidden border border-white/[0.1] bg-[#13131c] shrink-0 shadow-2xl transition-all duration-500 hover:border-white/30 hover:scale-[1.02] group">
      
      {/* Background Portrait Splash Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={career.image}
          alt={career.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-108 filter brightness-[0.75] contrast-[1.05]"
          sizes="(max-w-768px) 180px, 210px"
          loading="lazy"
        />
        {/* Multi-layered dark gradient overlay matching reference */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
      </div>

      {/* Card Content Overlay */}
      <div className="absolute inset-0 z-20 p-4 sm:p-5 flex flex-col justify-between items-start">
        
        {/* Top: Icon Badge */}
        <div className="flex items-center justify-between w-full">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/60 border border-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
            style={{ color: career.color }}
          >
            {career.icon}
          </div>
          <span className="text-[8px] font-medium uppercase tracking-widest text-slate-300 bg-black/50 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
            {career.category === 'Cyber Security' ? 'Cyber' : career.category === 'AI & Data' ? 'AI' : 'Arch'}
          </span>
        </div>

        {/* Bottom: Designation Title (Reference Style) */}
        <div className="w-full">
          <h4 className="text-sm sm:text-base font-medium text-white tracking-tight leading-snug whitespace-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {career.title}
          </h4>
          <span className="text-[9px] font-semibold text-[#C6FF34] mt-1 block uppercase tracking-wider opacity-85 group-hover:opacity-100 transition-opacity">
            Forged Career &rarr;
          </span>
        </div>

      </div>

      {/* Subtle top border illumination */}
      <div 
        className="absolute top-0 inset-x-3 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30" 
        style={{ background: `linear-gradient(90deg, transparent, ${career.color}, transparent)` }}
      />
    </div>
  );
}
