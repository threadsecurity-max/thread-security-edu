'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
  Clock,
  Mail,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from 'lucide-react';

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
    setFeedback(`✓ New ${roleInput} activation token generated for ${emailInput.trim()}!`);
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
    <div className="space-y-6 font-mono text-xs">
      {/* Top Action Bar */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            Activation Tokens &amp; Invitations ({invitations.length})
          </h2>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Single-use cryptographic setup tokens for faculty onboarding and student TS-ID password creation.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Activation Link</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Invitations Table */}
      <div className="overflow-hidden rounded-2xl bg-[#0B0F19]/90 border border-slate-850 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-bold">Recipient Email</th>
                <th className="p-4 font-bold">Account Role</th>
                <th className="p-4 font-bold">Token Secret</th>
                <th className="p-4 font-bold">Expiration Window</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No invitation tokens currently tracked. Click "Generate Activation Link" to issue a new credential token.
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => {
                  const isExpired = new Date(inv.expiresAt) < new Date();
                  return (
                    <tr key={inv.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{inv.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          inv.role === 'MENTOR'
                            ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {inv.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-400 select-all font-mono text-[11px] truncate max-w-[180px] inline-block">
                          {inv.token.slice(0, 18)}...
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        {inv.isUsed ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                            ACTIVATED
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                            EXPIRED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            READY
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => copyToClipboard(inv.token)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-emerald-400" />
                          <span>{copiedToken === inv.token ? 'Copied URL!' : 'Copy Link'}</span>
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
        <DialogContent className="max-w-md bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Issue Activation Invitation Link
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleGenerateToken} className="space-y-4 pt-2">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">
                Recipient Email Address *
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. mentor@threadsecurity.in"
                required
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">
                Account Clearance Role *
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="MENTOR">Mentor / Faculty Account</option>
                <option value="STUDENT">Student TS-ID Account</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="text-white font-bold block">Security Policy:</span>
              <p>Generated activation tokens are single-use and expire after 7 days. Permanent passwords are never sent via plain email.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsGenerateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                {loading ? 'Issuing...' : 'Generate Secure Token'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
