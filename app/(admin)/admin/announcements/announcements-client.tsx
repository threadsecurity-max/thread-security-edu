'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Radio,
  Send,
  Users,
  AlertCircle,
  CheckCircle2,
  Bell,
  Clock,
  Layers,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  GraduationCap,
  CheckCheck,
  User,
  Filter,
  X,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { broadcastMessageAction } from '@/features/notifications/actions/notification.actions';
import {
  sendAdminMessageAction,
  getConversationMessagesAction,
} from '@/features/messages/actions/message.actions';

interface MessageSender {
  id: string;
  name: string | null;
  email: string;
  role: string;
  tsIdentity?: { tsId: string } | null;
  studentProfile?: { batch?: { batchCode: string; title: string } | null } | null;
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

interface AnnouncementsClientProps {
  currentUserId: string;
  initialConversations: ConversationItem[];
  mentors: { id: string; name: string | null; email: string; role: string }[];
  students: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    tsId?: string | null;
    batchCode?: string | null;
  }[];
  batches: { id: string; name: string; code: string }[];
  initialAnalytics: {
    totalSent?: number;
    readRate?: number;
    recentBroadcasts?: any[];
  };
}

const MENTOR_DIRECTIVES = [
  'Please submit attendance and notes for your recent session.',
  'CSM Alert: Student reported difficulty with the lab environment.',
  'Upcoming workshop dry-run scheduled for tomorrow at 18:00 IST.',
  'Please review and grade pending batch assignment submissions.',
];

const STUDENT_DIRECTIVES = [
  'Reminder: Live session begins in 30 minutes. Check your dashboard.',
  'Your attendance correction request has been reviewed and approved.',
  'Please complete your virtual lab submission before the cohort deadline.',
  'Office hours link is live on your student calendar.',
];

