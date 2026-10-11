'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  FolderGit2,
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
          image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
          driveUrl,
          registrationUrl,
          description,
          highlights,
          instructorName,
          instructorRole,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.workshop) {
        setWorkshops([data.workshop, ...workshops]);
        setFeedback('✓ New cybersecurity workshop launched successfully!');
        setIsCreateOpen(false);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setError(data.error || 'Failed to create workshop.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Network error creating workshop.');
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
          image,
          driveUrl,
          registrationUrl,
          description,
          highlights,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.workshop) {
        setWorkshops(workshops.map((w) => (w.id === editingWorkshop.id ? data.workshop : w)));
        setFeedback('✓ Workshop details updated in database!');
        setEditingWorkshop(null);
        setTimeout(() => setFeedback(null), 2500);
      } else {
        setError(data.error || 'Failed to update workshop.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error updating workshop.');
    }
  };

  const handleDeleteWorkshop = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove workshop "${title}"?`)) return;
    try {
      const res = await fetch(`/api/workshops?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setWorkshops(workshops.filter((w) => w.id !== id));
        setFeedback('✓ Workshop deleted successfully.');
        setTimeout(() => setFeedback(null), 2500);
      } else {
        alert(data.error || 'Failed to delete workshop.');
      }
    } catch {
      alert('Network error deleting workshop.');
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Action Bar */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Conducted &amp; Scheduled Masterclasses ({workshops.length})
          </h2>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Administer live adversary simulation masterclasses, set registration status, and upload resource drive links.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Conduct New Workshop</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workshops.map((ws) => {
          const instructorName = ws.instructor?.name || ws.instructorName || 'Thread Security Lead';
          const instructorRole = ws.instructor?.role || ws.instructorRole || 'Senior Security Instructor';
          const highlightsList = Array.isArray(ws.highlights)
            ? ws.highlights
            : typeof ws.highlights === 'string'
            ? JSON.parse(ws.highlights || '[]')
            : [];

          return (
            <Card
              key={ws.id}
              className="bg-[#0B0F19]/90 border border-slate-850 text-slate-100 hover:border-emerald-500/40 transition-all rounded-2xl flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            >
              <div>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {ws.category || 'Red Teaming'}
                    </Badge>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                      {ws.status || 'Registration Open'}
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold text-white font-mono leading-tight">
                    {ws.title}
                  </CardTitle>
                  <p className="text-slate-400 text-xs mt-1">{ws.subtitle}</p>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3.5 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date:
                      </span>
                      <strong className="text-white">{ws.date}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Timing:
                      </span>
                      <span className="text-slate-200">{ws.time}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Lead Instructor:
                      </span>
                      <span className="text-emerald-400 font-bold">{instructorName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Attendees:
                      </span>
                      <span className="text-white font-bold">{ws.attendeesCount || 300}+ Registered</span>
                    </div>
                  </div>

                  {highlightsList.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Key Highlights:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                        {highlightsList.slice(0, 2).map((h: string, idx: number) => (
                          <li key={idx} className="truncate">{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {ws.driveUrl && (
                    <a
                      href={ws.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-bold inline-flex items-center gap-1"
                      title="Google Drive Resource Folder"
                    >
                      <FolderGit2 className="w-3 h-3 text-cyan-400" />
                      <span>Drive</span>
                    </a>
                  )}

                  <a
                    href="/workshops"
                    target="_blank"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-bold inline-flex items-center gap-1"
                    title="View Public Page"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span>Preview</span>
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setError(null);
                      setEditingWorkshop(ws);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-emerald-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteWorkshop(ws.id, ws.title)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/50 cursor-pointer"
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

      {/* ── CREATE WORKSHOP DIALOG ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Conduct &amp; Publish New Workshop
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateWorkshop} className="space-y-3.5 pt-2 max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Workshop Title *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Adversary Simulation Masterclass: Active Directory Defense"
                required
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Category *</label>
                <select
                  name="category"
                  defaultValue="Red Teaming"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="Red Teaming">Red Teaming</option>
                  <option value="Cloud & eBPF">Cloud &amp; eBPF</option>
                  <option value="AI Security">AI Security</option>
                  <option value="Active Directory">Active Directory</option>
                  <option value="Threat Hunting">Threat Hunting</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Subtitle / Campus Venue</label>
                <input
                  type="text"
                  name="subtitle"
                  placeholder="e.g. Live Hands-on Lab & Masterclass"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Date String *</label>
                <input
                  type="text"
                  name="date"
                  placeholder="e.g. Nov 14, 2026"
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Timing Window *</label>
                <input
                  type="text"
                  name="time"
                  defaultValue="6:00 PM - 9:00 PM IST"
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Select Faculty Instructor from Mentors Roster */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Lead Instructor (Faculty Roster)</label>
                <select
                  name="instructorName"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="Thread Security Lead">Thread Security Lead</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.user?.name || m.title}>
                      {m.user?.name || m.title} ({m.title || 'Instructor'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Instructor Role</label>
                <input
                  type="text"
                  name="instructorRole"
                  defaultValue="Senior Security Instructor"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Banner Image URL</label>
                <input
                  type="text"
                  name="image"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Google Drive Resource Link</label>
                <input
                  type="text"
                  name="driveUrl"
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Description &amp; Syllabus</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Detailed curriculum overview, tools used, and outcomes..."
                required
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Key Highlights (1 per line)</label>
              <textarea
                name="highlights"
                rows={3}
                placeholder={"Live execution of Kerberoasting attacks\nEDR memory unhooking demonstration\nVerified Completion Certificate issued"}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                {loading ? 'Publishing...' : 'Conduct & Publish Workshop'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── EDIT WORKSHOP DIALOG ── */}
      {editingWorkshop && (
        <Dialog open={!!editingWorkshop} onOpenChange={(open) => !open && setEditingWorkshop(null)}>
          <DialogContent className="max-w-xl bg-[#0B0F19] border border-slate-800 text-slate-100 shadow-2xl rounded-2xl p-6 font-mono text-xs">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                Edit Workshop: {editingWorkshop.title}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateWorkshop} className="space-y-3.5 pt-2 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Workshop Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingWorkshop.title}
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingWorkshop.category}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    defaultValue={editingWorkshop.subtitle}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Date</label>
                  <input
                    type="text"
                    name="date"
                    defaultValue={editingWorkshop.date}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Timing</label>
                  <input
                    type="text"
                    name="time"
                    defaultValue={editingWorkshop.time}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Drive Folder Link</label>
                <input
                  type="text"
                  name="driveUrl"
                  defaultValue={editingWorkshop.driveUrl || ''}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] font-bold mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingWorkshop.description}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingWorkshop(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Workshop'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
