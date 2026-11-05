'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Bell,
  BookOpen,
  MessageSquare,
  CalendarCheck,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  Users,
} from 'lucide-react';

interface StaffNavigationProps {
  user: {
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/staff',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Today's Docket",
    href: '/staff/docket',
    icon: ClipboardList,
    badge: 'Assignments',
  },
  {
    name: 'Announcements',
    href: '/staff/announcements',
    icon: Bell,
    badge: null,
  },
  {
    name: 'Blog Studio',
    href: '/staff/blogs',
    icon: BookOpen,
    badge: null,
  },
  {
    name: 'Communications Hub',
    href: '/staff/messages',
    icon: MessageSquare,
    badge: 'Live',
  },
  {
    name: 'My Attendance',
    href: '/staff/my-attendance',
    icon: CalendarCheck,
    badge: null,
  },
];

export function StaffNavigation({ user }: StaffNavigationProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const roleLabel =
    user.role === 'STAFF_EXECUTIVE'
      ? 'Tier 2 Staff Executive'
      : user.role === 'STAFF_JUNIOR'
      ? 'Tier 3 Technical Associate'
      : user.role === 'SUPER_ADMIN'
      ? 'Super Admin (Viewing)'
      : user.role;

  return (
    <aside className="w-64 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-black tracking-wider text-purple-400 uppercase">
                THREAD SECURITY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-white tracking-tight">Staff Operations Desk</p>
          </div>
        </div>
      </div>

      {/* Staff Identity Pill */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs uppercase">
            {(user.name || user.email || 'S')[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.name || user.email?.split('@')[0]}</p>
            <p className="text-[10px] font-mono text-purple-300/80 truncate">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase">
          OPERATIONAL DESK
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/staff'
              ? pathname === '/staff'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px]">Secure Channel</span>
          </div>
          <span className="text-[10px] font-mono text-purple-400 font-semibold">TSE-NET</span>
        </div>

        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

