'use client';

import React from 'react';
import { Printer, Download, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
  sacCode?: string;
}

export interface PrintableInvoiceData {
  id: string;
  invoiceNumber: string;
  title: string;
  description?: string | null;
  createdAt: string | Date;
  dueDate: string | Date;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string | null;
  items: InvoiceItem[];
  student?: {
    admissionId?: string | null;
    user: {
      name: string | null;
      email: string;
      tsIdentity?: { tsId: string } | null;
    };
    batch?: {
      batchCode: string;
      title: string;
    } | null;
  } | null;
}

// Convert amount in numbers to formal Indian Rupees in words
export function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 10) return singleDigits[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + singleDigits[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) res += singleDigits[hundred] + ' Hundred';
    if (rest > 0) res += (res ? ' and ' : '') + convertTwoDigits(rest);
    return res;
  }

  const crores = Math.floor(rounded / 10000000);
  const lakhs = Math.floor((rounded % 10000000) / 100000);
  const thousands = Math.floor((rounded % 100000) / 1000);
  const hundreds = rounded % 1000;

  let words = '';
  if (crores > 0) words += convertTwoDigits(crores) + ' Crore ';
  if (lakhs > 0) words += convertTwoDigits(lakhs) + ' Lakh ';
  if (thousands > 0) words += convertTwoDigits(thousands) + ' Thousand ';
  if (hundreds > 0) words += convertThreeDigits(hundreds);

  return 'INR ' + words.trim() + ' Only';
}

