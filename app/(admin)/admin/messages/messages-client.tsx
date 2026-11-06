'use client';

import React, { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Search,
  Plus,
  Shield,
  Clock,
  CheckCheck,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Bell,
  BellOff,
  Share2,
  Quote,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  sendAdminMessageAction,
  getConversationMessagesAction,
  getAdminConversationsAction,
} from '@/features/messages/actions/message.actions';

interface MessageSender {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string | Date;
  sender?: MessageSender;
}

interface ConversationItem {
  id: string;
  participantAId: string;
  participantBId: string;
  participantA: MessageSender;
  participantB: MessageSender;
  updatedAt: string | Date;
  messages: MessageItem[];
}

interface MessagesClientProps {
  currentUserId: string;
  initialConversations: ConversationItem[];
  mentors: { id: string; name: string | null; email: string; role?: string }[];
  students?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    tsId?: string | null;
    batchCode?: string | null;
  }[];
}

const DIRECTIVE_TEMPLATES = [
  { label: 'Attendance', text: 'Please submit lecture attendance for your recent faculty session.' },
  { label: 'Lab Support', text: 'CSM follow-up required: Student reported difficulty with lab exercise.' },
  { label: 'Workshop', text: 'Upcoming workshop dry-run scheduled for tomorrow at 18:00 IST.' },
  { label: 'Timetable', text: 'Your office hours schedule has been drafted into batch timetable.' },
  { label: 'Cyber Range', text: 'Urgent: Virtual lab range & VM environment is ready for student inspection.' },
  { label: 'Assessments', text: 'Kindly review and finalize the pending assessment score submissions.' },
];

// Synthetic Web Audio API Chime (Reliable, Zero External Audio Files)
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Primary High Tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Harmonic Soft Bell Tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch {
    // Browser may require interaction before playing audio
  }
}

