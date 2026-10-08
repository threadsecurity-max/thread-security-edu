import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#050706] text-white font-mono flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-widest">
            HTTP 403 • ACCESS RESTRICTED
          </span>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Clearance Required
          </h1>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Your current account credentials do not hold the authorization clearance required to access this command workspace. Please verify your role or re-authenticate.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link href="/login" className="w-full">
            <button className="w-full py-2.5 px-4 rounded-xl bg-[#C6FF34] hover:bg-[#b5f425] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#C6FF34]/10">
              <LogIn className="w-4 h-4" />
              <span>Sign In with Authorized Account</span>
            </button>
          </Link>

          <Link href="/" className="w-full">
            <button className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 text-xs flex items-center justify-center gap-2 transition-all border border-white/[0.08] cursor-pointer">
              <Home className="w-4 h-4" />
              <span>Return to Thread Security Home</span>
            </button>
          </Link>
        </div>

        <p className="text-[10px] text-zinc-600">
          Thread Security Cyber Intelligence Academy &bull; Zero Trust RBAC Enforced
        </p>
      </div>
    </div>
  );
}
