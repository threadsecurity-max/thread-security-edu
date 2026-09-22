'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Share2,
  FileText,
  ExternalLink,
  Plus,
  BookOpen,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { createBatchResourceAction } from '@/features/mentor/actions/mentor-workspace.actions';

export interface ResourcesClientProps {
  batch: any;
  resources: any[];
  modules: any[];
  sessions: any[];
}

export function ResourcesClient({
  batch,
  resources,
  modules,
  sessions,
}: ResourcesClientProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('PDF');
  const [url, setUrl] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-detect Google Drive file ID if a Drive URL is entered
  const extractDriveFileId = (driveUrl: string) => {
    const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const driveId = resourceType === 'DRIVE' || url.includes('drive.google.com')
      ? extractDriveFileId(url)
      : null;

    const formData = new FormData();
    formData.append('batchId', batch.id);
    formData.append('title', title);
    if (description) formData.append('description', description);
    formData.append('resourceType', resourceType);
    formData.append('url', url);
    if (driveId) formData.append('driveFileId', driveId);
    if (moduleId) formData.append('moduleId', moduleId);
    if (sessionId) formData.append('sessionId', sessionId);

    const res = await createBatchResourceAction(formData);

    setLoading(false);
    if (res.success) {
      setIsShareModalOpen(false);
      setTitle('');
      setDescription('');
      setUrl('');
      setModuleId('');
      setSessionId('');
    } else {
      setErrorMsg(res.error || 'Failed to share resource.');
    }
  };

  const filteredResources = resources.filter((r) => {
    if (filterType === 'ALL') return true;
    return r.resourceType === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#C6FF34]" />
            Learning Resources & Notes Repository ({resources.length})
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Share PDFs, lecture notes, lab assignments, and secured Google Drive resources for <strong className="text-white">{batch.batchCode}</strong>.
          </p>
        </div>

        <Button
          onClick={() => setIsShareModalOpen(true)}
          className="bg-white hover:bg-slate-200 text-black font-mono text-xs font-bold gap-2 self-start shadow-lg"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          Share New Resource
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'PDF', 'NOTES', 'DRIVE', 'ASSIGNMENT', 'DOC', 'LINK'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
              filterType === t
                ? 'bg-white text-black font-bold shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {t === 'DRIVE' ? 'Google Drive' : t}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full p-12 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center font-mono space-y-3">
            <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">No learning resources shared yet.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You can attach lecture slides, reference PDFs, cheat sheets, or Google Drive resources for your cohort students.
            </p>
            <Button
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="bg-white hover:bg-slate-200 text-black font-mono text-xs font-bold gap-1.5 mt-2 shadow-md"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              Upload First Resource
            </Button>
          </div>
        ) : (
          filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-3xl bg-[#0d0d0d] border border-white/10 hover:border-[#C6FF34]/40 transition-all shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
                    {res.resourceType}
                  </Badge>

                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(res.createdAt).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white font-sans line-clamp-1">
                    {res.title}
                  </h4>
                  {res.description && (
                    <p className="text-xs text-slate-400 font-sans line-clamp-2 mt-1">
                      {res.description}
                    </p>
                  )}
                </div>

                {/* Mapping hierarchy: Batch -> Module -> Lecture */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1 text-[11px] font-mono text-slate-300">
                  {res.module && (
                    <p className="truncate">
                      Module: <strong className="text-white">{res.module.title}</strong>
                    </p>
                  )}
                  {res.session && (
                    <p className="truncate">
                      Lecture: <strong className="text-[#C6FF34]">{res.session.title}</strong>
                    </p>
                  )}
                  {res.driveFileId && (
                    <p className="text-[10px] text-cyan-300 truncate">
                      Google Drive Attached (ID: {res.driveFileId.slice(0, 12)}...)
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400">
                  ● Visible to Batch Students
                </span>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#C6FF34] hover:underline"
                >
                  Open Asset
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Share Resource Modal */}
      {isShareModalOpen && (
        <Dialog open={true} onOpenChange={() => setIsShareModalOpen(false)}>
          <DialogContent className="max-w-lg bg-[#0a0a0a] border border-white/20 text-white p-6 rounded-2xl shadow-2xl font-mono">
            <DialogHeader className="border-b border-white/10 pb-3">
              <Badge className="w-fit bg-[#C6FF34]/15 text-[#C6FF34] text-[10px] mb-1">
                ATTACH TEACHING RESOURCE
              </Badge>
              <DialogTitle className="text-base font-bold text-white">
                Share Learning Resource
              </DialogTitle>
              <p className="text-xs text-slate-400">
                Target Cohort: <strong className="text-white">{batch.batchCode}</strong>
              </p>
            </DialogHeader>

            <form onSubmit={handleShareSubmit} className="space-y-4 pt-3 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1">Resource Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wireshark PCAP Filters & Threat Hunting Cheat Sheet"
                  className="bg-[#141414] border-white/20 text-white text-xs font-mono focus:border-[#C6FF34]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Resource Type</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/20 text-white text-xs font-mono outline-none focus:border-[#C6FF34]"
                  >
                    <option value="PDF" className="bg-[#141414] text-white">PDF Document</option>
                    <option value="NOTES" className="bg-[#141414] text-white">Lecture Notes</option>
                    <option value="DRIVE" className="bg-[#141414] text-white">Google Drive File / Folder</option>
                    <option value="PRESENTATION" className="bg-[#141414] text-white">Slides / Presentation</option>
                    <option value="ASSIGNMENT" className="bg-[#141414] text-white">Lab Assignment</option>
                    <option value="LINK" className="bg-[#141414] text-white">External Reference Link</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Associate Module</label>
                  <select
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/20 text-white text-xs font-mono outline-none focus:border-[#C6FF34]"
                  >
                    <option value="" className="bg-[#141414] text-white">-- Optional Module --</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#141414] text-white">
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Associate Lecture / Session</label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/20 text-white text-xs font-mono outline-none focus:border-[#C6FF34]"
                >
                  <option value="" className="bg-[#141414] text-white">-- Optional Lecture Session --</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#141414] text-white">
                      Session {s.sessionNumber}: {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  Resource URL / Google Drive Link *
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or https://..."
                  className="bg-[#141414] border-white/20 text-white text-xs font-mono focus:border-[#C6FF34]"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Safe Integration: Only approved links and public/view permissions are saved as metadata.
                </span>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description (Optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note or instructions for students..."
                  rows={2}
                  className="bg-[#141414] border-white/20 text-white text-xs font-mono focus:border-[#C6FF34]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-white hover:bg-slate-200 text-black font-bold text-xs gap-1.5 shadow-md"
                >
                  {loading ? 'Sharing...' : 'Publish to Students'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
