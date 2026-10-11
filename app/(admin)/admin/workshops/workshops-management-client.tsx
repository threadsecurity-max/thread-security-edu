'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Share2,
} from 'lucide-react';

export function WorkshopsManagementClient({
  initialWorkshops,
  mentors,
}: {
  initialWorkshops: any[];
  mentors: any[];
}) {
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWorkshop = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const category = formData.get('category') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const instructorName = formData.get('instructorName') as string;
    const instructorRole = formData.get('instructorRole') as string;
    const description = formData.get('description') as string;
    const driveUrl = formData.get('driveUrl') as string;
    const image = formData.get('image') as string;
    const registrationUrl = formData.get('registrationUrl') as string;
    const highlightsRaw = formData.get('highlights') as string;

    const highlights = highlightsRaw
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          category,
          date,
          time,
          instructorName,
          instructorRole,
          description,
          driveUrl,
          image,
          registrationUrl,
          highlights,
          status: 'Registration Open',
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.workshop) {
        setWorkshops([data.workshop, ...workshops]);
        setIsCreateOpen(false);
        setFeedback('Workshop published successfully.');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setError(data.error || 'Failed to create workshop');
      }
    } catch {
      setLoading(false);
      setError('Connection failure while creating workshop.');
    }
  };

  const handleUpdateWorkshop = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingWorkshop) return;
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const category = formData.get('category') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const instructorName = formData.get('instructorName') as string;
    const instructorRole = formData.get('instructorRole') as string;
    const description = formData.get('description') as string;
    const driveUrl = formData.get('driveUrl') as string;
    const image = formData.get('image') as string;
    const registrationUrl = formData.get('registrationUrl') as string;
    const highlightsRaw = formData.get('highlights') as string;

    const highlights = highlightsRaw
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/workshops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingWorkshop.id,
          title,
          subtitle,
          category,
          date,
          time,
          instructorName,
          instructorRole,
          description,
          driveUrl,
          image,
          registrationUrl,
          highlights,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.workshop) {
        setWorkshops(workshops.map((w) => (w.id === editingWorkshop.id ? data.workshop : w)));
        setEditingWorkshop(null);
        setFeedback('Workshop details updated.');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setError(data.error || 'Failed to update workshop');
      }
    } catch {
      setLoading(false);
      setError('Connection failure while updating workshop.');
    }
  };

  const handleDeleteWorkshop = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workshops?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setWorkshops(workshops.filter((w) => w.id !== id));
        setDeletingId(null);
        setFeedback('Workshop removed.');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setError(data.error || 'Failed to delete workshop');
      }
    } catch {
      setLoading(false);
      setError('Connection failure while deleting workshop.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing <strong className="text-slate-900">{workshops.length}</strong> workshops
        </span>

        <button
          onClick={() => {
            setError(null);
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Conduct New Workshop</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workshops.map((ws) => {
          const instructorName = ws.instructor?.name || ws.instructorName || 'Thread Security Faculty Lead';
          const instructorRole = ws.instructor?.role || ws.instructorRole || 'Senior Security Instructor';
          const highlightsList = Array.isArray(ws.highlights)
            ? ws.highlights
            : typeof ws.highlights === 'string'
            ? JSON.parse(ws.highlights || '[]')
            : [];

          return (
            <Card
              key={ws.id}
              className="bg-white border border-slate-200 text-slate-900 hover:border-violet-300 transition-all rounded-2xl flex flex-col justify-between shadow-xs"
            >
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="bg-violet-50 text-violet-700 border border-violet-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      {ws.category || 'Cybersecurity'}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
                      {ws.status || 'Active'}
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                    {ws.title}
                  </CardTitle>
                  <p className="text-slate-500 text-xs mt-1">{ws.subtitle}</p>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3.5 text-xs text-slate-600">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-violet-600" /> Date:
                      </span>
                      <strong className="text-slate-900">{ws.date}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Timing:
                      </span>
                      <span className="text-slate-700">{ws.time}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Instructor:
                      </span>
                      <span className="text-violet-700 font-semibold">{instructorName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Attendees:
                      </span>
                      <span className="text-slate-900 font-medium">{ws.attendeesCount || 300}+ Registered</span>
                    </div>
                  </div>

                  {highlightsList.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Key Takeaways
                      </span>
                      <ul className="space-y-1">
                        {highlightsList.slice(0, 3).map((h: string, i: number) => (
                          <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                            <span className="text-violet-600 font-bold shrink-0">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2">
                  {ws.driveUrl && (
                    <a
                      href={ws.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                      title="Google Drive Resources"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    </a>
                  )}
                  {ws.registrationUrl && (
                    <a
                      href={ws.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                      title="Registration Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-violet-600" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setError(null);
                      setEditingWorkshop(ws);
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Workshop"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(ws.id)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                    title="Delete Workshop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── CREATE WORKSHOP MODAL ── */}
      {isCreateOpen && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-xl bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                Conduct New Masterclass Workshop
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateWorkshop} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Workshop Title *</label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Active Directory Penetration Testing"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Subtitle / Tagline *</label>
                  <input
                    name="subtitle"
                    required
                    placeholder="e.g. Enterprise Domain Exploitation & BloodHound Attack Paths"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue="Red Teaming"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option value="Red Teaming">Red Teaming</option>
                    <option value="SOC Operations">SOC Operations</option>
                    <option value="Web Security">Web Security</option>
                    <option value="Cloud Defense">Cloud Defense</option>
                    <option value="AI Safety">AI Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Lead Instructor</label>
                  <select
                    name="instructorName"
                    defaultValue={mentors[0]?.user?.name || 'Thread Security Faculty Lead'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500"
                  >
                    {mentors.map((m) => (
                      <option key={m.id} value={m.user?.name || m.name}>
                        {m.user?.name || m.name}
                      </option>
                    ))}
                    <option value="Thread Security Faculty Lead">Thread Security Faculty Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Date *</label>
                  <input
                    name="date"
                    required
                    placeholder="e.g. Oct 24, 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Time &amp; Duration *</label>
                  <input
                    name="time"
                    required
                    placeholder="e.g. 7:00 PM - 9:30 PM IST"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Google Drive Resources Link</label>
                  <input
                    name="driveUrl"
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Registration Form URL</label>
                  <input
                    name="registrationUrl"
                    placeholder="https://forms.gle/... or internal URL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Key Highlights (1 per line)</label>
                  <textarea
                    name="highlights"
                    rows={3}
                    placeholder="Live Kerberoasting exploit demo&#10;Hands-on bloodhound target maps&#10;Privilege escalation labs"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 focus:bg-white resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Publish Workshop'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── EDIT WORKSHOP MODAL ── */}
      {editingWorkshop && (
        <Dialog open={!!editingWorkshop} onOpenChange={() => setEditingWorkshop(null)}>
          <DialogContent className="max-w-xl bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-violet-600" />
                Edit Workshop Details
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateWorkshop} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Workshop Title *</label>
                  <input
                    name="title"
                    defaultValue={editingWorkshop.title}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Subtitle / Tagline *</label>
                  <input
                    name="subtitle"
                    defaultValue={editingWorkshop.subtitle}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingWorkshop.category || 'Red Teaming'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option value="Red Teaming">Red Teaming</option>
                    <option value="SOC Operations">SOC Operations</option>
                    <option value="Web Security">Web Security</option>
                    <option value="Cloud Defense">Cloud Defense</option>
                    <option value="AI Safety">AI Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Lead Instructor</label>
                  <select
                    name="instructorName"
                    defaultValue={editingWorkshop.instructor?.name || editingWorkshop.instructorName || 'Thread Security Faculty Lead'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500"
                  >
                    {mentors.map((m) => (
                      <option key={m.id} value={m.user?.name || m.name}>
                        {m.user?.name || m.name}
                      </option>
                    ))}
                    <option value="Thread Security Faculty Lead">Thread Security Faculty Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Date *</label>
                  <input
                    name="date"
                    defaultValue={editingWorkshop.date}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Time &amp; Duration *</label>
                  <input
                    name="time"
                    defaultValue={editingWorkshop.time}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Google Drive Resources Link</label>
                  <input
                    name="driveUrl"
                    defaultValue={editingWorkshop.driveUrl || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Registration Form URL</label>
                  <input
                    name="registrationUrl"
                    defaultValue={editingWorkshop.registrationUrl || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-600 text-[11px] font-medium mb-1">Key Highlights (1 per line)</label>
                  <textarea
                    name="highlights"
                    rows={3}
                    defaultValue={
                      Array.isArray(editingWorkshop.highlights)
                        ? editingWorkshop.highlights.join('\n')
                        : typeof editingWorkshop.highlights === 'string'
                        ? JSON.parse(editingWorkshop.highlights || '[]').join('\n')
                        : ''
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingWorkshop(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── DELETE MODAL ── */}
      {deletingId && (
        <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
          <DialogContent className="max-w-sm bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 font-sans text-xs">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Delete Workshop
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Are you sure you want to delete this workshop? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={() => handleDeleteWorkshop(deletingId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
