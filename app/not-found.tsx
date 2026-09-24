import Link from 'next/link';
import { ArrowLeft, BookOpen, Newspaper, ShieldCheck, Mail, Terminal, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050706] text-white p-4 sm:p-6 relative overflow-hidden selection:bg-[#C6FF34] selection:text-black">
      {/* ── FUTURISTIC AMBIENT LIQUID GLOWS & MESH LIGHTING ── */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C6FF34]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#C6FF34_1px,transparent_1px),linear-gradient(to_bottom,#C6FF34_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* ── LIQUID GLASS CARD CONTAINER ── */}
      <div className="relative z-10 max-w-2xl w-full mx-auto p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl text-center space-y-8 overflow-hidden group">
        
        {/* Specular Liquid Light Shimmer Effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#C6FF34]/20 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Top Terminal Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs font-mono text-[#C6FF34] backdrop-blur-md shadow-inner">
          <Terminal className="w-3.5 h-3.5 text-[#C6FF34] animate-pulse" aria-hidden="true" />
          <span className="tracking-wide">ERR_404 // ROUTE_VECTOR_UNRESOLVED</span>
        </div>

        {/* Liquid Glowing 404 Headline */}
        <div className="relative select-none">
          <div className="text-7xl sm:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 drop-shadow-[0_10px_35px_rgba(198,255,52,0.2)]">
            4<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6FF34] to-emerald-400">0</span>4
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-1 bg-[#C6FF34]/40 rounded-full blur-sm" />
        </div>

        {/* Description Text */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Target Node Not Found
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            The security module, curriculum path, or endpoint you navigated to does not exist or has been relocated to another coordinate.
          </p>
        </div>

        {/* Futuristic Glass Navigation Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-[#C6FF34] hover:bg-[#b2f218] text-black font-bold font-mono text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-[0_0_25px_rgba(198,255,52,0.3)] hover:shadow-[0_0_35px_rgba(198,255,52,0.45)] transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Return to Academy</span>
            </Button>
          </Link>
          
          <Link href="/courses">
            <Button variant="outline" className="border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.12] hover:border-white/30 font-mono text-xs px-5 py-3 rounded-2xl flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer">
              <BookOpen className="w-3.5 h-3.5 text-[#C6FF34]" aria-hidden="true" />
              <span>Explore Courses</span>
            </Button>
          </Link>

          <Link href="/blog">
            <Button variant="outline" className="border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.12] hover:border-white/30 font-mono text-xs px-5 py-3 rounded-2xl flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer">
              <Newspaper className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Research Blog</span>
            </Button>
          </Link>

          <Link href="/contact">
            <Button variant="outline" className="border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.12] hover:border-white/30 font-mono text-xs px-5 py-3 rounded-2xl flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer">
              <Mail className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
              <span>Support</span>
            </Button>
          </Link>
        </div>

        {/* Bottom Glass Footer Pill */}
        <div className="pt-6 border-t border-white/10 text-xs text-slate-400 font-mono flex flex-wrap items-center justify-center gap-4">
          <Link href="/verify-certificate" className="hover:text-[#C6FF34] transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF34]" aria-hidden="true" />
            <span>Verify TS-ID</span>
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/learning-paths" className="hover:text-[#C6FF34] transition-colors flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>Learning Pathways</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
