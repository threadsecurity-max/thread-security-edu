'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ContactFormClient() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [program, setProgram] = useState('cybersecurity');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Phone, and Email).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      // Simulate/perform contact submission
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage('Failed to submit counseling request. Please try calling directly or email admissions@threads-edu.com.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-4 shadow-sm"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-emerald-950">
            Counseling Request Received, {fullName}!
          </h3>
          <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
            Our Senior Career Advisor will review your query regarding the{' '}
            <strong className="font-semibold">{program}</strong> track and contact you via{' '}
            <strong className="font-semibold">{phone}</strong> or{' '}
            <strong className="font-semibold">{email}</strong> within 2 hours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFullName('');
            setPhone('');
            setEmail('');
            setMessage('');
          }}
          className="text-xs font-mono font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
        >
          Submit another inquiry →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 text-left">
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="fullName" className="block font-bold text-xs uppercase tracking-wide text-slate-900">
            Full Name <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block font-bold text-xs uppercase tracking-wide text-slate-900">
            Phone Number <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block font-bold text-xs uppercase tracking-wide text-slate-900">
          Email Address <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="rahul@example.com"
          className="rounded-xl border-gray-300 focus-visible:ring-2 focus-visible:ring-black"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="program" className="block font-bold text-xs uppercase tracking-wide text-slate-900">
          Interested Program
        </label>
        <select
          id="program"
          name="program"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black font-sans"
        >
          <option value="cybersecurity">Cybersecurity & Ethical Hacking Career Track</option>
          <option value="soc-analyst">SOC Operations & Threat Hunting (Blue Team)</option>
          <option value="ai-security">AI Security Engineering & LLM Red Teaming</option>
          <option value="devsecops">Cloud DevSecOps & Infrastructure Hardening</option>
          <option value="other">General Career Counseling / Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block font-bold text-xs uppercase tracking-wide text-slate-900">
          Your Message / Query <span className="text-slate-500 font-normal text-[11px]">(Optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your background or target career goals..."
          className="w-full p-3 text-sm rounded-xl border border-gray-300 text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-black font-sans"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-base gap-2 cursor-pointer shadow-md disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Submitting Request...</span>
          </>
        ) : (
          <>
            <span>Submit Request & Book Demo</span>
            <ArrowRight className="w-5 h-5 text-emerald-400" />
          </>
        )}
      </Button>
    </form>
  );
}
