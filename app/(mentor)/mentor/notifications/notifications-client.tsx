'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  BookOpen,
  Radio,
  ExternalLink,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { markNotificationAsReadAction } from '@/features/notifications/actions/notification.actions';

export interface NotificationsClientProps {
  initialNotifications: any[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const categories = ['ALL', 'ACADEMIC', 'ATTENDANCE', 'ADMINISTRATIVE', 'SYSTEM'];

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (filterCategory === 'ALL') return true;
    const type = n.type?.toUpperCase() || 'SYSTEM';
    if (filterCategory === 'ACADEMIC') return type === 'ACADEMIC' || type === 'CURRICULUM';
    if (filterCategory === 'ATTENDANCE') return type === 'ATTENDANCE';
    if (filterCategory === 'ADMINISTRATIVE') return type === 'ADMIN' || type === 'ADMINISTRATIVE';
    return type === filterCategory;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'ATTENDANCE':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'ACADEMIC':
      case 'CURRICULUM':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'ADMIN':
      case 'ADMINISTRATIVE':
        return <ShieldCheck className="w-4 h-4 text-[#C6FF34]" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#C6FF34]" />
            Mentor Notification Center
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Categorized operational alerts, attendance locking notices, and administrative announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-xs">
            {unreadCount} Unread Alerts
          </Badge>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
              filterCategory === cat
                ? 'bg-white text-black font-bold shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-w-4xl">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center font-mono text-slate-500">
            No notifications in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !item.isRead
                  ? 'bg-[#121212] border-[#C6FF34]/30 shadow-md'
                  : 'bg-[#0a0a0a] border-white/5 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/5 shrink-0 mt-0.5">
                  {getCategoryIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white font-sans">
                      {item.title}
                    </span>
                    <Badge className="bg-white/10 text-slate-300 font-mono text-[9px]">
                      {item.type || 'SYSTEM'}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {item.message}
                  </p>

                  {item.linkUrl && (
                    <Link
                      href={item.linkUrl}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[#C6FF34] hover:underline pt-1"
                    >
                      View Linked Workspace <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {!item.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(item.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white shrink-0 text-xs font-mono"
                  title="Mark as Read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
