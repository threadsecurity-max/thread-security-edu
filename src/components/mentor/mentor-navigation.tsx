'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Users,
  CheckSquare,
  FileText,
  Bell,
  Clock,
  LogOut,
  Sparkles,
  Menu,
  X,
  Globe,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface MentorNavigationProps {
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  unreadNotificationsCount?: number;
}

export function MentorNavigation({ user, unreadNotificationsCount = 0 }: MentorNavigationProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    {
      name: 'Mentor Dashboard',
      href: '/mentor',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Today's Teaching",
      href: '/mentor/today',
      icon: Clock,
      badge: 'Live',
    },
    {
      name: 'My Batches',
      href: '/mentor/batches',
      icon: Layers,
    },
    {
      name: 'Assignments Hub',
      href: '/mentor/assignments',
      icon: FileText,
      badge: 'New',
    },
    {
      name: 'Blogs & Research',
      href: '/mentor/blogs',
      icon: Globe,
      badge: 'Publish',
    },
    {
      name: 'Academic Calendar',
      href: '/mentor/calendar',
      icon: Calendar,
    },
    {
      name: 'Assigned Students',
      href: '/mentor/students',
      icon: Users,
    },
    {
      name: 'Notification Center',
      href: '/mentor/notifications',
      icon: Bell,
      badgeCount: unreadNotificationsCount,
    },
  ];

  const isCurrentActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname.startsWith(itemHref);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-black border-b border-white/10 text-white sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5 text-[#C6FF34]" />
          </button>
          <Link href="/mentor" className="flex items-center gap-2">
            <img src="/logos/TSE Logo Nav.svg" alt="TSE Logo" className="h-7 w-auto" />
            <span className="text-xs font-mono font-bold tracking-wider text-white">MENTOR PORTAL</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/mentor/today">
            <Badge className="bg-[#C6FF34] text-black hover:bg-[#b2eb2a] text-[10px] font-bold font-mono">
              TODAY'S TEACHING
            </Badge>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-[#0a0a0a] border-r border-white/10 p-5 flex flex-col justify-between z-10 text-white shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img src="/logos/TSE Logo Nav.svg" alt="TSE Logo" className="h-7 w-auto" />
                  <span className="text-xs font-mono font-bold text-white">TSE MENTOR</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 text-xs">
                <span className="text-[10px] font-mono text-[#C6FF34] font-bold block">VERIFIED MENTOR</span>
                <p className="font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const active = isCurrentActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all ${
                        active
                          ? 'bg-white text-black font-bold shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-[#C6FF34]'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          active ? 'bg-black text-[#C6FF34]' : 'bg-[#C6FF34] text-black'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.badgeCount ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold">
                          {item.badgeCount}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link href="/login" className="block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-400 hover:text-white justify-start gap-2 text-xs font-mono"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 text-white hidden md:flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <Link href="/mentor" className="flex items-center gap-3 group" title="TSE Mentor Portal">
            <img
              src="/logos/TSE Logo Nav.svg"
              alt="Thread Security Education Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Mentor Profile Overview Badge */}
          <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#C6FF34] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF34]" />
                FACULTY LEAD
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-white/10 text-white rounded font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
          </div>

          <nav className="space-y-1.5 text-xs font-mono">
            {navItems.map((item) => {
              const active = isCurrentActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-white text-black font-bold shadow-lg shadow-white/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-[#C6FF34]'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      active ? 'bg-black text-[#C6FF34]' : 'bg-[#C6FF34] text-black'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.badgeCount ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold">
                      {item.badgeCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="p-2.5 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Operating Mode:</span>
            <span className="text-[#C6FF34] font-bold">TEACH & TRACK</span>
          </div>

          <Link href="/login" className="block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-slate-400 hover:text-white justify-start gap-2 text-xs font-mono rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
