'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Bell, CheckCircle2, X, ChevronRight, Volume2 } from 'lucide-react';
import { fetchUserNotificationsAction, markAsReadAction } from '@/features/notifications/actions/notification.actions';

export function BroadcastNotificationBanner({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeBroadcast, setActiveBroadcast] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  async function loadNotifications() {
    if (!userId) return;
    setLoading(true);
    const res = await fetchUserNotificationsAction(userId);
    if (res.success && res.notifications) {
      setNotifications(res.notifications);
      // Select first unread broadcast announcement
      const unread = res.notifications.find((n: any) => !n.isRead);
      if (unread) {
        setActiveBroadcast(unread);
      }
    }
    setLoading(false);
  }

  const handleMarkAsRead = async (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
    if (activeBroadcast?.id === id) {
      setActiveBroadcast(null);
    }
    await markAsReadAction(id);
    loadNotifications();
  };

  const unreadBroadcasts = notifications.filter(
    (n) => !n.isRead && !dismissedIds.includes(n.id)
  );

  if (unreadBroadcasts.length === 0 && !activeBroadcast) {
    return null;
  }

  const current = activeBroadcast || unreadBroadcasts[0];
  if (!current || dismissedIds.includes(current.id)) return null;

  return (
    <div className="w-full mb-6 font-sans relative z-30 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-red-950/80 via-rose-950/60 to-black/80 backdrop-blur-2xl border border-red-500/40 text-white shadow-[0_8px_32px_rgba(220,38,38,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        
        {/* Ambient Red Glow Behind Banner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start md:items-center gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-white/20">
            <Megaphone className="w-5 h-5 text-white animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[10px] text-red-300 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-500/30 uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-red-400" />
                LMS System Broadcast
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {new Date(current.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h4 className="text-sm md:text-base font-extrabold text-white tracking-tight">
              {current.title}
            </h4>

            <p className="text-xs text-slate-200 leading-relaxed font-sans max-w-4xl">
              {current.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0 relative z-10 pt-2 md:pt-0">
          <button
            onClick={() => handleMarkAsRead(current.id)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-white/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark as Read</span>
          </button>

          <button
            onClick={() => setDismissedIds((prev) => [...prev, current.id])}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center text-xs cursor-pointer"
            title="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