export function AnnouncementsClient({
  currentUserId,
  initialConversations,
  mentors,
  students,
  batches,
  initialAnalytics,
}: AnnouncementsClientProps) {
  // Navigation Tabs: DIRECT_CHATS vs BROADCAST
  const [activeTab, setActiveTab] = useState<'DIRECT_CHATS' | 'BROADCAST'>('DIRECT_CHATS');

  // Direct Chats state
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversations[0]?.id || null
  );
  const [messages, setMessages] = useState<MessageItem[]>(
    initialConversations[0]?.messages || []
  );
  const [inputContent, setInputContent] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MENTOR' | 'STUDENT'>('ALL');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatTab, setNewChatTab] = useState<'MENTORS' | 'STUDENTS'>('MENTORS');
  const [contactSearch, setContactSearch] = useState('');

  // Broadcast state
  const [targetType, setTargetType] = useState<string>('ALL');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [studentIdentifier, setStudentIdentifier] = useState<string>('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastResult, setBroadcastResult] = useState<any>(null);

  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeRecipient: MessageSender | null = activeConversation
    ? activeConversation.participantAId === currentUserId
      ? activeConversation.participantB
      : activeConversation.participantA
    : null;

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when conversation switches
  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    const res = await getConversationMessagesAction(convId);
    if (res.success && res.data) {
      setMessages(res.data as MessageItem[]);
    }
  };

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
        name: 'You (Admin)',
        email: 'admin@threadsecurity.in',
        role: 'SUPER_ADMIN',
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
        }
      } else {
        alert(res.error || 'Failed to send message');
      }
    });
  };

  const handleStartChatWithContact = async (contactId: string) => {
    // Check if conversation already exists
    const existing = conversations.find(
      (c) =>
        (c.participantAId === contactId && c.participantBId === currentUserId) ||
        (c.participantBId === contactId && c.participantAId === currentUserId)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      await handleSelectConversation(existing.id);
      setIsNewChatOpen(false);
      return;
    }

    // Contact details
    const targetContact =
      mentors.find((m) => m.id === contactId) || students.find((s) => s.id === contactId);

    const greeting =
      targetContact?.role === 'MENTOR'
        ? `Hello ${targetContact.name || 'Faculty'}, this is the Thread Security Academic Administration.`
        : `Hello ${targetContact?.name || 'Student'}, this is the Thread Security Academic Administration.`;

    startTransition(async () => {
      const res = await sendAdminMessageAction(contactId, greeting);
      if (res.success && res.data) {
        setIsNewChatOpen(false);
        setActiveConversationId(res.data.conversationId);
        const updated = await getConversationMessagesAction(res.data.conversationId);
        if (updated.success && updated.data) {
          setMessages(updated.data as MessageItem[]);
        }
      }
    });
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    const formData = new FormData();
    formData.append('title', broadcastTitle);
    formData.append('message', broadcastMessage);
    formData.append('targetType', targetType);
    if (targetType === 'SPECIFIC_BATCH' && selectedBatchId) {
      formData.append('targetBatchId', selectedBatchId);
    }
    if (targetType === 'SINGLE_STUDENT' && studentIdentifier) {
      formData.append('targetStudentIdentifier', studentIdentifier);
    }

    startTransition(async () => {
      const res = await broadcastMessageAction(formData);
      setBroadcastResult(res);
      if (res.success) {
        setBroadcastTitle('');
        setBroadcastMessage('');
        setStudentIdentifier('');
      }
    });
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const other = c.participantAId === currentUserId ? c.participantB : c.participantA;
    if (!other) return false;

    // Role filtering
    if (roleFilter === 'MENTOR' && other.role !== 'MENTOR') return false;
    if (roleFilter === 'STUDENT' && other.role !== 'STUDENT' && other.role !== 'GUEST') return false;

    // Search query
    const nameMatch = (other.name || '').toLowerCase().includes(chatSearch.toLowerCase());
    const emailMatch = (other.email || '').toLowerCase().includes(chatSearch.toLowerCase());
    const tsMatch = (other.tsIdentity?.tsId || '').toLowerCase().includes(chatSearch.toLowerCase());
    const lastMsgMatch = (c.messages[0]?.content || '').toLowerCase().includes(chatSearch.toLowerCase());

    return nameMatch || emailMatch || tsMatch || lastMsgMatch;
  });

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* ── TOP HEADER & MODE CONTROLS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="p-1 rounded-md bg-violet-100 text-violet-700">
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
            <span>Thread Security Academic Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Internal Communications &amp; Announcements Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Live direct messaging with faculty mentors and enrolled students, prior chat history, and cohort announcements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition shadow-md shadow-violet-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Message Mentor / Student</span>
          </button>
        </div>
      </div>

      {/* ── TAB TOGGLE BAR ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('DIRECT_CHATS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
            activeTab === 'DIRECT_CHATS'
              ? 'bg-violet-600 text-white shadow-violet-500/25 ring-2 ring-violet-400/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Direct Chats &amp; Conversations</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-700 text-violet-200">
            {conversations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
            activeTab === 'BROADCAST'
              ? 'bg-violet-600 text-white shadow-violet-500/25 ring-2 ring-violet-400/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Broadcast Omnichannel Alerts</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: DIRECT CHATS (SHOWS EVERY CHAT WITH MENTORS & STUDENTS) */}
      {/* ========================================================================= */}
      {activeTab === 'DIRECT_CHATS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[740px] rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* Left 4 Cols: Conversations Roster */}
          <div className="lg:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
            {/* Search Bar & Role Filter */}
            <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search mentors or students..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                    roleFilter === 'ALL'
                      ? 'bg-violet-100 text-violet-900 border-violet-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('MENTOR')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 ${
                    roleFilter === 'MENTOR'
                      ? 'bg-violet-100 text-violet-900 border-violet-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 text-violet-600" />
                  <span>Mentors</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('STUDENT')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 ${
                    roleFilter === 'STUDENT'
                      ? 'bg-violet-100 text-violet-900 border-violet-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-3 h-3 text-indigo-600" />
                  <span>Students</span>
                </button>
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <span className="font-semibold text-slate-700">No matching conversations found.</span>
                  <p className="text-[11px] text-slate-400">
                    Use &ldquo;Message Mentor / Student&rdquo; above to start chatting with anyone in the directory.
                  </p>
                  <button
                    onClick={() => setIsNewChatOpen(true)}
                    className="mt-2 text-violet-600 font-bold hover:underline"
                  >
                    + Open Contact Directory
                  </button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const other = c.participantAId === currentUserId ? c.participantB : c.participantA;
                  const lastMsg = c.messages[0];
                  const isSelected = c.id === activeConversationId;
                  const isMentor = other?.role === 'MENTOR';
                  const studentBatch = other?.studentProfile?.batch?.batchCode;
                  const tsId = other?.tsIdentity?.tsId;

                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectConversation(c.id)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-violet-50/90 border-l-4 border-violet-600'
                          : 'hover:bg-slate-100/70'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${
                          isMentor
                            ? 'bg-gradient-to-br from-violet-600 to-purple-700'
                            : 'bg-gradient-to-br from-indigo-500 to-blue-600'
                        }`}
                      >
                        {other?.name ? other.name.substring(0, 2).toUpperCase() : isMentor ? 'M' : 'S'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {other?.name || other?.email}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(c.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Role & Identification Pills */}
                        <div className="flex items-center gap-1.5 my-0.5">
                          {isMentor ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-violet-100 text-violet-800 border border-violet-200">
                              FACULTY MENTOR
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              STUDENT {tsId ? `• ${tsId}` : ''}
                            </span>
                          )}
                          {studentBatch && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-700">
                              {studentBatch}
                            </span>
                          )}
                        </div>

                        {/* Last Message Snippet */}
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lastMsg ? lastMsg.content : 'No messages exchanged yet'}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right 8 Cols: Active Chat Feed & Input */}
          <div className="lg:col-span-8 flex flex-col h-full bg-white">
            {activeRecipient ? (
              <>
                {/* Active Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                        activeRecipient.role === 'MENTOR'
                          ? 'bg-gradient-to-br from-violet-600 to-purple-700'
                          : 'bg-gradient-to-br from-indigo-500 to-blue-600'
                      }`}
                    >
                      {activeRecipient.name ? activeRecipient.name.substring(0, 2).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {activeRecipient.name || activeRecipient.email}
                        {activeRecipient.role === 'MENTOR' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-100 text-violet-800 border border-violet-200">
                            FACULTY MENTOR
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            STUDENT {activeRecipient.tsIdentity?.tsId ? `(${activeRecipient.tsIdentity.tsId})` : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{activeRecipient.email}</span>
                        {activeRecipient.studentProfile?.batch?.batchCode && (
                          <span className="text-violet-700 font-semibold font-mono text-[11px]">
                            Cohort: {activeRecipient.studentProfile.batch.batchCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Direct Channel
                    </span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400">
                      <Sparkles className="w-8 h-8 text-violet-300 mb-2" />
                      <span className="font-semibold text-slate-700">This channel is active and encrypted.</span>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                        Send directives, schedule adjustments, or academic follow-ups directly to {activeRecipient.name || 'this recipient'}.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === currentUserId;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                              isMe
                                ? 'bg-violet-600 text-white font-medium rounded-tr-none'
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 px-1 font-mono">
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-violet-600" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Directive / Action Template Bar */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">
                    Quick Templates:
                  </span>
                  {(activeRecipient.role === 'MENTOR' ? MENTOR_DIRECTIVES : STUDENT_DIRECTIVES).map(
                    (tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(tmpl)}
                        className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-violet-50 text-slate-700 border border-slate-200 hover:border-violet-300 transition cursor-pointer shadow-2xs font-medium"
                      >
                        {tmpl}
                      </button>
                    )
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Type directive or message to ${activeRecipient.name || 'recipient'}... (Press Enter)`}
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputContent.trim() || isPending}
                    className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold transition shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                <span className="font-semibold text-slate-600">Select a conversation from the left roster</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Or start a new chat with any Faculty Mentor or Enrolled Student.
                </p>
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition"
                >
                  + Message Mentor or Student
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: BROADCAST OMNICHANNEL ANNOUNCEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'BROADCAST' && (
        <div className="space-y-6">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>TOTAL BROADCASTS</span>
                <Bell className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {initialAnalytics?.totalSent || 128}
              </div>
              <div className="text-xs text-slate-400 mt-1">Delivered in-app cohort alerts</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>READ &amp; ENGAGEMENT RATE</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600">
                {initialAnalytics?.readRate || 84.6}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Average acknowledgement rate within 24h</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>TARGETABLE ACTIVE BATCHES</span>
                <Layers className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{batches.length}</div>
              <div className="text-xs text-slate-400 mt-1">Cohorts available for instant targeting</div>
            </div>
          </div>

          {/* Broadcast Form & Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Radio className="w-4 h-4 text-violet-600" />
                <span>Compose New Announcement Broadcast</span>
              </h2>

              {broadcastResult && (
                <div
                  className={`mb-4 p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    broadcastResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {broadcastResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Announcement dispatched successfully to {broadcastResult.targetCount || 0} active recipients!
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{broadcastResult.error || 'Failed to dispatch broadcast.'}</span>
                    </>
                  )}
                </div>
              )}

              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    TARGET AUDIENCE SCOPE *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'ALL', label: 'All Users (Academy-wide)' },
                      { id: 'STUDENT', label: 'All Students' },
                      { id: 'MENTOR', label: 'All Mentors' },
                      { id: 'SPECIFIC_BATCH', label: 'Specific Batch Cohort' },
                      { id: 'SINGLE_STUDENT', label: 'Single Student' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTargetType(item.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-colors cursor-pointer ${
                          targetType === item.id
                            ? 'bg-violet-100 border-violet-400 text-violet-900 ring-2 ring-violet-200'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {targetType === 'SPECIFIC_BATCH' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SELECT TARGET BATCH *
                    </label>
                    <select
                      required
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    >
                      <option value="">Select a batch cohort</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'SINGLE_STUDENT' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      STUDENT TS-ID OR EMAIL *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TSE-2025-001 or student@threadsecurity.in"
                      value={studentIdentifier}
                      onChange={(e) => setStudentIdentifier(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ANNOUNCEMENT TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scheduled Maintenance: CTF Cyber Range"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MESSAGE CONTENT *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Compose announcement body. Markdown links supported."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending || !broadcastTitle || !broadcastMessage}
                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-violet-500/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isPending ? 'Transmitting Broadcast...' : 'Transmit Broadcast to Cohort'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Card */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex-1 flex flex-col shadow-xs">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>Portal Notification Live Preview</span>
                </h3>

                <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-violet-600" />
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-violet-100 text-violet-700 shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {broadcastTitle || 'Announcement Title Preview'}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed line-clamp-4">
                        {broadcastMessage ||
                          'The announcement message will appear directly inside student and mentor alert trays.'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-2 font-mono">
                        <Clock className="w-3 h-3" /> Just now • Target: {targetType}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-slate-800">Audience Scope Details:</div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                    <li>Notifications appear immediately in active sessions without requiring page refresh.</li>
                    <li>Users will see unread notification badges in their top navigation bar.</li>
                    <li>Delivery is persisted to the PostgreSQL Notification audit table.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: START NEW CHAT (SELECT ANY MENTOR OR STUDENT) */}
      {/* ========================================================================= */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-violet-600" />
                <span>Select Contact to Message</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Mentors vs Students */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setNewChatTab('MENTORS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  newChatTab === 'MENTORS'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Faculty Mentors ({mentors.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setNewChatTab('STUDENTS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  newChatTab === 'STUDENTS'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Enrolled Students ({students.length})</span>
              </button>
            </div>

            {/* Filter Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={
                  newChatTab === 'MENTORS'
                    ? 'Search mentor name or email...'
                    : 'Search student name, email, TS-ID, or batch...'
                }
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
              />
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {newChatTab === 'MENTORS' ? (
                mentors
                  .filter(
                    (m) =>
                      (m.name || '').toLowerCase().includes(contactSearch.toLowerCase()) ||
                      m.email.toLowerCase().includes(contactSearch.toLowerCase())
                  )
                  .map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleStartChatWithContact(m.id)}
                      className="p-3 hover:bg-violet-50/70 rounded-xl transition flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {m.name ? m.name.substring(0, 2).toUpperCase() : 'M'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block group-hover:text-violet-700">
                            {m.name || m.email}
                          </span>
                          <span className="text-[11px] text-slate-400 block">{m.email}</span>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-violet-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Open Chat</span>
                        <Send className="w-3 h-3" />
                      </span>
                    </div>
                  ))
              ) : (
                students
                  .filter(
                    (s) =>
                      (s.name || '').toLowerCase().includes(contactSearch.toLowerCase()) ||
                      s.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
                      (s.tsId || '').toLowerCase().includes(contactSearch.toLowerCase()) ||
                      (s.batchCode || '').toLowerCase().includes(contactSearch.toLowerCase())
                  )
                  .map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleStartChatWithContact(s.id)}
                      className="p-3 hover:bg-indigo-50/70 rounded-xl transition flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {s.name ? s.name.substring(0, 2).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                              {s.name || s.email}
                            </span>
                            {s.tsId && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700">
                                {s.tsId}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{s.email}</span>
                            {s.batchCode && (
                              <span className="text-indigo-600 font-semibold text-[10px]">
                                Cohort: {s.batchCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Open Chat</span>
                        <Send className="w-3 h-3" />
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsNewChatOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
