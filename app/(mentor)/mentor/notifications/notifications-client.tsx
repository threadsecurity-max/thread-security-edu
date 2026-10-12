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
  ExternalLink,
  Check,
  Inbox,
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
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'ACADEMIC':
      case 'CURRICULUM':
        return <BookOpen className="w-4 h-4 text-violet-600" />;
      case 'ADMIN':
      case 'ADMINISTRATIVE':
        return <ShieldCheck className="w-4 h-4 text-violet-700" />;
      default:
        return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
            <Bell className="w-3.5 h-3.5" />
            Faculty Alerts & Activity
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Notification Center
          </h1>
          <p className="text-sm text-slate-500">
            Categorized academic alerts, attendance reminders, and official administrative announcements.
          </p>
        </div>

        {unreadCount > 0 ? (
          <div className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 shrink-0 self-start md:self-auto">
            {unreadCount} Unread Alert{unreadCount === 1 ? '' : 's'}
          </div>
        ) : (
          <div className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 shrink-0 self-start md:self-auto">
            All Caught Up
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 border border-slate-200 rounded-xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-white text-violet-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat === 'ALL' ? 'All Alerts' : cat.charAt(0) + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-2xl md:rounded-3xl bg-white border border-slate-200 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No Notifications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no notifications matching the selected filter.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !item.isRead
                  ? 'bg-white border-l-4 border-l-violet-600 border-slate-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    item.type === 'ATTENDANCE'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : item.type === 'ACADEMIC' || item.type === 'CURRICULUM'
                      ? 'bg-violet-50 text-violet-600 border border-violet-100'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {getCategoryIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </span>
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] rounded-md font-normal">
                      {item.type || 'SYSTEM'}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.message}
                  </p>

                  {item.linkUrl && (
                    <div className="pt-1">
                      <Link
                        href={item.linkUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-800 hover:underline"
                      >
                        Open Workspace <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {!item.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(item.id)}
                  className="p-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 shrink-0 transition-colors cursor-pointer"
                  title="Mark as Read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

