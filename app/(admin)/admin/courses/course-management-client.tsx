'use client';

import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
} from '@/features/courses/actions/course.actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CourseManagementClientProps {
  courses: any[];
  mentors: any[];
}

export function CourseManagementClient({ courses, mentors }: CourseManagementClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const categories = ['ALL', 'VAPT', 'Cloud Security', 'SOC & Blue Team', 'DevSecOps', 'AI Security'];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createCourseAction(formData);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg({ text: 'Course published successfully to catalogue.' });
      setIsAddOpen(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg({ text: res.error || 'Failed to create course.', error: true });
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCourse) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateCourseAction(editingCourse.id, formData);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg({ text: 'Course details updated successfully.' });
      setEditingCourse(null);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg({ text: res.error || 'Failed to update course.', error: true });
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove course "${title}"?`)) return;
    setLoading(true);

    const res = await deleteCourseAction(courseId);
    setLoading(false);

    if (res.success) {
      setFeedbackMsg({ text: `Course "${title}" removed successfully.` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg({ text: res.error || 'Failed to delete course.', error: true });
    }
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-600" />
            Course Curriculum &amp; Batch Dependency ({courses.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage course catalogue. Academic batches are strictly assigned to and depend on these courses.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedbackMsg.error
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-violet-50 border-violet-200 text-violet-800'
          }`}
        >
          {feedbackMsg.error ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses or categories..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-violet-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-violet-50 text-violet-700 border border-violet-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((c) => {
          const dependentBatches = c.batches || [];
          return (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all flex flex-col justify-between shadow-xs space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-semibold">
                    {c.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    c.status === 'PUBLISHED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.subtitle || c.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Level:</span>
                    <strong className="text-slate-800">{c.level}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="text-slate-700 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {c.durationHours} Hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Faculty Lead:</span>
                    <span className="text-slate-700 font-medium">
                      {c.mentor?.user?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-violet-600" />
                      Dependent Batches:
                    </span>
                    <strong className="text-violet-700 font-bold">
                      {dependentBatches.length} Cohort(s)
                    </strong>
                  </div>
                </div>

                {dependentBatches.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Batches on this course:</span>
                    <div className="flex flex-wrap gap-1">
                      {dependentBatches.map((b: any) => (
                        <span key={b.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-medium">
                          {b.batchCode}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setEditingCourse(c)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Course</span>
                </button>

                <button
                  onClick={() => handleDeleteCourse(c.id, c.title)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                  title="Delete Course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CREATE COURSE MODAL ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-600" />
              Publish New Course
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCourse} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Course Title *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Advanced Network Penetration Testing"
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                <select
                  name="category"
                  defaultValue="VAPT"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                >
                  <option value="VAPT">VAPT &amp; Web Security</option>
                  <option value="Cloud Security">Cloud Security</option>
                  <option value="SOC &amp; Blue Team">SOC &amp; Blue Team</option>
                  <option value="DevSecOps">DevSecOps</option>
                  <option value="AI Security">AI Security</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Level</label>
                <select
                  name="level"
                  defaultValue="INTERMEDIATE"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  name="durationHours"
                  defaultValue="24"
                  min="1"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Faculty Lead</label>
                <select
                  name="mentorId"
                  defaultValue=""
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600"
                >
                  <option value="">-- Unassigned --</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user?.name || m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subtitle / Overview *</label>
              <textarea
                name="subtitle"
                rows={2}
                placeholder="Key learning outcomes and syllabus coverage..."
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-violet-600 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish Course'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── EDIT COURSE MODAL (Task 3) ── */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
          <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 shadow-xl rounded-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-violet-600" />
                Edit Course: {editingCourse.title}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateCourse} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingCourse.title}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                  <select
                    name="category"
                    defaultValue={editingCourse.category}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs"
                  >
                    <option value="VAPT">VAPT &amp; Web Security</option>
                    <option value="Cloud Security">Cloud Security</option>
                    <option value="SOC &amp; Blue Team">SOC &amp; Blue Team</option>
                    <option value="DevSecOps">DevSecOps</option>
                    <option value="AI Security">AI Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Level</label>
                  <select
                    name="level"
                    defaultValue={editingCourse.level}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    name="durationHours"
                    defaultValue={editingCourse.durationHours}
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingCourse.status}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="REVIEW">Under Review</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Faculty Lead</label>
                <select
                  name="mentorId"
                  defaultValue={editingCourse.mentorId || ''}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs"
                >
                  <option value="">-- Unassigned --</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user?.name || m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subtitle / Overview</label>
                <textarea
                  name="subtitle"
                  rows={2}
                  defaultValue={editingCourse.subtitle || editingCourse.description}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
