'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  ZoomIn, 
  ArrowUpRight,
  Sparkles,
  User,
  Mail,
  Phone,
  ArrowRight,
  Layers,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CertificatesSection() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; subtitle?: string } | null>(null);
  const [activeStudentCert, setActiveStudentCert] = useState<'cyber' | 'ai'>('cyber');
  const [activeGovtCert, setActiveGovtCert] = useState<'dpiit' | 'iso'>('dpiit');

  // Form Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentStatus: 'confused',
    domain: 'hybrid',
  });
  const [formStep, setFormStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      setFormStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setIsSubmitted(true);
    }, 800);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      currentStatus: 'confused',
      domain: 'hybrid',
    });
    setFormStep(1);
    setIsSubmitted(false);
  };

  return (
    <section 
      id="certifications" 
      className="relative bg-gradient-to-b from-[#070312] via-[#080316] to-[#04010d] text-white pt-24 pb-24 sm:pt-36 sm:pb-32 overflow-hidden border-b border-violet-900/20"
    >
      {/* ── TOP & BOTTOM SEAMLESS BLEND OVERLAYS ── */}
      <div className="absolute top-0 inset-x-0 h-48 sm:h-64 bg-gradient-to-b from-[#070312] via-[#070312]/80 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#04010d] to-transparent pointer-events-none z-10" />

      {/* ── DEEP VIOLET & OBSIDIAN AMBIENT LIGHTING (Seamless Blend) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft violet overhead bloom connecting seamlessly with Careers section */}
        <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-b from-violet-600/20 via-purple-900/10 to-transparent rounded-full blur-[160px] opacity-75" />
        
        {/* Deep ambient indigo core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      {/* ── BLUEPRINT WIREFRAME GRID & CROSSHAIR MARKERS (Ultra-Smooth Eased Mask) ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          maskImage: 'linear-gradient(180deg, transparent 0%, transparent 10%, rgba(0,0,0,0.5) 28%, rgba(0,0,0,1) 45%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.3) 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, transparent 10%, rgba(0,0,0,0.5) 28%, rgba(0,0,0,1) 45%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.3) 90%, transparent 100%)'
        }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cert-grid" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#a855f7" strokeWidth="0.75" strokeDasharray="3 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cert-grid)" />
        </svg>

        {/* Blueprint Framing Crosshairs (Aligned comfortably with padded layout) */}
        <div className="absolute top-28 left-8 sm:left-16 w-3 h-3 border-t-2 border-l-2 border-violet-400/50" />
        <div className="absolute top-28 right-8 sm:right-16 w-3 h-3 border-t-2 border-r-2 border-violet-400/50" />
        <div className="absolute bottom-20 left-8 sm:left-16 w-3 h-3 border-b-2 border-l-2 border-violet-400/50" />
        <div className="absolute bottom-20 right-8 sm:right-16 w-3 h-3 border-b-2 border-r-2 border-violet-400/50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        
        {/* ── SECTION PRE-HEADER & HEADLINE (Reference Style) ── */}
        <div className="text-center max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300 text-xs font-medium tracking-[0.25em] uppercase mb-4 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <span>— CERTIFICATIONS —</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.15]">
            Industry-Recognized Cybersecurity & AI <br />
            <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-purple-300 to-indigo-200">
              Certifications
            </span>
          </h2>

          <p className="mt-4 text-xs sm:text-base text-slate-300/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Validate your expertise with verifiable credentials recognized by top tier enterprises, government bodies, and cybersecurity frameworks worldwide.
          </p>
        </div>

        {/* ── PARALLEL SHOWCASE CARDS (Side-by-Side Clean Grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 w-full max-w-6xl items-stretch">
          
          {/* ════════════════════════════════════════════════════════════════════════
              1. STUDENT CERTIFICATES (Left Parallel Card)
             ════════════════════════════════════════════════════════════════════════ */}
          <div className="group relative rounded-4xl p-1 bg-gradient-to-b from-violet-500/35 via-violet-900/15 to-violet-950/40 border border-violet-500/30 hover:border-violet-400/70 transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.35)] flex flex-col h-full hover:-translate-y-1.5">
            <div className="relative w-full rounded-xl bg-[#0e071e]/95 p-6 flex flex-col h-full overflow-hidden justify-between">
              
              {/* Header Badge with Track Switcher */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 bg-[#170c30] p-1 rounded-full border border-violet-700/30">
                  <button
                    onClick={() => setActiveStudentCert('cyber')}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
                      activeStudentCert === 'cyber'
                        ? 'bg-[#C6FF34] text-slate-950 shadow-[0_0_10px_rgba(198,255,52,0.5)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cybersecurity Track
                  </button>
                  <button
                    onClick={() => setActiveStudentCert('ai')}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
                      activeStudentCert === 'ai'
                        ? 'bg-[#C6FF34] text-slate-950 shadow-[0_0_10px_rgba(198,255,52,0.5)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AI & ML Track
                  </button>
                </div>

                <button 
                  onClick={() => setSelectedImage({ 
                    src: activeStudentCert === 'cyber' ? '/images/CertCyber.png' : '/images/CertAI.png', 
                    title: activeStudentCert === 'cyber' ? 'TSE Cybersecurity Specialization Certificate' : 'TSE AI & ML Specialization Certificate',
                    subtitle: activeStudentCert === 'cyber' ? 'Awarded upon clearing live enterprise attack-defense capstones and incident response operations.' : 'Awarded upon mastering production AI architectures, neural systems, and agentic workflows.'
                  })}
                  className="flex items-center gap-1 text-slate-400 text-xs hover:text-violet-300 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>Inspect</span>
                </button>
              </div>

              {/* Certificate Image Frame */}
              <div 
                onClick={() => setSelectedImage({ 
                  src: activeStudentCert === 'cyber' ? '/images/CertCyber.png' : '/images/CertAI.png', 
                  title: activeStudentCert === 'cyber' ? 'TSE Cybersecurity Specialization Certificate' : 'TSE AI & ML Specialization Certificate',
                  subtitle: activeStudentCert === 'cyber' ? 'Awarded upon clearing live enterprise attack-defense capstones and incident response operations.' : 'Awarded upon mastering production AI architectures, neural systems, and agentic workflows.'
                })}
                className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/20 bg-[#120c24] shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-pointer group-hover:scale-[1.015] transition-transform duration-500 flex items-center justify-center p-1"
              >
                <Image 
                  src={activeStudentCert === 'cyber' ? '/images/CertCyber.png' : '/images/CertAI.png'} 
                  alt={activeStudentCert === 'cyber' ? 'TSE Cybersecurity Student Certificate' : 'TSE AI Student Certificate'} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain filter brightness-[0.98] contrast-[1.02]"
                  priority
                />
              </div>

              {/* Card Footer Info */}
              <div className="mt-5 space-y-1.5">
                <h3 className="text-base font-medium text-white group-hover:text-violet-300 transition-colors">
                  {activeStudentCert === 'cyber' ? 'Offensive & Defensive Cyber Credential' : 'Artificial Intelligence & Data Credential'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeStudentCert === 'cyber'
                    ? 'Earned upon clearing real-time threat emulation, vulnerability assessment, and live blue team drills.'
                    : 'Earned upon building production-grade LLM architectures, RAG pipelines, and intelligent multi-agent systems.'}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-violet-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Cryptographically Verified QR & Lifetime ID</span>
                </div>
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              2. GOVERNMENT RECOGNITION (Right Parallel Card)
             ════════════════════════════════════════════════════════════════════════ */}
          <div className="group relative rounded-4xl p-1 bg-gradient-to-b from-[#C6FF34]/25 via-violet-900/20 to-violet-950/40 border border-[#C6FF34]/30 hover:border-[#C6FF34]/60 transition-all duration-500 hover:shadow-[0_0_40px_rgba(198,255,52,0.25)] flex flex-col h-full hover:-translate-y-1.5">
            <div className="relative w-full rounded-xl bg-[#0e071e]/95 p-6 flex flex-col h-full overflow-hidden justify-between">
              
              {/* Header Badge with Quick Switcher */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 bg-[#170c30] p-1 rounded-full border border-violet-700/30">
                  <button
                    onClick={() => setActiveGovtCert('dpiit')}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
                      activeGovtCert === 'dpiit'
                        ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Govt. (DPIIT)
                  </button>
                  <button
                    onClick={() => setActiveGovtCert('iso')}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
                      activeGovtCert === 'iso'
                        ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ISO Standard
                  </button>
                </div>

                <button 
                  onClick={() => setSelectedImage({ 
                    src: activeGovtCert === 'dpiit' ? '/images/DPIIT.jpg' : '/images/ISO.jpg', 
                    title: activeGovtCert === 'dpiit' ? 'DPIIT Government Recognition' : 'ISO Quality Management Certification',
                    subtitle: activeGovtCert === 'dpiit' ? 'Department for Promotion of Industry and Internal Trade, Ministry of Commerce & Industry.' : 'Accredited Quality Management Standard adhering to international training benchmarks.'
                  })}
                  className="flex items-center gap-1 text-slate-400 text-xs hover:text-violet-300 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>Inspect</span>
                </button>
              </div>

              {/* Certificate Image Frame */}
              <div 
                onClick={() => setSelectedImage({ 
                  src: activeGovtCert === 'dpiit' ? '/images/DPIIT.jpg' : '/images/ISO.jpg', 
                  title: activeGovtCert === 'dpiit' ? 'DPIIT Government Recognition' : 'ISO Quality Management Certification',
                  subtitle: activeGovtCert === 'dpiit' ? 'Department for Promotion of Industry and Internal Trade, Ministry of Commerce & Industry.' : 'Accredited Quality Management Standard adhering to international training benchmarks.'
                })}
                className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/15 bg-[#120c24] shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-pointer group-hover:scale-[1.015] transition-transform duration-500"
              >
                <Image 
                  src={activeGovtCert === 'dpiit' ? '/images/DPIIT.jpg' : '/images/ISO.jpg'} 
                  alt={activeGovtCert === 'dpiit' ? 'DPIIT Government Certificate' : 'ISO Institutional Certificate'} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-top filter brightness-[0.92] contrast-[1.05]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                    {activeGovtCert === 'dpiit' ? 'Startup India • Ministry of Commerce' : 'ISO 9001 Certified Entity'}
                  </span>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="mt-5 space-y-1.5">
                <h3 className="text-base font-medium text-white group-hover:text-violet-300 transition-colors">
                  {activeGovtCert === 'dpiit' ? 'DPIIT Certificate of Recognition' : 'ISO Institutional Certification'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeGovtCert === 'dpiit' 
                    ? 'Official recognition under Startup India by the Ministry of Commerce & Industry, Government of India.' 
                    : 'Accredited quality management framework adhering to international industry training standards.'}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-violet-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {activeGovtCert === 'dpiit' ? 'DPIIT Recognition No: DIPP169824' : 'Certified Training Provider Standard'}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── CALL TO ACTION BUTTON WITH CAREER COUNSELLING MODAL FORM ── */}
        <div className="mt-14 sm:mt-16 flex flex-col items-center gap-3">
          <Dialog open={formOpen} onOpenChange={(val) => { setFormOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <button
                className="group relative inline-flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-slate-100 font-medium text-sm sm:text-base px-8 py-3.5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-[1.03]"
              >
                <span>Get Certified</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </DialogTrigger>

            {/* Comprehensive Callback Dialog Form Modal */}
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white text-slate-900 border-none sm:rounded-3xl shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[520px]">
                
                {/* Left Column (Charcoal / Black Brand Card) */}
                <div className="md:col-span-5 bg-gradient-to-br from-[#0c0c14] via-[#09090f] to-[#040408] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Brand Logo/Header */}
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="font-semibold tracking-wider text-lg">THREAD</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-medium tracking-widest">ACADEMY</span>
                  </div>

                  {/* Middle Pitch message */}
                  <div className="relative z-10 my-8 space-y-3">
                    <h3 className="text-3xl font-semibold leading-tight">
                      Start your<br />
                      <span className="italic font-serif font-light text-[#C6FF34]">journey with us.</span>
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Upskill in Industry Relevant Skillset to earn your verifiable credentials and switch to Top 1% roles in Cybersecurity and AI.
                    </p>
                  </div>

                  {/* Certification Guarantees & Verification Checklist */}
                  <div className="relative z-10 bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.08] space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                      <span>Cryptographically Signed QR Code Verification</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                      <span>Direct Employer Verification TS-ID Portal</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                      <span>Recognized by Startup India (DPIIT) &amp; ISO Standards</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                      <span>Permanent Student Credential Archival</span>
                    </div>
                  </div>

                </div>

                {/* Right Column (Interactive Multi-Step Form) */}
                <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-900">
                        Certification Application Received!
                      </h3>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Thank you, <span className="font-semibold text-slate-800">{formData.name}</span>. Our lead academic advisor will connect with you at <span className="font-semibold text-slate-800">{formData.phone}</span> to guide your certification pathway.
                      </p>
                      <div className="pt-4">
                        <Button
                          onClick={() => { setFormOpen(false); resetForm(); }}
                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-2.5 text-xs font-medium"
                        >
                          Done
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={formStep === 1 ? handleNext : handleSubmit} className="space-y-6">
                      
                      {/* Step Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {formStep === 1 ? 'Personal Details' : 'Certification Pathway'}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formStep === 1 ? 'Step 1 of 2 • Basic Information' : 'Step 2 of 2 • Preferred Specialization'}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                          Step {formStep}/2
                        </span>
                      </div>

                      {/* Step 1 Fields */}
                      {formStep === 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4"
                        >
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">
                              Full Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600/30 focus:border-violet-600 transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="rahul@example.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600/30 focus:border-violet-600 transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600/30 focus:border-violet-600 transition-all"
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full py-6 bg-violet-700 hover:bg-violet-800 text-white font-medium text-sm rounded-xl shadow-lg hover:shadow-violet-500/25 transition-all mt-4"
                          >
                            <span>Continue to Specialization</span>
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}

                      {/* Step 2 Fields */}
                      {formStep === 2 && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-5"
                        >
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">
                              Current Status
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'college', label: 'College Student' },
                                { id: 'graduate', label: 'Recent Graduate' },
                                { id: 'working', label: 'Working Professional' },
                                { id: 'confused', label: 'Switching Domain' },
                              ].map((item) => (
                                <button
                                  type="button"
                                  key={item.id}
                                  onClick={() => setFormData({ ...formData, currentStatus: item.id })}
                                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                                    formData.currentStatus === item.id
                                      ? 'border-violet-600 bg-violet-50/80 text-violet-900 font-medium shadow-sm'
                                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700 uppercase tracking-wider">
                              Target Certification Specialization
                            </label>
                            <div className="space-y-2">
                              {[
                                { id: 'security', label: 'Cybersecurity / SOC / Offensive Defense', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> },
                                { id: 'ai', label: 'Artificial Intelligence & Machine Learning', icon: <Brain className="w-4 h-4 text-purple-600" /> },
                                { id: 'hybrid', label: 'Integrated Cyber Security & AI Engineering', icon: <Layers className="w-4 h-4 text-blue-600" /> },
                              ].map((item) => (
                                <button
                                  type="button"
                                  key={item.id}
                                  onClick={() => setFormData({ ...formData, domain: item.id })}
                                  className={`w-full p-3 rounded-xl border text-xs font-medium flex items-center gap-3 transition-all ${
                                    formData.domain === item.id
                                      ? 'border-violet-600 bg-violet-50/80 text-violet-900 font-medium shadow-sm'
                                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                  }`}
                                >
                                  {item.icon}
                                  <span>{item.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setFormStep(1)}
                              className="w-1/3 py-5 rounded-xl text-xs font-medium text-slate-600 border-slate-200 hover:bg-slate-50"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              className="w-2/3 py-5 bg-violet-700 hover:bg-violet-800 text-white font-medium text-xs rounded-xl shadow-lg hover:shadow-violet-500/25 transition-all"
                            >
                              Apply to Get Certified
                            </Button>
                          </div>
                        </motion.div>
                      )}

                    </form>
                  )}
                </div>

              </div>
            </DialogContent>
          </Dialog>
          
          <span className="text-[11px] font-medium text-slate-400 tracking-wide">
            Lifetime verification & credentials endorsed by industry leaders
          </span>
        </div>

      </div>

      {/* ── HIGH-RESOLUTION FULLSCREEN LIGHTBOX MODAL ── */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#100724] border border-violet-500/40 p-6 sm:p-8 flex flex-col shadow-[0_0_60px_rgba(168,85,247,0.4)] overflow-y-auto">
            
            {/* Modal Close Button */}
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors z-30"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-4 pr-10">
              <span className="text-xs font-medium uppercase tracking-widest text-[#C6FF34]">
                Official Verification Preview
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mt-1">
                {selectedImage.title}
              </h3>
              {selectedImage.subtitle && (
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {selectedImage.subtitle}
                </p>
              )}
            </div>

            {/* Certificate Big Image View */}
            <div className="relative w-full rounded-xl overflow-hidden border-2 border-violet-500/30 bg-[#090414] mb-6 flex items-center justify-center p-2">
              <div className="relative w-full h-[400px] sm:h-[520px]">
                <Image 
                  src={selectedImage.src} 
                  alt={selectedImage.title} 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Modal Bottom Details */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-violet-900/40">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Lifetime Authenticity Verification via TSE Portal</span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-6 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Styled Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
