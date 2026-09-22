import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Clock, Layers, ArrowRight } from 'lucide-react';
import { logAuditEvent } from '@/server/security/audit';

import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function AdminCourseBuilderPage() {
  const session = await getSession();
  if (session?.role === 'SECURITY_ADMIN') {
    redirect('/admin/security-analyst?notice=unauthorized-academic-module');
  }

  const courses = await prisma.course.findMany({
    include: {
      mentor: { include: { user: true } },
      modules: true,
      labs: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Server Action to create course
  async function createCourseAction(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const category = formData.get('category') as string;
    const durationHours = parseFloat(formData.get('durationHours') as string || '20');

    if (!title || !subtitle || !category) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const course = await prisma.course.create({
      data: {
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        title,
        subtitle,
        description: subtitle,
        category,
        level: 'INTERMEDIATE',
        durationHours,
        status: 'PUBLISHED',
      },
    });

    await logAuditEvent({
      action: 'COURSE_CREATED',
      entity: 'COURSE',
      entityId: course.id,
      details: { title, slug: course.slug },
    });

    revalidatePath('/admin/courses');
    revalidatePath('/workshops');
    revalidatePath('/');
  }

  return (
    <div className="space-y-8 text-slate-100 font-sans relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Course Management &amp; Builder
          </h1>
          <p className="text-xs text-red-200/70 font-mono mt-1">
            Create new cybersecurity programs, define module structures, assign mentors, and publish courses.
          </p>
        </div>
      </div>

      {/* New Course Form - Simple Translucent Dark Glass Container */}
      <div className="p-6 rounded-3xl bg-[#120408]/90 border border-red-500/20 backdrop-blur-xl shadow-xl space-y-4 font-mono text-xs">
        <h3 className="text-base font-bold text-white tracking-tight">Create New Cybersecurity Course</h3>
        
        <form action={createCourseAction} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1.5 font-bold">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Advanced Network Penetration Testing"
              className="w-full bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1.5 font-bold">
              Category *
            </label>
            <select
              name="category"
              className="w-full bg-[#1a060d] border border-red-500/30 text-white text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono"
            >
              <option value="VAPT">VAPT &amp; Web Security</option>
              <option value="Cloud Security">Cloud Security</option>
              <option value="SOC &amp; Blue Team">SOC &amp; Blue Team</option>
              <option value="DevSecOps">DevSecOps</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1.5 font-bold">
              Duration (Hours) *
            </label>
            <input
              type="number"
              name="durationHours"
              defaultValue="24"
              className="w-full bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
              required
            />
          </div>

          <div className="sm:col-span-12">
            <label className="block text-[11px] font-mono text-red-300/80 uppercase tracking-wider mb-1.5 font-bold">
              Subtitle / Overview *
            </label>
            <input
              type="text"
              name="subtitle"
              placeholder="Short description of outcomes and target skills..."
              className="w-full bg-red-950/30 border border-red-500/30 text-white placeholder:text-slate-500 text-xs rounded-2xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
              required
            />
          </div>

          <div className="sm:col-span-12 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs shadow-[0_4px_20px_rgba(220,38,38,0.4)] border border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Course To Catalogue</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Courses List */}
      <div className="space-y-4 font-mono text-xs">
        <h3 className="text-base font-bold text-white tracking-tight">
          Existing Course Catalogue ({courses.length})
        </h3>
        
        <div className="overflow-hidden rounded-3xl bg-[#120408]/90 border border-red-500/20 backdrop-blur-xl shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1e070e] text-red-200 border-b border-red-500/20">
              <tr>
                <th className="p-4">Course Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Level</th>
                <th className="p-4">Modules</th>
                <th className="p-4">Labs</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/10 text-slate-200">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-red-950/30 transition-colors">
                  <td className="p-4 font-bold text-white text-sm">{c.title}</td>
                  <td className="p-4 text-slate-300">{c.category}</td>
                  <td className="p-4 text-slate-300">{c.level}</td>
                  <td className="p-4 text-slate-300">{c.modules.length} Modules</td>
                  <td className="p-4 text-slate-300">{c.labs.length} Labs</td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 text-[10px] font-bold">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
