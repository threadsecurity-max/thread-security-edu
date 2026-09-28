import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Badge, TSIDBadge } from '@/components/ui/badge';
import {
  ShieldCheck,
  ArrowRight,
  UserCheck,
  BookOpen,
  Layers,
  Users,
  Award,
  Lock,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Phone,
} from 'lucide-react';
import { MoreDropdown } from '@/components/navigation/MoreDropdown';
import { LogoutButton } from '@/components/navigation/LogoutButton';
import { MobileNavDrawer } from '@/components/navigation/MobileNavDrawer';

const navItems = [
  { name: 'Courses', url: '/courses', icon: 'BookOpen' },
  { name: 'Curriculum', url: '/#curriculum-roadmap', icon: 'Layers' },
  { name: 'Projects', url: '/#projects', icon: 'BookOpen' },
  // { name: 'Placements', url: '/placements', icon: 'Briefcase' },
  { name: 'Workshops', url: '/workshops', icon: 'Sparkles' },  
  { name: 'Contact Us', url: '/contact', icon: 'Phone' },
];

export async function PublicNavbar() {
  const session = await getSession();

  return (
    <header className="landing-header">
      <div className="landing-header-container">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          title="Thread Security Education"
        >
          <span className="font-bold tracking-wider text-base sm:text-lg text-black uppercase">
            THREAD SECURITY
          </span>
          <span className="text-[11px] bg-lime-100 border border-lime-200/60 px-2 py-0.5 rounded-sm uppercase font-semibold tracking-widest text-black">
            EDUCATION
          </span>
        </Link>

        {/* Navigation Links with Clean Basic Links & Dropdown */}
        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className="text-sm font-medium text-slate-600 hover:text-black transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <MoreDropdown />
        </div>

        {/* Action Buttons & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="landing-nav-actions hidden sm:flex">
            {session ? (
              <div className="flex items-center gap-2.5">
                {session.role !== 'STUDENT' || session.isDashboardAccessGranted ? (
                  <Link
                    href={
                      session.role === 'SECURITY_ADMIN'
                        ? '/admin/security-analyst'
                        : session.role === 'SUPER_ADMIN' || session.role === 'ACADEMIC_ADMIN'
                        ? '/admin'
                        : session.role === 'MENTOR'
                        ? '/mentor'
                        : '/student'
                    }
                    className="landing-btn-primary text-xs sm:text-sm font-bold font-mono inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                    <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-normal ml-1 hidden lg:inline">({session.role})</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-mono font-bold">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{session.tsId || 'Guest TS-ID'}</span>
                    </div>
                    <Link href="/courses" className="landing-btn-primary text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer">
                      <Sparkles className="w-4 h-4" />
                      <span>Discover Curriculum</span>
                    </Link>
                  </div>
                )}

                {/* Quick Logout Button */}
                <LogoutButton />
              </div>
            ) : (
              <>
                <Link href="/login" className="landing-btn-outline text-xs sm:text-sm py-1.5 sm:py-2">
                  <UserCheck className="w-4 h-4" />
                  Login
                </Link>
                <Link href="/contact" className="landing-btn-primary text-xs sm:text-sm py-1.5 sm:py-2">
                  <Phone className="w-4 h-4 text-black" />
                  Request Callback
                </Link>
              </>
            )}
          </div>

          {/* Mobile Drawer Trigger (< 1024px) */}
          <div className="lg:hidden flex items-center">
            <MobileNavDrawer session={session} />
          </div>
        </div>
      </div>
    </header>
  );
}
