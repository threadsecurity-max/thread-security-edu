'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Key,
  Copy,
  Plus,
  CheckCircle2,
  Mail,
  UserCheck,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export function AccessInvitationsClient({
  initialInvitations,
  mentorsList,
  studentsList,
}: {
  initialInvitations: any[];
  mentorsList: any[];
  studentsList: any[];
}) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'STUDENT' | 'MENTOR'>('MENTOR');
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setLoading(true);

    const randomSuffix = Math.random().toString(36).substring(2, 12);
    const newToken = `tse-inv-${Date.now()}-${randomSuffix}`;
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const newRecord = {
      id: `inv-${Date.now()}`,
      token: newToken,
      email: emailInput.trim().toLowerCase(),
      role: roleInput,
      isUsed: false,
      expiresAt: expires.toISOString(),
      createdAt: new Date().toISOString(),
    };

    setInvitations([newRecord, ...invitations]);
    setLoading(false);
    setFeedback(`New ${roleInput} activation token generated for ${emailInput.trim()}`);
    setEmailInput('');
    setIsGenerateOpen(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const copyToClipboard = (token: string) => {
    const activationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/activate?token=${token}`;
    navigator.clipboard.writeText(activationUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans text-xs">
      {/* Top Action Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-violet-600" />
            Activation Tokens &amp; Invitations ({invitations.length})
          </h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Single-use cryptographic setup tokens for faculty onboarding and student TS-ID credentials.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Activation Link</span>
        </button>
      </div>

      {/* Schedule & Timings / Attendance Policy Quick Launch Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 via-white to-violet-50 border border-violet-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
              <span>Schedule &amp; Timings • 5-Day Attendance Activation</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-200 text-violet-800 text-[10px] font-mono font-bold">
                120h Window
              </span>
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Set cohort duration formats (45 days, 3 months, 6 months), build mentor lecture timetables, and monitor active attendance windows.
            </p>
          </div>
        </div>

        <Link
          href="/admin/batches?tab=calendar"
          className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
        >
          <span>Open Timetable Calendar</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Invitations Table */}
      <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="p-4">Recipient Email</th>
                <th className="p-4">Account Role</th>
                <th className="p-4">Token Secret</th>
                <th className="p-4">Expiration Window</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-sans">
                    No invitation tokens currently tracked. Click "Generate Activation Link" to issue a new credential token.
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => {
                  const isExpired = new Date(inv.expiresAt) < new Date();
                  return (
                    <tr key={inv.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inv.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            inv.role === 'MENTOR'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {inv.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-500 font-mono text-[11px] truncate max-w-[180px] inline-block">
                          {inv.token.slice(0, 18)}...
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        {inv.isUsed ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium">
                            Activated
                          </span>
                        ) : isExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-medium">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                            Ready
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => copyToClipboard(inv.token)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-violet-600" />
                          <span>{copiedToken === inv.token ? 'Copied URL' : 'Copy Link'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invitation Token Modal */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 font-sans text-xs">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-600" />
              Issue Activation Invitation Link
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleGenerateToken} className="space-y-4 pt-2">
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                Target Recipient Email *
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. mentor.faculty@threadsecurity.in"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">
                Target Account Role *
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500 font-medium"
              >
                <option value="MENTOR">Faculty Mentor</option>
                <option value="STUDENT">Student Account</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-violet-50/60 border border-violet-100 text-[11px] text-slate-600 space-y-1">
              <span className="text-violet-900 font-semibold block">Single-Use Token Security:</span>
              <p>
                Tokens expire automatically after 7 days and become permanently void once password setup completes.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsGenerateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Issue Token'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