export function MessagesClient({
  currentUserId,
  initialConversations,
  mentors,
  students = [],
}: MessagesClientProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversations[0]?.id || null
  );
  const [messages, setMessages] = useState<MessageItem[]>(
    initialConversations[0]?.messages || []
  );
  const [inputContent, setInputContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [selectedMentorForNewChat, setSelectedMentorForNewChat] = useState('');
  const [isPending, startTransition] = useTransition();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Incoming Notification Pop State
  const [notificationPop, setNotificationPop] = useState<{
    id: string;
    senderName: string;
    senderRole: string;
    content: string;
    conversationId: string;
    time: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousLatestMsgRef = useRef<string | null>(
    initialConversations[0]?.messages?.slice(-1)[0]?.id || null
  );

  const showToast = (text: string) => {
    setToastNotice(text);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeRecipient = activeConversation
    ? activeConversation.participantAId === currentUserId
      ? activeConversation.participantB
      : activeConversation.participantA
    : null;

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Load messages when conversation switches
  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    const res = await getConversationMessagesAction(convId);
    if (res.success && res.data) {
      setMessages(res.data as MessageItem[]);
    }
  };

  // Live Auto-Polling: Refresh messages & conversations every 4 seconds
  const fetchLatestUpdates = useCallback(async () => {
    if (!activeConversationId) return;

    try {
      // 1. Fetch messages for active conversation
      const msgRes = await getConversationMessagesAction(activeConversationId);
      if (msgRes.success && Array.isArray(msgRes.data)) {
        const fetchedMessages = msgRes.data as MessageItem[];
        const latestFetched = fetchedMessages.slice(-1)[0];

        // Check if a new incoming message arrived from the other participant
        if (
          latestFetched &&
          latestFetched.id !== previousLatestMsgRef.current &&
          latestFetched.senderId !== currentUserId
        ) {
          previousLatestMsgRef.current = latestFetched.id;

          // Sound Alert
          if (soundEnabled) {
            playNotificationChime();
          }

          // Trigger Notification Pop
          const senderObj = latestFetched.sender;
          const senderName = senderObj?.name || senderObj?.email || 'Faculty Member';
          const senderRole = senderObj?.role || 'MENTOR';
          const time = new Date(latestFetched.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          setNotificationPop({
            id: latestFetched.id,
            senderName,
            senderRole,
            content: latestFetched.content,
            conversationId: activeConversationId,
            time,
          });

          // Also trigger HTML5 desktop notification if granted
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted' &&
            document.hidden
          ) {
            try {
              new Notification(`New Directive from ${senderName}`, {
                body: latestFetched.content,
                icon: '/icons/icon-192x192.png',
              });
            } catch {
              // ignore
            }
          }
        }

        setMessages(fetchedMessages);
      }

      // 2. Refresh conversation roster list
      const convRes = await getAdminConversationsAction();
      if (convRes.success && Array.isArray(convRes.data)) {
        setConversations(convRes.data as ConversationItem[]);
      }
    } catch {
      // ignore network jitter
    }
  }, [activeConversationId, currentUserId, soundEnabled]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestUpdates();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchLatestUpdates]);

  // Send message
  const handleSendMessage = async (contentToSend?: string) => {
    const text = (contentToSend || inputContent).trim();
    if (!text || !activeRecipient) return;

    setInputContent('');

    // Optimistic message
    const tempMsg: MessageItem = {
      id: `temp_${Date.now()}`,
      conversationId: activeConversationId || '',
      senderId: currentUserId,
      content: text,
      isRead: false,
      createdAt: new Date(),
      sender: {
        id: currentUserId,
        name: 'You',
        email: 'self@threadsecurity.in',
        role: 'MENTOR',
      },
    };
    setMessages((prev) => [...prev, tempMsg]);

    startTransition(async () => {
      const res = await sendAdminMessageAction(activeRecipient.id, text);
      if (res.success && res.data) {
        if (!activeConversationId) {
          setActiveConversationId(res.data.conversationId);
        }
        // Refresh messages
        const updatedMsgs = await getConversationMessagesAction(res.data.conversationId);
        if (updatedMsgs.success && updatedMsgs.data) {
          setMessages(updatedMsgs.data as MessageItem[]);
          previousLatestMsgRef.current = updatedMsgs.data.slice(-1)[0]?.id || null;
        }
        showToast('Message dispatched successfully');
      } else {
        showToast(res.error || 'Failed to dispatch message');
      }
    });
  };

  // Copy message to clipboard
  const handleCopyMessage = (msgId: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMessageId(msgId);
      showToast('Message copied to clipboard');
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  // Quote message into input
  const handleQuoteMessage = (content: string) => {
    const quoted = `"${content}"\n> `;
    setInputContent(quoted);
  };

  // Share conversation details / channel link
  const handleShareChannel = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(
        `Thread Security Faculty Channel with ${activeRecipient?.name || activeRecipient?.email} (${activeRecipient?.role}):\n${shareUrl}`
      );
      showToast('Channel link & details copied to clipboard');
    }
  };

  // Start new channel
  const handleStartNewThread = async () => {
    if (!selectedMentorForNewChat) return;
    const recipient =
      mentors.find((m) => m.id === selectedMentorForNewChat) ||
      students.find((s) => s.id === selectedMentorForNewChat);
    if (!recipient) return;

    // Check if conversation already exists
    const existing = conversations.find(
      (c) =>
        (c.participantAId === recipient.id && c.participantBId === currentUserId) ||
        (c.participantBId === recipient.id && c.participantAId === currentUserId)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      await handleSelectConversation(existing.id);
      setIsNewChatOpen(false);
      return;
    }

    startTransition(async () => {
      const res = await sendAdminMessageAction(
        recipient.id,
        `Hello ${recipient.name || 'Member'}, this is the Thread Security Academic Channel.`
      );
      if (res.success && res.data) {
        setIsNewChatOpen(false);
        setActiveConversationId(res.data.conversationId);
        const updated = await getConversationMessagesAction(res.data.conversationId);
        if (updated.success && updated.data) {
          setMessages(updated.data as MessageItem[]);
        }
        showToast(`Channel established with ${recipient.name || recipient.email}`);
      }
    });
  };

  const filteredConversations = conversations.filter((c) => {
    const other = c.participantAId === currentUserId ? c.participantB : c.participantA;
    return (
      (other.name && other.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      other.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getRoleBadgeClass = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'SUPER_ADMIN':
        return 'bg-purple-950/70 text-purple-300 border-purple-500/40';
      case 'SECURITY_ADMIN':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
      case 'MENTOR':
        return 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40';
      case 'STAFF_EXECUTIVE':
      case 'STAFF_JUNIOR':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      case 'STUDENT':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 font-sans relative">
      {/* ── ACCURATE FLOATING NOTIFICATION POP ── */}
      {notificationPop && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 border-2 border-indigo-500 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-indigo-400/50">
                {notificationPop.senderName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">
                    {notificationPop.senderName}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${getRoleBadgeClass(
                      notificationPop.senderRole
                    )}`}
                  >
                    {notificationPop.senderRole}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {notificationPop.time}
                </span>
              </div>
            </div>

            <button
              onClick={() => setNotificationPop(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-200 line-clamp-2 leading-relaxed bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
            {notificationPop.content}
          </p>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                handleSelectConversation(notificationPop.conversationId);
                setNotificationPop(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Channel</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TOAST NOTICE ── */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* ── TOP CONTROL & DIRECTIVE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B0F19] to-slate-900 border border-slate-800 shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white uppercase font-mono">
                Thread Security Communications Hub
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                ● Live Synced
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure internal directives, task reports, and peer faculty messaging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Chime sound is enabled' : 'Chime sound is muted'}
          >
            {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="font-mono text-[11px] hidden sm:inline">
              {soundEnabled ? 'Sound On' : 'Muted'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => fetchLatestUpdates()}
            disabled={isPending}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Refresh active channel messages"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            <span className="font-mono text-[11px] hidden sm:inline">Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewChatOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#C6FF34] hover:bg-[#b5f222] text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Channel</span>
          </button>
        </div>
      </div>

      {/* ── MAIN MESSAGING WORKSPACE ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-[720px] rounded-3xl border border-slate-800 bg-[#070A11] overflow-hidden shadow-2xl">
        {/* Left Side: Conversations Sidebar */}
        <div className="md:col-span-4 border-r border-slate-800/80 flex flex-col h-full bg-[#0B0F19]">
          <div className="p-3.5 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff, mentors, students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8 text-slate-700" />
                <span>No active communication channels found.</span>
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(true)}
                  className="text-indigo-400 hover:underline mt-1 font-semibold"
                >
                  Start a channel
                </button>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const other = c.participantAId === currentUserId ? c.participantB : c.participantA;
                const lastMsg = c.messages[0];
                const isSelected = c.id === activeConversationId;
                const initials = other.name ? other.name.substring(0, 2).toUpperCase() : 'FC';

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectConversation(c.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/30 border-l-4 border-indigo-500 text-white'
                        : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 shadow-xs relative">
                      {initials}
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#0B0F19]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-white truncate">
                          {other.name || other.email}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(c.updatedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border font-mono uppercase ${getRoleBadgeClass(
                            other.role
                          )}`}
                        >
                          {other.role}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate leading-snug">
                        {lastMsg ? lastMsg.content : 'Channel opened.'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Channel Feed */}
        <div className="md:col-span-8 flex flex-col h-full bg-[#080C14]">
          {activeRecipient ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-3.5 border-b border-slate-800/80 bg-[#0B0F19] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-700 to-violet-600 flex items-center justify-center text-white font-mono text-xs font-bold shadow-md">
                    {activeRecipient.name?.substring(0, 2).toUpperCase() || 'FC'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{activeRecipient.name || activeRecipient.email}</span>
                      <span
                        className={`text-[9px] px-2 py-0.2 rounded-full border font-mono uppercase ${getRoleBadgeClass(
                          activeRecipient.role
                        )}`}
                      >
                        {activeRecipient.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{activeRecipient.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShareChannel}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Share channel link & details"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono text-[10px] hidden sm:inline">Share Channel</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px]">TLS-1.3 Encrypted</span>
                  </div>
                </div>
              </div>

              {/* Messages Scroll Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-[#080C14] via-[#090D18] to-[#080C14]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500">
                    <Sparkles className="w-8 h-8 text-indigo-400/40 mb-2" />
                    <span className="font-semibold text-slate-400">Direct channel open and ready.</span>
                    <span className="text-[11px] text-slate-600 mt-1">
                      Send an official directive, lecture update, or review request below.
                    </span>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === currentUserId;
                    const isCopied = copiedMessageId === m.id;

                    return (
                      <div
                        key={m.id}
                        className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-all`}
                      >
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-mono">
                            <span className="font-semibold text-slate-300">
                              {m.sender?.name || activeRecipient.name}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-indigo-400">{m.sender?.role || activeRecipient.role}</span>
                          </div>
                        )}

                        <div className="relative max-w-[85%] sm:max-w-[70%]">
                          <div
                            className={`rounded-2xl px-4 py-3 text-xs shadow-md leading-relaxed ${
                              isMe
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs font-medium'
                                : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed select-text">{m.content}</p>
                          </div>

                          {/* Quick Message Actions (Copy & Quote) */}
                          <div
                            className={`absolute -top-3 ${
                              isMe ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'
                            } opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
                          >
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m.id, m.content)}
                              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] cursor-pointer shadow-sm"
                              title="Copy message text"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuoteMessage(m.content)}
                              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] cursor-pointer shadow-sm"
                              title="Quote / reply to this message"
                            >
                              <Quote className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 px-1 font-mono">
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Fast Directives Carousel */}
              <div className="px-4 py-2 bg-[#0B0F19]/90 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] text-slate-400 uppercase font-mono shrink-0 font-bold">
                  Quick Directives:
                </span>
                {DIRECTIVE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(tmpl.text)}
                    className="shrink-0 text-[11px] px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500/60 transition-colors cursor-pointer"
                  >
                    <span className="text-indigo-400 font-semibold mr-1">[{tmpl.label}]</span>
                    <span>{tmpl.text.slice(0, 34)}...</span>
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <div className="p-3.5 bg-[#0B0F19] border-t border-slate-800 flex items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Type official directive, assignment inquiry, or message... (Enter to send)"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputContent.trim() || isPending}
                  className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Send</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
              <span className="font-semibold text-slate-400">Select or open a channel to begin messaging.</span>
              <p className="text-[11px] text-slate-600 mt-1 max-w-sm">
                Connect directly with mentors, staff officers, and students with end-to-end operational logging.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── START NEW CHANNEL MODAL ── */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0B0F19] border border-slate-800 p-6 shadow-2xl relative text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>START OPERATIONAL CHANNEL</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5 font-bold">
                  SELECT RECIPIENT (FACULTY, STAFF OR STUDENT)
                </label>
                <select
                  value={selectedMentorForNewChat}
                  onChange={(e) => setSelectedMentorForNewChat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose recipient to message --</option>
                  <optgroup label="Faculty & Administrative Staff">
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.email} ({m.role || 'Faculty'} • {m.email})
                      </option>
                    ))}
                  </optgroup>
                  {students.length > 0 && (
                    <optgroup label="Enrolled Students">
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name || s.email} (Student {s.tsId ? `• ${s.tsId}` : ''} {s.batchCode ? `• ${s.batchCode}` : ''})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartNewThread}
                  disabled={!selectedMentorForNewChat || isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-40"
                >
                  {isPending ? 'Opening...' : 'Open Channel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
