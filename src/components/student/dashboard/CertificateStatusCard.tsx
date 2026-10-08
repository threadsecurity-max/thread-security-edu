'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { Award, CheckCircle2, Lock, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface CertificateStatusProps {
  certificate: {
    isIssued: boolean;
    certificateId: string | null;
    verificationHash: string | null;
    courseTitle: string | null;
    issuedAt: string | null;
    requiredModulesRemaining: number;
  };
  overallProgressPercent: number;
}

export function CertificateStatusCard({
  certificate,
  overallProgressPercent,
}: CertificateStatusProps) {
  if (certificate.isIssued && certificate.certificateId) {
    return (
      <GlassCard level={2} glow={true} className="p-5 space-y-4 border-[#C6FF34]/30">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#C6FF34] font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#C6FF34]" />
            OFFICIAL CERTIFICATE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            ISSUED & VERIFIED
          </span>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-serif font-bold text-white tracking-tight line-clamp-1">
            {certificate.courseTitle || 'Cybersecurity Qualification'}
          </h4>
          <p className="text-xs font-mono text-zinc-400">
            Certificate ID:{' '}
            <span className="text-[#C6FF34] font-bold">{certificate.certificateId}</span>
          </p>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <Link href="/student/certificates" className="flex-1">
            <button className="w-full py-2 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
              <span>View Credential</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard level={1} className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
          <Award className="w-4 h-4 text-zinc-400" />
          CERTIFICATION GOAL
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          IN PROGRESS
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-zinc-300 leading-relaxed">
          Complete all required course modules and achieve a passing score on the final assessment
          to unlock your cryptographically verified diploma.
        </p>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Qualification Threshold</span>
            <span className="text-white font-semibold">{overallProgressPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(2, Math.min(100, overallProgressPercent))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-1">
        <Link
          href="/student/courses"
          className="text-xs font-mono text-[#C6FF34] hover:underline flex items-center gap-1"
        >
          <span>Complete Pending Modules ({certificate.requiredModulesRemaining} remaining)</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </GlassCard>
  );
}
