import Link from 'next/link';
import { ArrowLeft, BookOpen, Newspaper, ShieldCheck, Mail, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center relative overflow-hidden">
      {/* Subtle ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C6FF34]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#a855f7]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#C6FF34]">
          <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
          <span>404: RESOURCE_NOT_FOUND</span>
        </div>

        <h1 className="text-6xl sm:text-8xl font-extrabold font-mono tracking-tight text-white">
          4<span className="text-[#C6FF34]">0</span>4
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            Target Endpoint Not Located
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The course, article, or resource you are attempting to access does not exist, has been relocated, or is undergoing security review.
          </p>
        </div>

        {/* Helpful Recovery Navigation */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-[#C6FF34] hover:bg-[#b5f41f] text-black font-bold font-mono text-xs px-5 py-2.5 rounded-xl flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Return Home
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 font-mono text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#C6FF34]" aria-hidden="true" />
              Browse Courses
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 font-mono text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <Newspaper className="w-3.5 h-3.5 text-[#a855f7]" aria-hidden="true" />
              Tech Blog
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 font-mono text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              Contact Support
            </Button>
          </Link>
        </div>

        <div className="pt-8 border-t border-white/10 text-xs text-slate-500 font-mono flex items-center justify-center gap-4">
          <Link href="/verify-certificate" className="hover:text-[#C6FF34] transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Verify TS-ID Credential</span>
          </Link>
          <span>•</span>
          <Link href="/placements" className="hover:text-[#C6FF34] transition-colors">
            Placement Records
          </Link>
        </div>
      </div>
    </div>
  );
}
