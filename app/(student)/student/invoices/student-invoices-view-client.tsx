'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { PrintableTaxInvoice } from '@/components/invoices/PrintableTaxInvoice';

interface StudentInvoicesViewClientProps {
  invoices: any[];
  student: {
    name: string;
    email: string;
    tsId: string;
  };
}

export function StudentInvoicesViewClient({
  invoices,
  student,
}: StudentInvoicesViewClientProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const totalPaid = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

  const totalPending = invoices
    .filter((i) => i.status !== 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-black to-slate-950 border border-purple-500/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-purple-300 uppercase">
              STUDENT FINANCIAL LEDGER &bull; OFFICIAL RECEIPTS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Fee Invoices &amp; Verified PDF Receipts
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Access your official fee statements, tax invoices with GST breakdown, and verified receipts issued by Thread Security Education.
          </p>
        </div>

        {/* Financial Overview Cards */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-right">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Settled Tuition</div>
            <div className="text-lg font-mono font-bold text-emerald-400">
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
          </div>
          {totalPending > 0 && (
            <div className="p-3.5 rounded-2xl bg-black/60 border border-amber-500/30 text-right">
              <div className="text-[10px] text-amber-400 font-mono uppercase">Pending Due</div>
              <div className="text-lg font-mono font-bold text-amber-300">
                ₹{totalPending.toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-white/10 text-slate-400">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No invoices currently recorded.</p>
            <p className="text-xs text-slate-500 mt-1">Your academic invoices will be reflected here upon batch allocation.</p>
          </div>
        ) : (
          invoices.map((inv) => {
            const isPaid = inv.status === 'PAID';
            return (
              <div
                key={inv.id}
                className="p-6 rounded-2xl bg-[#090b10] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        isPaid
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{inv.title}</h3>
                  {inv.description && (
                    <p className="text-xs text-slate-400 max-w-2xl">{inv.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Issued: {new Date(inv.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>&bull;</div>
                    <div>Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Total Payable</div>
                    <div className="text-xl font-mono font-black text-white">
                      ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500">Incl. 18% GST</div>
                  </div>

                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#C6FF34]" />
                    <span>View / Print PDF Receipt</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PRINTABLE OFFICIAL RECEIPT MODAL */}
      {selectedInvoice && (
        <Dialog open={Boolean(selectedInvoice)} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl bg-slate-100 border border-slate-300 text-slate-900 rounded-2xl p-4 sm:p-6 font-sans shadow-2xl max-h-[95vh] overflow-y-auto print:p-0 print:border-none print:shadow-none print:bg-white">
            <PrintableTaxInvoice
              invoice={{
                ...selectedInvoice,
                student: {
                  user: {
                    name: student.name,
                    email: student.email,
                    tsIdentity: { tsId: student.tsId },
                  },
                  batch: selectedInvoice.student?.batch,
                },
              }}
              onClose={() => setSelectedInvoice(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

