'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Mail, Phone, User, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CareerCounsellingSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentStatus: 'confused',
    domain: 'hybrid',
  });
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [open, setOpen] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      setStep(2);
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
    setStep(1);
    setIsSubmitted(false);
  };

  return (
    <section className="relative py-2 bg-[#030014] overflow-hidden">
      {/* Background radial violet glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Contained Card Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-[#0a071b] via-[#0f0b2a] to-[#05030f] shadow-2xl"
        >
          {/* Subtle neon top border line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-4 relative z-20">
              <div className="space-y-2.5">
                {/* Sparkle badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-950/60 border border-violet-800/40 text-[10px] font-medium uppercase tracking-wider text-violet-300">
                  <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
                  Not Sure Where To Start?
                </div>

                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15] text-white">
                  Have a busy schedule?<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300">
                    No problem!
                  </span>
                </h2>

                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
                  Upskill & Upgrade your career with Thread Academy at your own pace. Speak to our expert career counsellors to map your journey in Cybersecurity & AI.
                </p>
              </div>

              {/* White CTA Button matching reference image */}
              <div className="pt-2">
                <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button
                      className="group relative bg-white hover:bg-slate-100 text-violet-950 font-semibold px-6 py-5 rounded-lg shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-sm"
                    >
                      <span>Speak To Our Career Counsellor</span>
                      <ChevronRight className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white text-slate-900 border-none sm:rounded-3xl shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[520px]">
                      
                      {/* Left Column (Charcoal / Black Brand Card) */}
                      <div className="md:col-span-5 bg-gradient-to-br from-[#0c0c14] via-[#09090f] to-[#040408] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                        {/* Overlay pattern background */}
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
                            Upskill in Industry Relevant Skillset to switch to Top 1% roles in Cybersecurity and AI.
                          </p>
                        </div>

                        {/* Program Guarantees & Value Checklist */}
                        <div className="relative z-10 bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.08] space-y-2.5">
                          <div className="flex items-center gap-2.5 text-xs text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                            <span>Personalized 1:1 Career Roadmapping</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                            <span>Direct Faculty &amp; Academic Guidance</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                            <span>100% Free Live Consultation Call</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                            <span>Zero Obligation Syllabus &amp; Placement Review</span>
                          </div>
                        </div>

                      </div>

                      {/* Right Column (The Premium Multi-step Form) */}
                      <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
                        
                        {!isSubmitted ? (
                          <>
                            {step === 1 ? (
                              <form onSubmit={handleNext} className="space-y-5">
                                <div className="space-y-1">
                                  <h3 className="text-2xl font-medium text-slate-900 tracking-tight">Apply Now</h3>
                                  <p className="text-sm text-slate-500">We keep things simple, just fill some basic details</p>
                                </div>

                                <div className="space-y-4">
                                  {/* Name Input */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Name*</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Enter Your Full Name"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm font-medium"
                                      value={formData.name}
                                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                  </div>

                                  {/* Email Input */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Email*</label>
                                    <input
                                      type="email"
                                      required
                                      placeholder="Enter Your Email Address"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm font-medium"
                                      value={formData.email}
                                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                  </div>

                                  {/* Phone Input with Code */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Phone Number*</label>
                                    <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-lime-500 focus-within:bg-white transition-all">
                                      <div className="flex items-center gap-1.5 px-3 border-r border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700 select-none">
                                        <span className="text-base">🇮🇳</span>
                                        <span>+91</span>
                                      </div>
                                      <input
                                        type="tel"
                                        required
                                        placeholder="Phone Number"
                                        className="w-full bg-transparent px-4 py-3 text-slate-950 placeholder-slate-400 focus:outline-none text-sm font-medium"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Step Indicators */}
                                <div className="flex justify-center items-center gap-1.5 py-1">
                                  <span className="w-2 h-2 rounded-full bg-lime-500" />
                                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                                </div>

                                <Button
                                  type="submit"
                                  className="w-full bg-[#C6FF34] hover:bg-[#b5eb2f] text-black font-semibold py-3.5 rounded-xl shadow-lg shadow-lime-500/10 transition-all text-sm border-none"
                                >
                                  Next
                                </Button>
                              </form>
                            ) : (
                              <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1">
                                  <h3 className="text-2xl font-medium text-slate-900 tracking-tight">One Last Step</h3>
                                  <p className="text-sm text-slate-500">Tell us a bit about your interests and goals</p>
                                </div>

                                <div className="space-y-4">
                                  {/* What describes you best */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">What describes you best?*</label>
                                    <select
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm font-semibold"
                                      value={formData.currentStatus}
                                      onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                                    >
                                      <option value="confused">I am confused and don&apos;t know what to do</option>
                                      <option value="no-structured">Learning online but have no structured roadmap</option>
                                      <option value="jobs">Struggling to find jobs/placements</option>
                                      <option value="other">Just starting out / Curious student</option>
                                    </select>
                                  </div>

                                  {/* Domain selection */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">General Area of Interest*</label>
                                    <select
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm font-semibold"
                                      value={formData.domain}
                                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    >
                                      <option value="cybersecurity">Cybersecurity & Ethical Hacking</option>
                                      <option value="ai">Artificial Intelligence & Data Science</option>
                                      <option value="hybrid">I want to discuss both options</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Step Indicators */}
                                <div className="flex justify-center items-center gap-1.5 py-1">
                                  <span className="w-2 h-2 rounded-full bg-slate-200" />
                                  <span className="w-2 h-2 rounded-full bg-lime-500" />
                                </div>

                                <div className="flex gap-3">
                                  <Button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3.5 rounded-xl transition-all text-sm"
                                  >
                                    Back
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="w-2/3 bg-[#C6FF34] hover:bg-[#b5eb2f] text-black font-semibold py-3.5 rounded-xl shadow-lg shadow-lime-500/10 transition-all text-sm border-none"
                                  >
                                    Unlock My Roadmap
                                  </Button>
                                </div>
                              </form>
                            )}
                          </>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8 space-y-4"
                          >
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                              <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-medium text-slate-900">You&apos;re in good hands!</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                              Hi {formData.name}, your request has been logged. A senior mentor will reach out to you on {formData.phone} shortly to guide you.
                            </p>
                            <Button
                              onClick={() => setOpen(false)}
                              className="bg-black hover:bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all mt-4 border border-slate-800"
                            >
                              Done
                            </Button>
                          </motion.div>
                        )}
                      </div>

                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Right Image/Visual Column with Skew Diagonal cut */}
            <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full overflow-hidden">
              
              {/* The Skewed slash divider overlay block to separate image from text */}
              <div className="absolute inset-y-0 -left-6 w-16 bg-[#0f0b2a] transform -skew-x-12 z-20 hidden lg:block border-r border-violet-500/15" />
              
              {/* Grayscale overlay & student image */}
              <div className="absolute inset-0 bg-[#0d0a1b]/40 mix-blend-multiply z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f0b2a] via-[#0f0b2a]/30 to-transparent z-10" />
              
              <Image
                src="/images/student-counselling.jpg"
                alt="Student analyzing tech career path options"
                fill
                className="object-cover grayscale brightness-75 contrast-[1.1]"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
