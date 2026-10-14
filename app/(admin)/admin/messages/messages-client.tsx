'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import {
  sendAdminMessageAction,
  getConversationMessagesAction,
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
  'Please submit lecture attendance for your recent session.',
  'CSM follow-up required: Student reported difficulty with lab exercise.',
  'Upcoming workshop dry-run scheduled for tomorrow at 18:00 IST.',
  'Your office hours schedule has been drafted into batch timetable.',
];

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        email: 'admin@threadsecurity.com',
        role: 'ADMIN',
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

    // Create a new synthetic conversation or send first hello
    startTransition(async () => {
      const res = await sendAdminMessageAction(
        recipient.id,
        `Hello ${recipient.name || 'Member'}, this is the Thread Security Academic Command Center.`
      );
      if (res.success && res.data) {
        setIsNewChatOpen(false);
        setActiveConversationId(res.data.conversationId);
        // Refresh conversation list
        const updated = await getConversationMessagesAction(res.data.conversationId);
        if (updated.success && updated.data) {
          setMessages(updated.data as MessageItem[]);
        }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
              INTERNAL DIRECTIVES & MESSAGING
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-sans">
                Admin ↔ Faculty
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Encrypted, two-way operational communications and directive channels with mentors.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewChatOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          New Faculty Channel
        </button>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[720px] rounded-2xl border border-slate-800 bg-[#090D16] overflow-hidden">
        {/* Left Side: Conversations Roster */}
        <div className="md:col-span-4 border-r border-slate-800 flex flex-col h-full bg-[#0B0F19]">
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8 text-slate-700" />
                <span>No active faculty channels found.</span>
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="text-emerald-400 hover:underline mt-1"
                >
                  Start a conversation
                </button>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const other = c.participantAId === currentUserId ? c.participantB : c.participantA;
                const lastMsg = c.messages[0];
                const isSelected = c.id === activeConversationId;

                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/20 border-l-2 border-emerald-500'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                      {other.name?.substring(0, 2).toUpperCase() || 'M'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">
                          {other.name || other.email}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(c.updatedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {lastMsg ? lastMsg.content : 'No messages yet'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message Feed & Input Bar */}
        <div className="md:col-span-8 flex flex-col h-full bg-[#080C14]">
          {activeRecipient ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-3.5 border-b border-slate-800/80 bg-[#0B0F19] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xs">
                    {activeRecipient.name?.substring(0, 2).toUpperCase() || 'FC'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {activeRecipient.name || activeRecipient.email}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        {activeRecipient.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{activeRecipient.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TLS-1.3 Encrypted Channel</span>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500">
                    <Sparkles className="w-8 h-8 text-emerald-500/30 mb-2" />
                    <span>This channel is open. Send a directive or dispatch notes.</span>
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
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                            isMe
                              ? 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none'
                              : 'bg-slate-800/90 text-white rounded-tl-none border border-slate-700/60'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 px-1">
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Directive Fast Templates */}
              <div className="px-4 py-2 bg-[#0B0F19]/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] text-slate-500 uppercase font-mono shrink-0">
                  Quick Directives:
                </span>
                {DIRECTIVE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(tmpl)}
                    className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 hover:border-emerald-500/50 transition-colors"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <div className="p-3 bg-[#0B0F19] border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type official directive, batch update, or message..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputContent.trim() || isPending}
                  className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-semibold transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
              <MessageSquare className="w-10 h-10 text-slate-700 mb-2" />
              <span>Select or start a conversation to view channel history.</span>
            </div>
          )}
        </div>
      </div>

      {/* Start New Thread Modal */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0B0F19] border border-slate-800 p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white font-mono mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              SELECT FACULTY MEMBER
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  RECIPIENT (FACULTY MENTOR OR STUDENT)
                </label>
                <select
                  value={selectedMentorForNewChat}
                  onChange={(e) => setSelectedMentorForNewChat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="">Select a mentor or student to message</option>
                  <optgroup label="Faculty & Mentors">
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.email} (Faculty • {m.email})
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartNewThread}
                  disabled={!selectedMentorForNewChat || isPending}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  Open Channel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
