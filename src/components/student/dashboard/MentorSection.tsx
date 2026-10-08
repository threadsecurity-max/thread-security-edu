'use client';

import React from 'react';
import { GlassCard } from './GlassCard';
import { User, Mail, Clock, ShieldCheck, ExternalLink } from 'lucide-react';

export interface MentorSectionProps {
  mentor: {
    name: string;
    title: string;
    company: string;
    expertise: string;
    officeHours: string | null;
    email: string;
  } | null;
}

export function MentorSection({ mentor }: MentorSectionProps) {
  if (!mentor) {
    return (
      <GlassCard level={1} className="p-5 text-center space-y-2">
        <User className="w-6 h-6 text-zinc-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">Faculty Mentor</h4>
        <p className="text-xs text-zinc-400">Mentor allocation in progress for your cohort.</p>
      </GlassCard>
    );
  }

  const initial = mentor.name ? mentor.name[0].toUpperCase() : 'M';

  return (
    <GlassCard level={1} className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF34]" />
          YOUR FACULTY MENTOR
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C6FF34]/10 text-[#C6FF34]">
          Live Faculty
        </span>
      </div>

      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white font-mono font-bold text-base shrink-0">
          {initial}
        </div>

        <div className="space-y-0.5 min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white tracking-tight truncate">
            {mentor.name}
          </h4>
          <p className="text-xs text-zinc-400 truncate">
            {mentor.title} • {mentor.company}
          </p>
          <p className="text-[11px] font-mono text-[#C6FF34] truncate mt-1">
            Expertise: {mentor.expertise}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>{mentor.officeHours || 'Cohort Sessions'}</span>
        </div>

        <a
          href={`mailto:${mentor.email}`}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-mono font-medium transition-colors"
        >
          <Mail className="w-3 h-3 text-[#C6FF34]" />
          <span>Message</span>
        </a>
      </div>
    </GlassCard>
  );
}
