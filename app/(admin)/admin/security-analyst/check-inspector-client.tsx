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
              className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 text-white hover:border-red-500/50 transition-all duration-200 shadow-[0_4px_25px_rgba(220,38,38,0.05)] rounded-2xl flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                  <div>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] text-red-300 border-red-500/40 bg-red-950/40 mb-1"
                    >
                      {item.subsystem}
                    </Badge>
                    <CardTitle className="text-sm font-bold font-sans text-white line-clamp-1">
                      {item.title}
                    </CardTitle>
                  </div>
                  <Badge
                    className={`font-mono text-[10px] shrink-0 ${
                      isOptimal
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3 text-xs">
                  {/* Highlighted Value */}
                  <div className="p-2.5 rounded-xl bg-black/50 border border-red-500/20 font-mono text-red-300 font-bold text-xs">
                    {item.value}
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px] line-clamp-2">
                    {item.description}
                  </p>

                  {/* Real Dynamic Metrics Preview (Top 2) */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {item.realMetrics.slice(0, 2).map((m, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[9px] text-slate-400 font-mono block truncate">
                          {m.label}
                        </span>
                        <span className="font-mono font-bold text-white text-xs block truncate mt-0.5">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>

              {/* Card Footer with Inspect Trigger */}
              <div className="p-4 pt-0 border-t border-red-500/10 mt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  Probe: {new Date(item.timestamp).toLocaleTimeString()}
                </span>

                <button
                  onClick={() => setSelectedCheck(item)}
                  className="px-3 py-1 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-mono text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Eye className="w-3 h-3 text-red-400" />
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
          <DialogContent className="max-w-3xl bg-[#0d0306] border border-red-500/30 text-white shadow-2xl p-6 font-sans rounded-3xl">
            <DialogHeader className="border-b border-red-500/20 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <Badge className="bg-red-950 text-red-300 border-red-500/40 font-mono text-[10px] mb-1">
                      {selectedCheck.subsystem}
                    </Badge>
                    <DialogTitle className="text-lg font-bold font-mono text-white">
                      {selectedCheck.title}
                    </DialogTitle>
                  </div>
                </div>
                <Badge
                  className={`font-mono text-xs ${
                    selectedCheck.status === 'OPTIMAL' || selectedCheck.status === 'HEALTHY'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {selectedCheck.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-3 text-xs">
              {/* Summary Metrics Matrix */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-bold">
                  📊 Real PostgreSQL Computed Telemetry Matrix
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {selectedCheck.realMetrics.map((metric, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono">
                      <span className="text-[10px] text-slate-400 block">{metric.label}</span>
                      <span className="text-sm font-bold text-red-300 block mt-1">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Records Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    📝 Live Database Ledger Entries ({selectedCheck.liveLedger.length} Records)
                  </span>
                  <span className="text-[10px] text-red-400 font-mono">
                    Direct Query Result
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-red-500/20 bg-black/40">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-white/5 border-b border-red-500/20 text-slate-400 uppercase text-[10px]">
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Identity / Actor</th>
                        <th className="p-2.5">Event / Resource</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-500/10 text-[11px]">
                      {selectedCheck.liveLedger.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                            No individual ledger events recorded for this period.
                          </td>
                        </tr>
                      ) : (
                        selectedCheck.liveLedger.map((row, idx) => (
                          <tr key={idx} className="hover:bg-red-950/30 transition-colors">
                            <td className="p-2.5 text-slate-400 whitespace-nowrap">
                              {new Date(row.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold text-red-300 block truncate max-w-[120px]">
                                {row.actor || 'SYSTEM'}
                              </span>
                              {row.tsId && (
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {row.tsId}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 text-white font-bold max-w-[150px] truncate">
                              {row.title}
                            </td>
                            <td className="p-2.5">
                              <Badge
                                className={`text-[9px] font-mono ${
                                  row.status === 'COMPLETED' || row.status === 'PASSED' || row.status === 'SUCCESS' || row.status === 'HEALTHY' || row.status === 'OPTIMAL' || row.status === 'ISSUED'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : row.status === 'IN_PROGRESS' || row.status === 'GUEST_PENDING'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                                }`}
                              >
                                {row.status || 'OK'}
                              </Badge>
                            </td>
                            <td className="p-2.5 text-slate-300 max-w-[200px] truncate font-sans">
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

            <div className="flex justify-end pt-3 border-t border-red-500/20">
              <button
                onClick={() => setSelectedCheck(null)}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer active:scale-95 transition-all"
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
