'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileSpreadsheet,
  Search,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
  Award,
  Users,
  ShieldCheck,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export function DBSyncClient({ studentsSyncData }: { studentsSyncData: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'CERTIFICATES' | 'PENDING'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const filteredData = studentsSyncData.filter((s) => {
    const q = searchQuery.toLowerCase();
    const name = s.name?.toLowerCase() || '';
    const email = s.email?.toLowerCase() || '';
    const tsId = s.tsIdentity?.tsId?.toLowerCase() || '';
    const certId = s.certificates[0]?.certificateId?.toLowerCase() || '';
    const courseTitle = s.enrollments[0]?.course?.title?.toLowerCase() || '';

    const matchesSearch =
      name.includes(q) ||
      email.includes(q) ||
      tsId.includes(q) ||
      certId.includes(q) ||
      courseTitle.includes(q);

    if (!matchesSearch) return false;

    if (filterTab === 'CERTIFICATES') {
      return s.certificates && s.certificates.length > 0;
    } else if (filterTab === 'PENDING') {
      return !s.certificates || s.certificates.length === 0;
    }

    return true;
  });

  const exportToCSV = () => {
    const headers = [
      'Index',
      'Name',
      'TS-ID',
      'Email',
      'Phone',
      'Enrolled Track',
      'Certificate ID',
      'Certificate Drive Link',
      'Sync Status',
    ];

    const rows = filteredData.map((s, index) => {
      const cert = s.certificates[0];
      const course = s.enrollments[0]?.course;
      return [
        index + 1,
        `"${s.name || ''}"`,
        `"${s.tsIdentity?.tsId || 'N/A'}"`,
        `"${s.email || ''}"`,
        `"${s.studentProfile?.phone || 'N/A'}"`,
        `"${course?.title || 'General Cybersecurity'}"`,
        `"${cert?.certificateId || 'Pending'}"`,
        `"${cert?.externalPdfUrl || ''}"`,
        '"SYNCED"',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TSE_Database_Sync_Export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Search & Export Toolbar */}
      <div className="p-4 rounded-2xl bg-red-950/30 backdrop-blur-xl border border-red-500/20 text-white shadow-[0_4px_25px_rgba(220,38,38,0.05)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search sync records by Name, TS-ID, Email, Course, or Certificate ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-black/50 border border-red-500/30 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Filter Pills & Export */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            All ({studentsSyncData.length})
          </button>
          <button
            onClick={() => setFilterTab('CERTIFICATES')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              filterTab === 'CERTIFICATES'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            With Certificates
          </button>
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              filterTab === 'PENDING'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            Pending
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-1.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Master Record Sheet Table */}
      <Card className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white overflow-hidden shadow-2xl rounded-2xl">
        <CardHeader className="bg-white/5 border-b border-red-500/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-red-400" />
            <div>
              <CardTitle className="text-base font-bold font-sans text-white">
                Master Database Record Sheet
              </CardTitle>
              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredData.length} of {studentsSyncData.length} relational student records
              </span>
            </div>
          </div>

          <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-xs">
            {filteredData.length} RECORDS MATCHED
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-black/60 border-b border-red-500/20 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Sync ID</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Assigned TS-ID</th>
                  <th className="p-4">Institutional Email</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Enrolled Track</th>
                  <th className="p-4">Certificate ID</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-500/10 text-[11px]">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                      No database sync records found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((s, index) => {
                    const cert = s.certificates[0];
                    const course = s.enrollments[0]?.course;

                    return (
                      <tr key={s.id} className="hover:bg-red-950/30 transition-colors">
                        <td className="p-4 text-slate-500">#{index + 1}</td>
                        <td className="p-4 font-bold text-white text-sm font-sans">{s.name}</td>
                        <td className="p-4">
                          <Badge className="bg-red-950/60 text-red-300 border border-red-500/30 font-mono text-[10px]">
                            {s.tsIdentity?.tsId || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-4 text-red-300 font-bold">{s.email}</td>
                        <td className="p-4 text-slate-300">
                          {s.studentProfile?.phone || 'N/A'}
                        </td>
                        <td className="p-4 font-bold text-white max-w-[160px] truncate">
                          {course?.title || 'General Cybersecurity'}
                        </td>
                        <td className="p-4">
                          {cert ? (
                            <div className="space-y-0.5">
                              <span className="text-emerald-400 font-bold block">
                                {cert.certificateId}
                              </span>
                              {cert.externalPdfUrl && (
                                <a
                                  href={cert.externalPdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-red-300 hover:text-white inline-flex items-center gap-0.5 underline"
                                >
                                  Drive Link <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500">Pending</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedRecord(s)}
                            className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <Eye className="w-3 h-3 text-red-400" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 🔍 DETAILED RECORD INSPECTOR DIALOG */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <DialogContent className="max-w-xl bg-[#0d0306] border border-red-500/30 text-white rounded-3xl p-6 font-sans">
            <DialogHeader className="border-b border-red-500/20 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <Badge className="bg-red-950 text-red-300 border border-red-500/30 font-mono text-[10px] mb-0.5">
                      {selectedRecord.tsIdentity?.tsId || 'N/A'}
                    </Badge>
                    <DialogTitle className="text-lg font-bold font-mono text-white">
                      {selectedRecord.name}
                    </DialogTitle>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs">
                  DATABASE SYNCED
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-black/50 border border-red-500/20 space-y-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Identity & Contact Credentials
                </span>
                <div className="grid grid-cols-2 gap-2 text-white">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Email:</span>
                    <strong className="text-red-300 block truncate">{selectedRecord.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Phone:</span>
                    <span>{selectedRecord.studentProfile?.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Account ID:</span>
                    <span className="text-[10px] text-slate-300 block truncate">{selectedRecord.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Created At:</span>
                    <span>{new Date(selectedRecord.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Course Enrollment Info */}
              <div className="p-3 rounded-2xl bg-black/50 border border-red-500/20 space-y-1.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Enrolled Course Track
                </span>
                {selectedRecord.enrollments?.length > 0 ? (
                  selectedRecord.enrollments.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between">
                      <span className="text-white font-bold">{e.course?.title}</span>
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[9px]">
                        {e.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500">General Cybersecurity Track</span>
                )}
              </div>

              {/* Certificate Verification Info */}
              <div className="p-3 rounded-2xl bg-black/50 border border-red-500/20 space-y-1.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Certificate Verification Status
                </span>
                {selectedRecord.certificates?.length > 0 ? (
                  selectedRecord.certificates.map((c: any) => (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">{c.certificateId}</span>
                        <span className="text-[10px] text-slate-400">
                          Issued: {new Date(c.issuedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {c.externalPdfUrl && (
                        <a
                          href={c.externalPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-red-300 hover:text-white underline flex items-center gap-1 pt-0.5"
                        >
                          View Drive Certificate PDF <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500">No certificate issued yet.</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-red-500/20">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
