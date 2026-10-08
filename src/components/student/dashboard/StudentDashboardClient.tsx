'use client';

import React from 'react';
import type { StudentDashboardData } from '@/server/services/student-dashboard.service';
import { DashboardHero } from './DashboardHero';
import { StudentStatusCard } from './StudentStatusCard';
import { LearningProgressOverview } from './LearningProgressOverview';
import { ContinueLearningCard } from './ContinueLearningCard';
import { CoursesGrid } from './CoursesGrid';
import { UpcomingAssessments } from './UpcomingAssessments';
import { RecentActivityTimeline } from './RecentActivityTimeline';
import { LearningStreakWidget } from './LearningStreakWidget';
import { WeeklyAnalyticsWidget } from './WeeklyAnalyticsWidget';
import { MentorSection } from './MentorSection';
import { AnnouncementsPanel } from './AnnouncementsPanel';
import { QuickResourcesPanel } from './QuickResourcesPanel';
import { CalendarWidget } from './CalendarWidget';
import { CertificateStatusCard } from './CertificateStatusCard';
import { QuickActionsBar } from './QuickActionsBar';

export interface StudentDashboardClientProps {
  data: StudentDashboardData;
}

export function StudentDashboardClient({ data }: StudentDashboardClientProps) {
  const {
    student,
    learningJourney,
    currentCourse,
    courses,
    assessments,
    activityTimeline,
    announcements,
    resources,
    calendarEvents,
    certificate,
  } = data;

  return (
    <div className="space-y-8 font-sans selection:bg-[#C6FF34] selection:text-black">
      {/* 1. HERO SECTION: Greeting & Primary Next Action */}
      <DashboardHero
        studentName={student.name}
        batchName={student.batchName}
        currentCourse={currentCourse}
      />

      {/* 2. CORE STATUS & PROGRESS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Student Status & TS-ID Card (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <StudentStatusCard
            student={student}
            overallProgressPercent={learningJourney.overallProgressPercent}
            enrolledCoursesCount={learningJourney.coursesEnrolledCount}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <LearningStreakWidget
              currentStreak={student.currentStreak}
              streakDays={student.streakDays}
            />
            <WeeklyAnalyticsWidget
              weeklyHours={student.weeklyHours}
              goalHours={student.weeklyGoalHours}
            />
          </div>
        </div>

        {/* Learning Journey Progress Metrics (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <LearningProgressOverview
            journey={learningJourney}
            totalHours={student.totalHours}
          />

          <ContinueLearningCard currentCourse={currentCourse} />
        </div>
      </div>

      {/* 3. QUICK COMMAND ACCESS BAR */}
      <QuickActionsBar />

      {/* 4. MY COURSES & SYLLABUS GRID */}
      <CoursesGrid courses={courses} />

      {/* 5. UPCOMING ASSESSMENTS & BENCHMARK EXAMS */}
      <UpcomingAssessments assessments={assessments} />

      {/* 6. RECENT ACTIVITY, MENTOR, AND COHORT WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1: Live Timeline */}
        <div className="space-y-6">
          <RecentActivityTimeline activities={activityTimeline} />
          <CertificateStatusCard
            certificate={certificate}
            overallProgressPercent={learningJourney.overallProgressPercent}
          />
        </div>

        {/* Column 2: Assigned Faculty Mentor & Calendar */}
        <div className="space-y-6">
          <MentorSection mentor={student.assignedMentor} />
          <CalendarWidget events={calendarEvents} />
        </div>

        {/* Column 3: Batch Announcements & Quick Downloads */}
        <div className="space-y-6">
          <AnnouncementsPanel announcements={announcements} />
          <QuickResourcesPanel resources={resources} />
        </div>
      </div>
    </div>
  );
}
