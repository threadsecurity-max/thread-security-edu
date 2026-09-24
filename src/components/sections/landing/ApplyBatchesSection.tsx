'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  PhoneForwarded,
  CheckCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Brain,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ApplyBatchesSection() {
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
    <section id="apply-batches" className="relative py-20 sm:py-28 bg-white text-slate-900 overflow-hidden border-t border-slate-100">

      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Apply
            </span>{' '}
            for Upcoming Batches
          </h2>
        </div>

        {/* ── TWO-COLUMN LAYOUT WITH 'OR' DIVIDER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

          {/* ════════════════════════════════════════════════════════════════════════
              LEFT COLUMN: 3 STEPS & REQUEST CALLBACK BUTTON
             ════════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">

            {/* 3 Sequential Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">

              {/* Step 1 */}
              <div className="relative p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[190px]">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-inner">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-semibold text-blue-200/70 select-none">1</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-medium text-slate-900 tracking-tight">
                    Request Callback
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Kickstart your learning journey by requesting callback today.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[190px]">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shadow-inner">
                    <PhoneForwarded className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-semibold text-blue-200/70 select-none">2</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-medium text-slate-900 tracking-tight">
                    Get on a Call
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Chat with us to learn more about your career options.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[190px]">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-inner">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-semibold text-blue-200/70 select-none">3</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-medium text-slate-900 tracking-tight">
                    Book your seat
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Secure your spot and embark on your learning adventure!
                  </p>
                </div>
              </div>

            </div>

            {/* Request Callback Trigger Button (Matches Reference) */}
            <div className="w-full">
              <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
                <DialogTrigger asChild>
                  <button className="w-full py-4 px-6 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-600 hover:text-blue-700 font-medium text-base shadow-sm hover:shadow transition-all duration-300 flex items-center justify-center gap-2 group">
                    <PhoneCall className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Request a Callback</span>
                  </button>
                </DialogTrigger>

                {/* Comprehensive Career Counselling Callback Dialog Form */}
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
                          <span>100% Sandboxed Hands-On Live Labs</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                          <span>1:1 Senior CISO &amp; AI Security Faculty</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                          <span>Verifiable TS-ID Digital Credentials</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-[#C6FF34] shrink-0" />
                          <span>Direct Hiring Partner Referral Network</span>
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
                            Callback Request Confirmed!
                          </h3>
                          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                            Thank you, <span className="font-semibold text-slate-800">{formData.name}</span>. Our senior career strategist will call you at <span className="font-semibold text-slate-800">{formData.phone}</span> shortly.
                          </p>
                          <div className="pt-4">
                            <Button
                              onClick={() => { setOpen(false); resetForm(); }}
                              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-2.5 text-xs font-medium"
                            >
                              Done
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-6">

                          {/* Step Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-slate-900">
                                {step === 1 ? 'Personal Details' : 'Career Focus'}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {step === 1 ? 'Step 1 of 2 • Basic Information' : 'Step 2 of 2 • Target Specialization'}
                              </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                              Step {step}/2
                            </span>
                          </div>

                          {/* Step 1 Fields */}
                          {step === 1 && (
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
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
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
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
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
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
                                  />
                                </div>
                              </div>

                              <Button
                                type="submit"
                                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all mt-4"
                              >
                                <span>Continue to Career Focus</span>
                                <ArrowRight className="ml-2 w-4 h-4" />
                              </Button>
                            </motion.div>
                          )}

                          {/* Step 2 Fields */}
                          {step === 2 && (
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
                                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${formData.currentStatus === item.id
                                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-medium shadow-sm'
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
                                  Target Career Track
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
                                      className={`w-full p-3 rounded-xl border text-xs font-medium flex items-center gap-3 transition-all ${formData.domain === item.id
                                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-medium shadow-sm'
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
                                  onClick={() => setStep(1)}
                                  className="w-1/3 py-5 rounded-xl text-xs font-medium text-slate-600 border-slate-200 hover:bg-slate-50"
                                >
                                  Back
                                </Button>
                                <Button
                                  type="submit"
                                  className="w-2/3 py-5 bg-lime-600 hover:bg-lime-700 text-white font-medium text-xs rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
                                >
                                  Submit Callback Request
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
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              CENTER 'OR' DIVIDER
             ════════════════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center relative">
            <div className="w-px h-full bg-slate-200" />
            <span className="absolute bg-white px-3 py-1 text-xs font-semibold text-slate-600 uppercase tracking-widest border border-slate-200 rounded-full shadow-sm">
              OR
            </span>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              RIGHT COLUMN: CLASSROOM IMAGE & VIEW ALL COURSES BUTTON
             ════════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">

            {/* Live Training Session Container */}
            <div className="relative w-full h-[230px] sm:h-[260px] rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
              <Image
                src="/images/student-counselling.jpg"
                alt="Live Interactive Training Session"
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Top Pill Overlay */}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                  Live Cohort & Offline Labs
                </span>
              </div>
            </div>

            {/* View All Courses CTA Button */}
            <Link href="/courses" className="w-full">
              <button className="w-full py-4 px-6 rounded-xl bg-[#C6FF34] hover:bg-[#b8f520] text-slate-950 font-semibold shadow-lg shadow-lime-500/10 hover:shadow-lime-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
                <span>View All Courses</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </Link>

          </div>

        </div>

      </div>

    </section>
  );
}
