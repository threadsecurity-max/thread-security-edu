'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyMentorClearanceAction } from '@/features/auth/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Terminal,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function MentorVerifyClient({
  mentorEmail,
  mentorName,
}: {
  mentorEmail: string;
  mentorName: string;
}) {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState('');
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await verifyMentorClearanceAction(secretKey, passkey);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials. Access denied.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/mentor');
        router.refresh();
      }, 1000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] p-4 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C6FF34]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-6">
        {/* Security Shield Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-[#C6FF34]/10 border border-[#C6FF34]/30 shadow-[0_0_30px_rgba(198,255,52,0.2)] mb-2">
            <ShieldCheck className="w-10 h-10 text-[#C6FF34]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-[#C6FF34]/20 text-[#C6FF34] border border-[#C6FF34]/40 font-mono text-[10px] tracking-wider uppercase">
              FACULTY CLEARANCE PROTOCOL
            </Badge>
            <Badge className="bg-white/5 text-slate-400 border border-white/10 font-mono text-[10px]">
              LEVEL-2 RBAC
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            Mentor Security Challenge
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Faculty operations require secondary cryptographic authorization. Enter your assigned Mentor Secret Key & Passkey to unlock the teaching console.
          </p>
        </div>

        {/* Verification Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6">
          {/* Identity Pill */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Authenticated Faculty:</span>
            <div className="text-right">
              <span className="text-white font-bold block font-sans">{mentorName}</span>
              <span className="text-[11px] text-[#C6FF34]">{mentorEmail}</span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2.5 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div>
                <span className="font-bold block">ACCESS DENIED</span>
                <span className="text-slate-300 font-sans">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-[#C6FF34]/15 border border-[#C6FF34]/40 text-[#C6FF34] text-xs font-mono flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#C6FF34] animate-spin" />
              <div>
                <span className="font-bold block">FACULTY CLEARANCE GRANTED</span>
                <span className="text-slate-200 font-sans">
                  Decrypting mentor workspace and synchronizing batch telemetry...
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Secret Key Input */}
            <div>
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#C6FF34]" />
                  Mentor Secret Key *
                </span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter your assigned faculty secret key"
                  className="bg-black/60 border-white/20 text-[#C6FF34] font-mono text-sm placeholder:text-slate-600 uppercase focus:border-[#C6FF34]"
                  required
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                Enter the confidential faculty secret key issued by TSE Administration.
              </span>
            </div>

            {/* Passkey Input */}
            <div>
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#C6FF34]" />
                  Mentor Passkey *
                </span>
              </label>
              <div className="relative">
                <Input
                  type={showPasskey ? 'text' : 'password'}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter your assigned faculty passkey"
                  className="bg-black/60 border-white/20 text-white font-mono text-sm placeholder:text-slate-600 pr-10 focus:border-[#C6FF34]"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                Enter the confidential faculty passkey issued by TSE Administration.
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full py-6 rounded-2xl bg-white hover:bg-slate-200 text-black font-mono font-bold text-sm shadow-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Validating Cryptographic Passkey...</span>
                </>
              ) : success ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Clearance Granted! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Unlock Mentor Operational Console</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                </>
              )}
            </Button>
          </form>

          {/* Bottom Security Assurance */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-[#C6FF34]" /> Audit Logged
            </span>
            <span>Thread Security Education LMS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
