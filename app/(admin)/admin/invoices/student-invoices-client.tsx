'use client';

import React, { useState, useTransition } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  FileText,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Mail,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createStudentInvoiceAction,
  markInvoicePaidAction,
} from '@/features/invoices/actions/invoice.actions';
import { PrintableTaxInvoice } from '@/components/invoices/PrintableTaxInvoice';

interface StudentRosterItem {
  id: string; // studentProfile id
  user: {
    id: string;
    name: string | null;
    email: string;
    tsIdentity?: { tsId: string } | null;
  };
  batch?: {
    batchCode: string;
    title: string;
  } | null;
}

interface StudentInvoicesClientProps {
  initialInvoices: any[];
  studentsRoster: StudentRosterItem[];
  currentUser: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function StudentInvoicesClient({
  initialInvoices,
  studentsRoster,
  currentUser,
}: StudentInvoicesClientProps) {
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoiceForPdf, setSelectedInvoiceForPdf] = useState<any | null>(null);

  // Create Form State
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState(
    studentsRoster[0]?.id || ''
  );
  const [invoiceTitle, setInvoiceTitle] = useState('45 Days Summer Industrial Training Fee');
  const [invoiceDesc, setInvoiceDesc] = useState('Institutional tuition fee, cloud cyber sandbox provisioning, and TS-ID verification.');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('Payment payable via UPI, NetBanking, or institutional DD. Quote TS-ID on transaction memo.');

  const [items, setItems] = useState([
    { description: 'Hands-on Cloud Cyber Range Lab Access', qty: 1, rate: 12000, amount: 12000 },
    { description: '1-on-1 Faculty Mentor-Led Offensive & Defensive Masterclass', qty: 1, rate: 8000, amount: 8000 },
  ]);

  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const taxAmount = (subtotal * 18) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: 'TS-ID Cryptographic Credential Registry', qty: 1, rate: 2500, amount: 2500 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'qty' || field === 'rate') {
      const q = field === 'qty' ? Number(value) || 0 : Number(item.qty) || 0;
      const r = field === 'rate' ? Number(value) || 0 : Number(item.rate) || 0;
      item.amount = q * r;
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentProfileId || items.length === 0) return;

    startTransition(async () => {
      const res = await createStudentInvoiceAction({
        studentProfileId: selectedStudentProfileId,
        title: invoiceTitle,
        description: invoiceDesc,
        items,
        subtotal,
        taxRatePercent: 18.0,
        dueDate,
        notes,
      });

      if (res.success && res.data) {
        setInvoices([res.data, ...invoices]);
        setIsCreateOpen(false);
        setNotice(`Official invoice ${res.data.invoiceNumber} generated and saved to student portal.`);
        setTimeout(() => setNotice(null), 5000);
      } else {
        alert(res.error || 'Failed to create invoice');
      }
    });
  };

  const handleMarkPaid = (invId: string) => {
    startTransition(async () => {
      const res = await markInvoicePaidAction(invId);
      if (res.success) {
        setInvoices(
          invoices.map((inv) =>
            inv.id === invId ? { ...inv, status: 'PAID', paidAt: new Date().toISOString() } : inv
          )
        );
        setNotice('Invoice marked as PAID and digital receipt updated.');
        setTimeout(() => setNotice(null), 4000);
      }
    });
  };

  const filteredInvoices = invoices.filter((inv) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(s) ||
      inv.student?.user?.name?.toLowerCase().includes(s) ||
      inv.student?.user?.email?.toLowerCase().includes(s) ||
      inv.student?.user?.tsIdentity?.tsId?.toLowerCase().includes(s) ||
      inv.title.toLowerCase().includes(s);

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Toast Notice */}
      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-500 hover:text-emerald-700">
            &times;
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-violet-600 uppercase">
              STUDENT ACCOUNTS &amp; FEE CONDUCTION
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Invoices &amp; Official PDF Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Generate itemized tax invoices, dispatch verified payment receipts, and maintain permanent fee records in student dashboards.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Student Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number, student name, TS-ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Invoices</option>
            <option value="PAID">Paid</option>
            <option value="SENT">Sent / Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Student &amp; TS-ID</th>
                <th className="p-4">Program / Batch</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">PDF &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No student invoices match the current query.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'PAID';
                  return (
                    <tr key={inv.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{inv.student?.user?.name || 'Student'}</div>
                        <div className="text-[11px] text-slate-500">{inv.student?.user?.email}</div>
                        <div className="text-[10px] font-mono text-violet-700 font-bold">
                          {inv.student?.user?.tsIdentity?.tsId || 'TS-ID Pending'}
                        </div>
                      </td>

                      <td className="p-4 max-w-[220px]">
                        <div className="font-medium text-slate-800 truncate">{inv.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {inv.student?.batch?.batchCode || 'Individual Cohort'}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-900">
                        ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 text-slate-500">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedInvoiceForPdf(inv)}
                          className="px-2.5 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-[11px] border border-violet-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF / Print</span>
                        </button>

                        {!isPaid && (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 font-sans text-xs max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-violet-600" />
              <span>Issue Official Student Fee Invoice</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Select Enrolled Student *</label>
              <select
                required
                value={selectedStudentProfileId}
                onChange={(e) => setSelectedStudentProfileId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-violet-500"
              >
                {studentsRoster.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user.name || 'Student'} ({s.user.email}) - {s.user.tsIdentity?.tsId || 'No TS-ID'} [
                    {s.batch?.batchCode || 'Open Cohort'}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Invoice Title *</label>
                <input
                  type="text"
                  required
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  placeholder="e.g. 45 Days Industrial Training Fee"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Line Items Builder */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Fee Itemization Breakdown</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-violet-600 hover:text-violet-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 text-center"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Rate (₹)"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 text-right font-mono"
                    />
                    <span className="w-24 text-right font-mono font-bold text-slate-800 text-xs">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Calculation Summary */}
              <div className="p-3 bg-violet-50/60 rounded-xl border border-violet-100 space-y-1 text-right text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18% Applicable Education &amp; Cloud Labs):</span>
                  <span className="font-mono font-bold">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-violet-200 pt-1 text-sm">
                  <span>Total Payable:</span>
                  <span className="font-mono text-violet-800 font-black">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Payment Memo &amp; Instructions</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-md"
              >
                {isPending ? 'Issuing Invoice...' : 'Dispatch Invoice to Student'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* OFFICIAL PDF INVOICE / RECEIPT VIEWER & PRINTER */}
      {selectedInvoiceForPdf && (
        <Dialog open={Boolean(selectedInvoiceForPdf)} onOpenChange={() => setSelectedInvoiceForPdf(null)}>
          <DialogContent className="max-w-4xl bg-slate-100 border border-slate-300 text-slate-900 rounded-2xl p-4 sm:p-6 font-sans shadow-2xl max-h-[95vh] overflow-y-auto print:p-0 print:border-none print:shadow-none print:bg-white">
            <PrintableTaxInvoice
              invoice={selectedInvoiceForPdf}
              onClose={() => setSelectedInvoiceForPdf(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

