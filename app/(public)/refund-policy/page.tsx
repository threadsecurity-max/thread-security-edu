import { Metadata } from 'next';
import Link from 'next/link';
import { CreditCard, CheckCircle2, Clock, AlertCircle, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Thread Security Education',
  description:
    'Review the transparent admission fee refund, batch transfer, demo class guarantees, and cancellation policies at Thread Security Education.',
  alternates: {
    canonical: 'https://threadsecurity.in/refund-policy',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold mb-4">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Transparent Student Fee Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-3">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: January 1, 2026 | Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-700">

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">1. Commitment to Student Satisfaction</h2>
            <p>
              Thread Security Education is dedicated to providing world-class training in Cybersecurity, Ethical Hacking, Cloud DevSecOps, and AI Security. To ensure complete confidence, we offer free interactive demo classes and structured orientation sessions before students make financial commitments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">2. Free Demo Class &amp; Evaluation Period</h2>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950">
              <h3 className="font-bold text-sm mb-1 text-emerald-900">Zero-Risk Demo Experience</h3>
              <p className="text-xs leading-relaxed text-emerald-800">
                Prospective students can attend free demo masterclasses and inspect our sandboxed lab platform without any obligation. We encourage all learners to experience our teaching methodology before formal registration.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">3. Refund Eligibility Windows</h2>
            <p>For standard diploma, certificate, and industrial training cohorts:</p>
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-xs text-slate-950 block mb-1">Prior to Batch Commencement:</span>
                <p className="text-xs text-slate-600">
                  If a refund request is received in writing at least 48 hours prior to the announced batch start date, a 100% refund of tuition fees paid will be processed (less nominal gateway processing charges).
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-xs text-slate-950 block mb-1">Within First 3 Days of Batch Start:</span>
                <p className="text-xs text-slate-600">
                  If an enrolled student is dissatisfied after attending the first 2 sessions, they may request a refund within 3 calendar days of the batch start date. The fee paid will be refunded after deducting a pro-rated lab provisioning and admission administrative fee (maximum 15%).
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-xs text-slate-950 block mb-1">After 3 Days of Batch Start:</span>
                <p className="text-xs text-slate-600">
                  Due to the fixed provisioning of dedicated cloud VM instances, instructor allocations, and limited cohort seat sizes, no monetary refunds are issued after the 3rd calendar day of cohort commencement.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">4. Flexible Batch Transfer Option</h2>
            <p>
              If unforeseen personal, health, or college examination schedules prevent a student from continuing their current batch, TSE offers a free one-time transfer to an upcoming cohort within 6 months of original enrollment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">5. Refund Processing Timeline</h2>
            <p>
              Approved refunds are credited back to the original source payment method (bank account, UPI, or debit/credit card) within 5 to 7 business days from formal verification.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-950">6. How to Submit a Refund Request</h2>
            <p>
              To initiate an official refund or batch deferral request, email your admission details, student ID, and fee payment receipt to:
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 inline-block">
              admissions@threadsecurity.in / accounts@threadsecurity.in
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
