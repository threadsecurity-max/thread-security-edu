import Link from 'next/link';
import { prisma } from '@/server/database/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Phone, FileText, CheckCircle } from 'lucide-react';

export const revalidate = 0;

export default async function MentorStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } },
              { tsIdentity: { tsId: { contains: query } } },
            ],
          }
        : {}),
    },
    include: {
      tsIdentity: true,
      studentProfile: true,
      enrollments: { include: { course: true } },
      certificates: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px] mb-2">
            ACADEMIC MENTORSHIP
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-mono flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#C6FF34]" />
            Assigned Mentees Roster ({students.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-mono">
            Monitor student progression, inspect TS-IDs, and view academic performance transcripts.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-lg">
        <form method="GET" className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <Input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search assigned mentees by name, email, or TS-ID (e.g. TS-DUMMY or TS-C126)..."
              className="pl-10 font-mono text-xs bg-[#141414] border-white/20 text-white placeholder:text-slate-500 focus:border-[#C6FF34]"
            />
          </div>
          <Button type="submit" className="bg-white hover:bg-slate-200 text-black font-mono font-bold text-xs shadow-md">
            Filter Mentees
          </Button>
        </form>
      </div>

      {/* Mentees Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-slate-300">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">TS-ID</th>
                <th className="p-4">Email & Phone</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Certificates</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-transparent">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No mentees found matching your search query.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const course = s.enrollments[0]?.course;

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4 font-bold text-white text-sm">{s.name}</td>
                      <td className="p-4">
                        <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[11px]">
                          {s.tsIdentity?.tsId || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="block text-slate-200 font-bold">{s.email}</span>
                        <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#C6FF34]" />
                          {(s.studentProfile as any)?.phone || '+91 98765-XXXXX'}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-300">
                        {course?.title || 'General Cybersecurity'}
                      </td>
                      <td className="p-4">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-[#C6FF34]" />
                          {s.certificates.length} Issued
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href="/student/report">
                          <Button variant="outline" size="sm" className="text-xs gap-1 border-white/20 text-slate-200 hover:text-white hover:border-[#C6FF34] bg-white/5 font-mono">
                            <FileText className="w-3.5 h-3.5 text-[#C6FF34]" />
                            Academic Report
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
