'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Radio,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  History,
} from 'lucide-react';
import { sendBatchBroadcastAction } from '@/features/mentor/actions/mentor-workspace.actions';

export interface BroadcastClientProps {
  batch: any;
  broadcasts: any[];
}

export function BroadcastClient({ batch, broadcasts }: BroadcastClientProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const studentsCount = batch.students?.length || 0;

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('batchId', batch.id);
    formData.append('title', title);
    formData.append('message', message);
    if (attachmentUrl) formData.append('attachmentUrl', attachmentUrl);

    const res = await sendBatchBroadcastAction(formData);

    setLoading(false);
    if (res.success) {
      setSuccessMsg(`Broadcast successfully sent to ${studentsCount} enrolled students.`);
      setTitle('');
      setMessage('');
      setAttachmentUrl('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to dispatch broadcast.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#C6FF34]" />
            One-Way Faculty Broadcast Dispatcher
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Send urgent announcements, lecture reminders, and lab guidance directly to students in <strong className="text-white">{batch.batchCode}</strong>.
          </p>
        </div>

        <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 font-mono text-xs self-start">
          ● Target: {studentsCount} Enrolled Students
        </Badge>
      </div>

      {/* Broadcast Rule Alert */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#C6FF34] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block">Strict One-Way Faculty Communication Rule:</strong>
          <p className="text-slate-400 mt-0.5">
            This broadcast mechanism is strictly one-way announcements. Students receive notifications and dashboard banners with zero reply/chat friction to maintain educational focus.
          </p>
        </div>
      </div>

      {/* Grid: Composer (Left) + Broadcast History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Broadcast Composer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-[#C6FF34]" />
                Compose Announcement
              </h3>
              <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] text-[10px]">
                {batch.batchCode}
              </Badge>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Announcement Subject / Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tomorrow's Lecture: Hands-on Packet Analysis Lab Setup"
                  className="bg-[#141414] border-white/20 text-white text-xs font-mono focus:border-[#C6FF34]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Message Content *</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Tomorrow's session will cover Network Reconnaissance. Please ensure Wireshark is installed and review Module 02 slides before class."
                  rows={6}
                  className="bg-[#141414] border-white/20 text-white text-xs font-mono focus:border-[#C6FF34]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  Attachment or Reference Link (Optional)
                </label>
                <Input
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://..."
                  className="bg-[#141414] border-white/20 text-white text-xs font-mono focus:border-[#C6FF34]"
                />
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Recipients: <strong className="text-white">{studentsCount} Enrolled Students</strong>
                </span>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-white hover:bg-slate-200 text-black font-bold text-xs gap-1.5 shadow-lg"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  {loading ? 'Dispatching...' : 'Send Broadcast'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Broadcast History */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <History className="w-4 h-4 text-[#C6FF34]" />
                Broadcast Dispatch History ({broadcasts.length})
              </h3>
              <span className="text-xs font-mono text-slate-400">Archived Announcements</span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {broadcasts.length === 0 ? (
                <p className="p-8 text-center text-xs font-mono text-slate-500">
                  No broadcasts have been sent to this batch yet.
                </p>
              ) : (
                broadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-sans line-clamp-1">
                        {b.title}
                      </span>
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[9px]">
                        ✓ {b.deliveryStatus}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 font-sans whitespace-pre-line line-clamp-3">
                      {b.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
                      <span>
                        Sent:{' '}
                        <strong className="text-slate-200">
                          {new Date(b.createdAt).toLocaleDateString(undefined, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </strong>
                      </span>
                      <span>
                        Recipients: <strong className="text-[#C6FF34]">{b.recipientsCount} Students</strong>
                      </span>
                    </div>

                    {b.attachmentUrl && (
                      <a
                        href={b.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline pt-1"
                      >
                        Attachment Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
