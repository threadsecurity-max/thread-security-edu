'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Layers,
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  Send,
  FileText,
  Clock,
  TrendingUp,
  Share2,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { QuickAttendanceModal } from './quick-attendance-modal';
import { RecordLectureModal } from './record-lecture-modal';

export interface BatchWorkspaceHeaderProps {
  batch: any;
  latestSession?: any;
}

export function BatchWorkspaceHeader({ batch, latestSession }: BatchWorkspaceHeaderProps) {
  const pathname = usePathname();
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const basePath = `/mentor/batches/${batch.id}`;

  const tabs = [
    { label: 'Overview', href: basePath, exact: true, icon: Layers },
    { label: 'Students', href: `${basePath}/students`, count: batch.students?.length, icon: Users },
    { label: 'Attendance', href: `${basePath}/attendance`, icon: CheckCircle2 },
    { label: 'Lectures', href: `${basePath}/lectures`, count: batch.sessions?.length, icon: Clock },
    { label: 'Modules', href: `${basePath}/modules`, icon: BookOpen },
    { label: 'Resources', href: `${basePath}/resources`, count: batch.resources?.length, icon: Share2 },
    { label: 'Broadcast', href: `${basePath}/broadcast`, icon: Send },
    { label: 'Progress', href: `${basePath}/progress`, icon: TrendingUp },
    { label: 'Reports', href: `${basePath}/reports`, icon: FileText },
  ];

  const isTabActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return to batches */}
      <div className="flex items-center justify-between">
        <Link href="/mentor/batches" className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Batches</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-400">
          Independent Batch Workspace • ID: <code className="text-slate-300 font-bold">{batch.id.slice(0, 10)}...</code>
        </span>
      </div>

      {/* BATCH HEADER CARD */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0a0a0a] via-[#121212] to-[#0a0a0a] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#C6FF34] text-black font-mono text-xs font-bold">
                {batch.batchCode}
              </Badge>
              <Badge
                variant="outline"
                className={`font-mono text-xs ${
                  batch.status === 'ACTIVE'
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : 'border-white/10 text-slate-300'
                }`}
              >
                ● {batch.status}
              </Badge>
              <Badge className="bg-white/10 text-slate-300 font-mono text-xs">
                {batch.students?.length || 0} Enrolled Students
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
                {batch.title}
              </h1>
              <p className="text-xs md:text-sm text-slate-300 font-mono mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Course: <strong className="text-white">{batch.course?.title || 'Security Curriculum'}</strong></span>
                <span>Mentor: <strong className="text-white">{batch.mentor?.user?.name || 'Assigned Faculty'}</strong></span>
                {batch.schedule && <span>Schedule: <strong className="text-[#C6FF34]">{batch.schedule}</strong></span>}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>
                Started:{' '}
                <strong className="text-slate-200">
                  {new Date(batch.startDate).toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>
              </span>
              {batch.endDate && (
                <span>
                  Expected End:{' '}
                  <strong className="text-slate-200">
                    {new Date(batch.endDate).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </span>
              )}
              <span>Lock Window: <strong className="text-slate-200">{batch.attendanceLockHours} Hours</strong></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 shrink-0">
            {latestSession && (
              <Button
                size="sm"
                onClick={() => setIsAttendanceModalOpen(true)}
                className="bg-white hover:bg-slate-200 text-black font-mono text-xs font-bold gap-1.5 shadow-md transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Mark Attendance
              </Button>
            )}

            {latestSession && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsRecordModalOpen(true)}
                className="border-white/15 hover:border-[#C6FF34] text-slate-200 hover:text-white font-mono text-xs gap-1.5 bg-white/5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Record Lecture
              </Button>
            )}

            <Link href={`${basePath}/broadcast`}>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-white/15 hover:border-[#C6FF34] text-slate-200 hover:text-white font-mono text-xs gap-1.5 bg-white/5"
              >
                <Send className="w-3.5 h-3.5 text-[#C6FF34]" />
                Broadcast Message
              </Button>
            </Link>

            <Link href={`${basePath}/resources`}>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-white/15 hover:border-[#C6FF34] text-slate-200 hover:text-white font-mono text-xs gap-1.5 bg-white/5"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                Share Resource
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="border-b border-white/10 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 sm:space-x-2 min-w-max pb-px">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href, tab.exact);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-mono transition-all ${
                  active
                    ? 'bg-white/10 text-[#C6FF34] font-bold border-b-2 border-[#C6FF34]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#C6FF34]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active
                        ? 'bg-[#C6FF34]/20 text-[#C6FF34]'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Modals */}
      {latestSession && isAttendanceModalOpen && (
        <QuickAttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          session={latestSession}
          batch={batch}
          onSuccess={() => setIsAttendanceModalOpen(false)}
        />
      )}

      {latestSession && isRecordModalOpen && (
        <RecordLectureModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          session={latestSession}
          batchId={batch.id}
          modules={batch.course?.modules || []}
          onSuccess={() => setIsRecordModalOpen(false)}
        />
      )}
    </div>
  );
}