export function PrintableTaxInvoice({
  invoice,
  onClose,
}: {
  invoice: PrintableInvoiceData;
  onClose?: () => void;
}) {
  const studentUser = invoice.student?.user;
  const tsId = studentUser?.tsIdentity?.tsId || 'TS-REG-VERIFIED';
  const admissionId = invoice.student?.admissionId || `ADM-2026-${invoice.id.slice(-4).toUpperCase()}`;

  // GST calculations
  const taxable = Number(invoice.subtotal) || 0;
  const cgst = taxable * 0.09;
  const sgst = taxable * 0.09;
  const grandTotal = Number(invoice.totalAmount) || (taxable + cgst + sgst);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-tax-invoice-wrapper">
      {/* Action Toolbar (Hidden during print) */}
      <div className="no-print mb-4 flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-mono font-bold tracking-wide">
            OFFICIAL TAX INVOICE &bull; ACCREDITED RECEIPT
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print / Save as PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Actual A4 Printable Sheet */}
      <div
        id="tse-tax-invoice-sheet"
        className="bg-white text-black p-8 sm:p-10 border border-slate-300 rounded-lg shadow-sm font-sans mx-auto max-w-[820px] print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none text-[11px] leading-normal"
        style={{ color: '#111827', backgroundColor: '#ffffff' }}
      >
        {/* Institutional Header with Logo & Formal Details */}
        <div className="border-b-2 border-slate-950 pb-5 mb-5 flex justify-between items-start">
          <div className="space-y-1 max-w-[480px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-950 text-white font-black font-mono text-sm flex items-center justify-center shrink-0 border border-slate-700">
                TSE
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                  THREAD SECURITY EDUCATION
                </h1>
                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mt-0.5">
                  Center of Excellence in Cybersecurity &amp; Advanced Computing &bull; ISO 9001:2015
                </p>
              </div>
            </div>

            <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
              <strong>Campus:</strong> 3rd Floor, Vasal Mall, Opposite Hotel President, Police Line, Jalandhar, Punjab 144001
              <br />
              <strong>GSTIN:</strong> 03AAACT7829Q1Z8 &nbsp;|&nbsp; <strong>PAN:</strong> AAACT7829Q &nbsp;|&nbsp; <strong>SAC:</strong> 999293
              <br />
              <strong>Helpline:</strong> +91 73473 98956 &nbsp;|&nbsp; <strong>Email:</strong> billing@threadsecurity.in &nbsp;|&nbsp; <strong>Web:</strong> www.threadsecurity.in
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-block px-3 py-1 bg-slate-950 text-white font-bold font-mono text-[11px] uppercase tracking-wider rounded">
              TAX INVOICE
            </div>
            <div className="text-[11px] font-mono font-bold text-violet-900 mt-2">
              Invoice No: {invoice.invoiceNumber}
            </div>
            <div className="text-[10px] text-slate-600">
              Date: <strong>{new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
            <div className="text-[10px] text-slate-600">
              Due Date: <strong>{new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
            <div className="text-[10px] text-slate-600">
              Place of Supply: <strong>Punjab (State Code: 03)</strong>
            </div>
            <div className="mt-1">
              <span
                className={`inline-block px-2.5 py-0.5 rounded font-mono font-bold text-[10px] uppercase border ${
                  invoice.status === 'PAID'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                    : 'bg-amber-50 text-amber-800 border-amber-400'
                }`}
              >
                PAYMENT STATUS: {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Student & Course Details (Clean Bordered Table Grid) */}
        <div className="grid grid-cols-2 border border-slate-300 rounded mb-5 overflow-hidden">
          <div className="p-3 border-r border-slate-300 bg-slate-50/50 space-y-1">
            <div className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider">
              STUDENT (BILLED TO)
            </div>
            <div className="text-sm font-bold text-slate-950">
              {studentUser?.name || 'Enrolled Student Candidate'}
            </div>
            <div className="text-[10px] text-slate-700">Email: {studentUser?.email}</div>
            <div className="text-[10px] font-mono text-violet-900 font-semibold">
              TS-ID: {tsId}
            </div>
            <div className="text-[10px] font-mono text-slate-700">
              Admission ID: {admissionId}
            </div>
          </div>

          <div className="p-3 bg-slate-50/50 space-y-1">
            <div className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider">
              ACADEMIC TRAJECTORY ALLOCATION
            </div>
            <div className="text-xs font-bold text-slate-950">
              {invoice.title}
            </div>
            {invoice.description && (
              <div className="text-[10px] text-slate-600 line-clamp-2">
                {invoice.description}
              </div>
            )}
            <div className="text-[10px] font-mono text-slate-700 mt-1">
              Batch: <strong>{invoice.student?.batch?.batchCode || 'Individual Industry Track'}</strong>
            </div>
            <div className="text-[10px] text-slate-600">
              Course: {invoice.student?.batch?.title || 'Advanced Offensive & Defensive Cybersecurity'}
            </div>
          </div>
        </div>

        {/* Itemized Particulars Table with Explicit Borders */}
        <div className="mb-5 border border-slate-400 rounded overflow-hidden">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-400 font-bold uppercase tracking-wider">
                <th className="p-2.5 border-r border-slate-300 w-10 text-center">#</th>
                <th className="p-2.5 border-r border-slate-300">Description of Academic Curriculum / Lab Access</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-20">SAC / HSN</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-14">Qty</th>
                <th className="p-2.5 border-r border-slate-300 text-right w-24">Rate (INR)</th>
                <th className="p-2.5 text-right w-28">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono text-slate-600">{idx + 1}</td>
                    <td className="p-2.5 border-r border-slate-300 font-medium text-slate-950">{item.description}</td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono text-slate-600">999293</td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono">{item.qty || 1}</td>
                    <td className="p-2.5 border-r border-slate-300 text-right font-mono">₹{Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2.5 text-right font-mono font-semibold text-slate-950">₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2.5 border-r border-slate-300 text-center font-mono">1</td>
                  <td className="p-2.5 border-r border-slate-300 font-medium">{invoice.title}</td>
                  <td className="p-2.5 border-r border-slate-300 text-center font-mono">999293</td>
                  <td className="p-2.5 border-r border-slate-300 text-center font-mono">1</td>
                  <td className="p-2.5 border-r border-slate-300 text-right font-mono">₹{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-2.5 text-right font-mono font-semibold">₹{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation & Tax Breakdown Summary */}
        <div className="grid grid-cols-2 gap-4 mb-5 items-start">
          {/* Bank & Remittance Information */}
          <div className="border border-slate-300 rounded p-3 bg-slate-50/40 space-y-1.5">
            <div className="text-[9px] font-bold font-mono text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-700" />
              <span>OFFICIAL BANK DETAILS FOR NEFT/RTGS/IMPS</span>
            </div>
            <div className="text-[10px] text-slate-700 leading-snug space-y-0.5">
              <div>Bank Name: <strong>HDFC Bank Limited</strong></div>
              <div>Account Name: <strong>THREAD SECURITY EDUCATION</strong></div>
              <div>Account No: <strong>50200084920194</strong></div>
              <div>IFSC Code: <strong>HDFC0001309</strong> (Branch: Model Town Jalandhar)</div>
              <div>UPI VPA: <strong>threadsecurity@hdfcbank</strong></div>
            </div>
            <div className="pt-1 border-t border-slate-200 text-[9px] text-slate-500">
              * Please mention TS-ID <strong>{tsId}</strong> in transaction narration/remarks.
            </div>
          </div>

          {/* Tax Breakdown Summary Box */}
          <div className="border border-slate-400 rounded overflow-hidden">
            <table className="w-full text-[10px] border-collapse">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="p-2 text-slate-600">Taxable Subtotal (INR):</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">
                    ₹{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 text-slate-600">Central GST (CGST @ 9%):</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">
                    ₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 text-slate-600">State GST (SGST @ 9%):</td>
                  <td className="p-2 text-right font-mono font-bold text-slate-900">
                    ₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-slate-100 border-t-2 border-slate-950">
                  <td className="p-2.5 font-black text-slate-950 text-xs">Total Amount Payable:</td>
                  <td className="p-2.5 text-right font-mono font-black text-violet-950 text-xs">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Amount in words */}
        <div className="p-2.5 mb-5 rounded bg-slate-50 border border-slate-300 text-[10px]">
          <span className="font-bold text-slate-700">Amount Chargeable (in words): </span>
          <span className="font-mono font-bold text-violet-950">{numberToWordsINR(grandTotal)}</span>
        </div>

        {/* Terms, Conditions & Verified Signature */}
        <div className="grid grid-cols-2 gap-6 pt-3 border-t-2 border-slate-950 items-end">
          <div className="text-[9px] text-slate-600 space-y-1">
            <div className="font-bold uppercase text-slate-800">Terms &amp; Official Declarations:</div>
            <ol className="list-decimal pl-3 space-y-0.5">
              <li>Fees once settled are non-refundable and subject to academic cohort allocation rules.</li>
              <li>This document is a certified digital tax invoice issued under the IT Act 2000.</li>
              <li>For any sponsorship verification or employer reimbursement, quote the candidate&apos;s TS-ID.</li>
            </ol>
            {invoice.notes && (
              <div className="mt-1 pt-1 border-t border-slate-200 italic text-slate-500">
                Remark: {invoice.notes}
              </div>
            )}
          </div>

          <div className="text-right space-y-1">
            <div className="inline-block text-center border-t border-slate-400 pt-1 px-8">
              <div className="w-16 h-16 mx-auto mb-1 rounded-full border border-dashed border-violet-400 flex items-center justify-center text-[8px] font-mono font-bold text-violet-800 bg-violet-50/50">
                OFFICIAL SEAL
              </div>
              <div className="font-bold text-[10px] text-slate-950 uppercase tracking-tight">
                Thread Security Education
              </div>
              <div className="text-[9px] text-slate-600 font-medium">
                Office of Academic Finance &amp; Registrar
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Print Stylesheet for flawless A4 single-page PDF output */}
      <style jsx global>{`
        @media print {
          /* Hide all surrounding interface elements */
          body * {
            visibility: hidden;
          }
          .printable-tax-invoice-wrapper,
          .printable-tax-invoice-wrapper * {
            visibility: visible;
          }
          .no-print {
            display: none !important;
          }
          .printable-tax-invoice-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          #tse-tax-invoice-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }
        }
      `}</style>
    </div>
  );
}

