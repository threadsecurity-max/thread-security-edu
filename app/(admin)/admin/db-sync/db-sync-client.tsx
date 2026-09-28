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
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Search & Export Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-red-200/80 text-slate-950 shadow-[0_4px_20px_rgba(220,38,38,0.04)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search sync records by Name, TS-ID, Email, Course, or Certificate ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-red-200 text-xs text-slate-950 font-mono placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:bg-white"
          />
        </div>

        {/* Filter Pills & Export */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer border ${
              filterTab === 'ALL'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_2px_10px_rgba(220,38,38,0.25)] border-red-500'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            All ({studentsSyncData.length})
          </button>
          <button
            onClick={() => setFilterTab('CERTIFICATES')}
            className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer border ${
              filterTab === 'CERTIFICATES'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_2px_10px_rgba(220,38,38,0.25)] border-red-500'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            With Certificates
          </button>
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer border ${
              filterTab === 'PENDING'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_2px_10px_rgba(220,38,38,0.25)] border-red-500'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            Pending
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Master Record Sheet Table */}
      <Card className="bg-white border border-red-200/80 text-slate-950 overflow-hidden shadow-[0_4px_20px_rgba(220,38,38,0.03)] rounded-3xl">
        <CardHeader className="bg-red-50/70 border-b border-red-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-red-600" />
            <div>
              <CardTitle className="text-base font-bold font-sans text-slate-950">
                Master Database Record Sheet
              </CardTitle>
              <span className="text-xs text-slate-600 font-mono">
                Showing {filteredData.length} of {studentsSyncData.length} relational student records
              </span>
            </div>
          </div>

          <Badge className="bg-red-50 text-red-700 border border-red-200 font-mono text-xs font-bold">
            {filteredData.length} RECORDS MATCHED
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-red-50/40 border-b border-red-200/80 text-red-950 uppercase tracking-wider text-[11px]">
                  <th className="p-4 font-bold">Sync ID</th>
                  <th className="p-4 font-bold">Student Name</th>
                  <th className="p-4 font-bold">Assigned TS-ID</th>
                  <th className="p-4 font-bold">Institutional Email</th>
                  <th className="p-4 font-bold">Contact Phone</th>
                  <th className="p-4 font-bold">Enrolled Track</th>
                  <th className="p-4 font-bold">Certificate ID</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100/80 text-[11px] text-slate-800">
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
                      <tr key={s.id} className="hover:bg-red-50/40 transition-colors">
                        <td className="p-4 text-slate-500 font-bold">#{index + 1}</td>
                        <td className="p-4 font-bold text-slate-950 text-sm font-sans">{s.name}</td>
                        <td className="p-4">
                          <Badge className="bg-red-50 text-red-700 border border-red-200 font-mono text-[10px] font-bold">
                            {s.tsIdentity?.tsId || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-4 text-red-700 font-bold">{s.email}</td>
                        <td className="p-4 text-slate-600">
                          {s.studentProfile?.phone || 'N/A'}
                        </td>
                        <td className="p-4 font-bold text-slate-950 max-w-[160px] truncate">
                          {course?.title || 'General Cybersecurity'}
                        </td>
                        <td className="p-4">
                          {cert ? (
                            <div className="space-y-0.5">
                              <span className="text-emerald-700 font-bold block">
                                {cert.certificateId}
                              </span>
                              {cert.externalPdfUrl && (
                                <a
                                  href={cert.externalPdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-red-600 hover:text-red-800 inline-flex items-center gap-0.5 underline font-bold"
                                >
                                  Drive Link <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedRecord(s)}
                            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <Eye className="w-3 h-3 text-red-600" />
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
          <DialogContent className="max-w-xl bg-white border border-red-200 text-slate-950 shadow-2xl rounded-3xl p-6 font-sans">
            <DialogHeader className="border-b border-red-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <Badge className="bg-red-50 text-red-700 border border-red-200 font-mono text-[10px] mb-0.5 font-bold">
                      {selectedRecord.tsIdentity?.tsId || 'N/A'}
                    </Badge>
                    <DialogTitle className="text-lg font-bold font-mono text-slate-950">
                      {selectedRecord.name}
                    </DialogTitle>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold">
                  DATABASE SYNCED
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200/80 space-y-2">
                <span className="text-slate-600 uppercase text-[10px] font-bold block">
                  Identity & Contact Credentials
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-900">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Email:</span>
                    <strong className="text-red-700 block truncate">{selectedRecord.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Phone:</span>
                    <span className="text-slate-800">{selectedRecord.studentProfile?.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Account ID:</span>
                    <span className="text-[10px] text-slate-600 block truncate">{selectedRecord.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Created At:</span>
                    <span className="text-slate-800">{new Date(selectedRecord.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Course Enrollment Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-600 uppercase text-[10px] font-bold block">
                  Enrolled Course Track
                </span>
                {selectedRecord.enrollments?.length > 0 ? (
                  selectedRecord.enrollments.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between">
                      <span className="text-slate-950 font-bold">{e.course?.title}</span>
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-[9px] font-bold">
                        {e.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500">General Cybersecurity Track</span>
                )}
              </div>

              {/* Certificate Verification Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-600 uppercase text-[10px] font-bold block">
                  Certificate Verification Status
                </span>
                {selectedRecord.certificates?.length > 0 ? (
                  selectedRecord.certificates.map((c: any) => (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-700 font-bold">{c.certificateId}</span>
                        <span className="text-[10px] text-slate-500">
                          Issued: {new Date(c.issuedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {c.externalPdfUrl && (
                        <a
                          href={c.externalPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-red-600 hover:text-red-800 underline flex items-center gap-1 pt-0.5 font-bold"
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

            <div className="flex justify-end pt-2 border-t border-red-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs cursor-pointer font-bold"
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
