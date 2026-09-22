import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, BookOpen, FileCheck } from 'lucide-react';

interface GuestClearanceBannerProps {
  session: {
    tsId?: string | null;
    name?: string | null;
  } | null;
}

export function GuestClearanceBanner({ session }: GuestClearanceBannerProps) {
  return (
    <div className="bg-black border-b border-security-green/40 text-white px-4 py-3.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-security-green/40 flex items-center justify-center text-security-green shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white font-mono">
                GUEST DISCOVERY ACTIVE: {session?.tsId || 'NEW LEARNER'}
              </span>
              <Badge variant="outline" className="text-[10px] border-security-green text-security-green bg-security-green/10 font-mono font-medium">
                LMS Lab Clearance Pending
              </Badge>
            </div>
            <p className="text-gray-300 mt-0.5">
              Welcome <strong>{session?.name || 'Learner'}</strong>! You have unrestricted access to discover the curriculum, courses, and learning paths below while your TS-ID awaits Academic Admin approval.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/courses">
            <Button size="sm" className="bg-white hover:bg-gray-100 text-black font-medium font-mono text-xs gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Explore All Courses
            </Button>
          </Link>
          <Link href="/student/pending-approval">
            <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10 font-mono text-xs gap-1 font-medium">
              <FileCheck className="w-3.5 h-3.5" />
              View TS-ID Card
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
