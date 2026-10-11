'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  Database,
  Award,
  Eye,
} from 'lucide-react';

export function DBSyncClient({
  students,
  studentsSyncData,
}: {
  students?: any[];
  studentsSyncData?: any[];
}) {
  const dataList = students || studentsSyncData || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'CERTIFICATES' | 'PENDING'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const filteredData = dataList.filter((s) => {
    const q = searchQuery.toLowerCase();
    const name = s.name?.toLowerCase() || '';
    const email = s.email?.toLowerCase() || '';
    const tsId = s.tsIdentity?.tsId?.toLowerCase() || '';
    const certId = s.certificates?.[0]?.certificateId?.toLowerCase() || '';
    const courseTitle = s.enrollments?.[0]?.course?.title?.toLowerCase() || '';

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
      const cert = s.certificates?.[0];
      const course = s.enrollments?.[0]?.course;
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
      <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-900 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search sync records by Name, TS-ID, Email, Course, or Certificate ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Pills & Export */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
              filterTab === 'ALL'
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-white hover:border-violet-300 text-slate-700 border-slate-200'
            }`}
          >
            All ({dataList.length})
          </button>
          <button
            onClick={() => setFilterTab('CERTIFICATES')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
              filterTab === 'CERTIFICATES'
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-white hover:border-violet-300 text-slate-700 border-slate-200'
            }`}
          >
            With Certificates
          </button>
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
              filterTab === 'PENDING'
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-white hover:border-violet-300 text-slate-700 border-slate-200'
            }`}
          >
            Pending
          </button>

          <button
            onClick={exportToCSV}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Master Record Sheet Table */}
      <Card className="bg-white border border-slate-200 text-slate-900 overflow-hidden shadow-xs rounded-xl">
        <CardHeader className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Master Database Record Sheet
              </CardTitle>
              <span className="text-xs text-slate-500">
                Showing {filteredData.length} of {dataList.length} relational student records
              </span>
            </div>
          </div>

          <span className="bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            {filteredData.length} Records Matched
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">TS-ID</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Enrolled Track</th>
                  <th className="p-4">Certificate ID</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      No database sync records found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((s, index) => {
                    const cert = s.certificates?.[0];
                    const course = s.enrollments?.[0]?.course;

                    return (
                      <tr key={s.id} className="hover:bg-violet-50/30 transition-colors">
                        <td className="p-4 text-slate-400 font-medium">#{index + 1}</td>
                        <td className="p-4 font-semibold text-slate-900">{s.name}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded bg-violet-50 text-violet-700 border border-violet-200 font-mono text-[11px] font-bold">
                            {s.tsIdentity?.tsId || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700">{s.email}</td>
                        <td className="p-4 text-slate-600">
                          {s.studentProfile?.phone || 'N/A'}
                        </td>
                        <td className="p-4 font-medium text-slate-800 max-w-[160px] truncate">
                          {course?.title || 'General Cybersecurity'}
                        </td>
                        <td className="p-4">
                          {cert ? (
                            <div className="space-y-0.5">
                              <span className="text-emerald-700 font-semibold block text-[11px]">
                                {cert.certificateId}
                              </span>
                              {cert.externalPdfUrl && (
                                <a
                                  href={cert.externalPdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 font-medium"
                                >
                                  Drive Link <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Pending</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedRecord(s)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3 h-3 text-violet-600" />
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

      {/* Record Inspector Dialog */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
          <DialogContent className="max-w-xl bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="bg-violet-50 text-violet-700 border border-violet-200 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                      {selectedRecord.tsIdentity?.tsId || 'N/A'}
                    </span>
                    <DialogTitle className="text-base font-bold text-slate-900 mt-1">
                      {selectedRecord.name}
                    </DialogTitle>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  Database Synced
                </span>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-slate-500 uppercase text-[10px] font-semibold block">
                  Identity &amp; Contact Credentials
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-900">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email:</span>
                    <strong className="text-slate-900 block truncate">{selectedRecord.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone:</span>
                    <span className="text-slate-800">{selectedRecord.studentProfile?.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Account ID:</span>
                    <span className="text-[11px] text-slate-500 font-mono block truncate">{selectedRecord.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Created At:</span>
                    <span className="text-slate-800">{new Date(selectedRecord.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Course Enrollment Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-500 uppercase text-[10px] font-semibold block">
                  Enrolled Course Track
                </span>
                {selectedRecord.enrollments?.length > 0 ? (
                  selectedRecord.enrollments.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between">
                      <span className="text-slate-900 font-medium">{e.course?.title}</span>
                      <span className="bg-violet-50 text-violet-700 border border-violet-200 text-[10px] px-2 py-0.5 rounded font-semibold">
                        {e.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500">General Cybersecurity Track</span>
                )}
              </div>

              {/* Certificate Verification Info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-500 uppercase text-[10px] font-semibold block">
                  Certificate Verification Status
                </span>
                {selectedRecord.certificates?.length > 0 ? (
                  selectedRecord.certificates.map((c: any) => (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-700 font-semibold">{c.certificateId}</span>
                        <span className="text-[11px] text-slate-500">
                          Issued: {new Date(c.issuedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {c.externalPdfUrl && (
                        <a
                          href={c.externalPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-violet-600 hover:text-violet-700 underline flex items-center gap-1 pt-0.5 font-medium"
                        >
                          View Certificate PDF <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500">No certificate issued yet.</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
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
