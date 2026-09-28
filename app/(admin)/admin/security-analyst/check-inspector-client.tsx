'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Database,
  Users,
  Eye,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { SecurityCheckItem } from '@/server/services/security-analyst.service';

export function CheckInspectorClient({
  checks,
  activeTabTitle,
}: {
  checks: SecurityCheckItem[];
  activeTabTitle: string;
}) {
  const [selectedCheck, setSelectedCheck] = useState<SecurityCheckItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checks.map((item) => {
          const isOptimal = item.status === 'OPTIMAL' || item.status === 'HEALTHY';

          return (
            <Card
              key={item.id}
              className="bg-white border border-red-200/80 text-slate-950 hover:border-red-400/80 transition-all duration-200 shadow-[0_4px_20px_rgba(220,38,38,0.03)] rounded-2xl flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                  <div>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] text-red-700 border-red-200 bg-red-50 mb-1"
                    >
                      {item.subsystem}
                    </Badge>
                    <CardTitle className="text-sm font-bold font-sans text-slate-950 line-clamp-1">
                      {item.title}
                    </CardTitle>
                  </div>
                  <Badge
                    className={`font-mono text-[10px] shrink-0 font-bold ${
                      isOptimal
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3 text-xs">
                  {/* Highlighted Value */}
                  <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 font-mono text-red-950 font-bold text-xs">
                    {item.value}
                  </div>

                  <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-2">
                    {item.description}
                  </p>

                  {/* Real Dynamic Metrics Preview (Top 2) */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {item.realMetrics.slice(0, 2).map((m, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[9px] text-slate-500 font-mono block truncate">
                          {m.label}
                        </span>
                        <span className="font-mono font-bold text-slate-950 text-xs block truncate mt-0.5">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>

              {/* Card Footer with Inspect Trigger */}
              <div className="p-4 pt-0 border-t border-red-100 mt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  Probe: {new Date(item.timestamp).toLocaleTimeString()}
                </span>

                <button
                  onClick={() => setSelectedCheck(item)}
                  className="px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-mono text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 font-semibold"
                >
                  <Eye className="w-3 h-3 text-red-600" />
                  <span>Inspect ({item.liveLedger.length})</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 🔍 DEEP DRILL-DOWN LEDGER INSPECTION DIALOG */}
      {selectedCheck && (
        <Dialog open={!!selectedCheck} onOpenChange={(open) => !open && setSelectedCheck(null)}>
          <DialogContent className="max-w-3xl bg-white border border-red-200 text-slate-950 shadow-2xl p-6 font-sans rounded-3xl">
            <DialogHeader className="border-b border-red-100 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <Badge className="bg-red-50 text-red-700 border-red-200 font-mono text-[10px] mb-1">
                      {selectedCheck.subsystem}
                    </Badge>
                    <DialogTitle className="text-lg font-bold font-sans text-slate-950">
                      {selectedCheck.title}
                    </DialogTitle>
                  </div>
                </div>
                <Badge
                  className={`font-mono text-xs font-bold ${
                    selectedCheck.status === 'OPTIMAL' || selectedCheck.status === 'HEALTHY'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }`}
                >
                  {selectedCheck.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-3 text-xs">
              {/* Summary Metrics Matrix */}
              <div>
                <span className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block mb-2 font-bold">
                  📊 Real PostgreSQL Computed Telemetry Matrix
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {selectedCheck.realMetrics.map((metric, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                      <span className="text-[10px] text-slate-500 block">{metric.label}</span>
                      <span className="text-sm font-bold text-red-600 block mt-1">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Records Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-700 uppercase tracking-wider font-bold">
                    📝 Live Database Ledger Entries ({selectedCheck.liveLedger.length} Records)
                  </span>
                  <span className="text-[10px] text-red-600 font-mono font-medium">
                    Direct Query Result
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-red-200 bg-white">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-red-50/80 border-b border-red-200 text-red-950 uppercase text-[10px] font-bold">
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Identity / Actor</th>
                        <th className="p-2.5">Event / Resource</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100 text-[11px]">
                      {selectedCheck.liveLedger.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                            No individual ledger events recorded for this period.
                          </td>
                        </tr>
                      ) : (
                        selectedCheck.liveLedger.map((row, idx) => (
                          <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                            <td className="p-2.5 text-slate-600 whitespace-nowrap">
                              {new Date(row.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold text-red-700 block truncate max-w-[120px]">
                                {row.actor || 'SYSTEM'}
                              </span>
                              {row.tsId && (
                                <span className="text-[10px] text-slate-500 block font-mono">
                                  {row.tsId}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-950 font-bold max-w-[150px] truncate">
                              {row.title}
                            </td>
                            <td className="p-2.5">
                              <Badge
                                className={`text-[9px] font-mono font-bold ${
                                  row.status === 'COMPLETED' || row.status === 'PASSED' || row.status === 'SUCCESS' || row.status === 'HEALTHY' || row.status === 'OPTIMAL' || row.status === 'ISSUED'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                    : row.status === 'IN_PROGRESS' || row.status === 'GUEST_PENDING'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                    : 'bg-red-50 text-red-800 border border-red-300'
                                }`}
                              >
                                {row.status || 'OK'}
                              </Badge>
                            </td>
                            <td className="p-2.5 text-slate-700 max-w-[200px] truncate font-sans">
                              {row.info}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-red-100">
              <button
                onClick={() => setSelectedCheck(null)}
                className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-sans text-xs cursor-pointer active:scale-95 transition-all font-semibold"
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
