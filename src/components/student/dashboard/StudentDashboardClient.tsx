'use client';

import React from 'react';
import type { StudentDashboardData } from '@/server/services/student-dashboard.service';
import { StudentStatusCard } from './StudentStatusCard';
import { LearningProgressOverview } from './LearningProgressOverview';
import { LearningStreakWidget } from './LearningStreakWidget';
import { RecentActivityTimeline } from './RecentActivityTimeline';
import { StudentAnnouncementModal } from './StudentAnnouncementModal';

export interface StudentDashboardClientProps {
  data: StudentDashboardData;
}

export function StudentDashboardClient({ data }: StudentDashboardClientProps) {
  const {
    student,
    learningJourney,
    activityTimeline,
    announcements,
  } = data;

  return (
    <div className="space-y-8 font-sans selection:bg-[#C6FF34] selection:text-black max-w-7xl mx-auto">
      {/* ── BROADCAST ANNOUNCEMENT MODAL ── */}
      <StudentAnnouncementModal announcements={announcements} />

      {/* ── 1. AUTHENTICATED TS-ID & 2. LEARNING STREAK ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pillar 1: AUTHENTICATED TS-ID Card (Col 6) */}
        <div className="lg:col-span-6 space-y-6">
          <StudentStatusCard
            student={student}
            overallProgressPercent={learningJourney.overallProgressPercent}
            enrolledCoursesCount={learningJourney.coursesEnrolledCount}
          />
        </div>

        {/* Pillar 3: LEARNING STREAK (Col 6) */}
        <div className="lg:col-span-6 space-y-6">
          <LearningStreakWidget
            currentStreak={student.currentStreak}
            streakDays={student.streakDays}
          />
        </div>
      </div>

      {/* ── 2. YOUR LEARNING JOURNEY ── */}
      <div className="space-y-6">
        <LearningProgressOverview
          journey={learningJourney}
          totalHours={student.totalHours}
        />
      </div>

      {/* ── 4. RECENT ACTIVITY ── */}
      <div className="space-y-6">
        <RecentActivityTimeline activities={activityTimeline} />
      </div>
    </div>
  );
}
