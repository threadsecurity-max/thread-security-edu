'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Trash2,
  Copy,
  Edit3,
  Upload,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface QuestionBankClientProps {
  initialQuestions: any[];
  total: number;
  totalPages: number;
  categories: { id: string; name: string; slug: string }[];
  courses: { id: string; title: string }[];
  families: { id: string; familyCode: string; name: string }[];
}

export function QuestionBankClient({
  initialQuestions,
  total,
  totalPages,
  categories,
  courses,
  families,
}: QuestionBankClientProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [totalCount, setTotalCount] = useState(total);
  const [pages, setPages] = useState(totalPages);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Modals
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form State
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || '');
  const [formCourse, setFormCourse] = useState('');
  const [formFamily, setFormFamily] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formLearningObjective, setFormLearningObjective] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [formMarks, setFormMarks] = useState(1.0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formOptions, setFormOptions] = useState<
    { optionText: string; isCorrect: boolean; explanation: string }[]
  >([
    { optionText: '', isCorrect: true, explanation: '' },
    { optionText: '', isCorrect: false, explanation: '' },
    { optionText: '', isCorrect: false, explanation: '' },
    { optionText: '', isCorrect: false, explanation: '' },
  ]);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Global UX Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [globalErrorMsg, setGlobalErrorMsg] = useState<string | null>(null);

  const displaySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };
  
  const displayError = (msg: string) => {
    setGlobalErrorMsg(msg);
    setTimeout(() => setGlobalErrorMsg(null), 5000);
  };

  // Import State
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState<any | null>(null);

  const fetchQuestions = async (p = 1, cat = selectedCategory, diff = selectedDifficulty, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '15');
      if (q) params.set('search', q);
      if (cat) params.set('categoryId', cat);
      if (diff) params.set('difficulty', diff);

      const res = await fetch(`/api/admin/assessments/questions?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
        setTotalCount(json.total);
        setPages(json.totalPages);
        setPage(json.page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions(1, selectedCategory, selectedDifficulty, search);
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormText('');
    setFormCategory(categories[0]?.id || '');
    setFormCourse('');
    setFormFamily('');
    setFormTopic('');
    setFormLearningObjective('');
    setFormDifficulty('MEDIUM');
    setFormMarks(1.0);
    setFormExplanation('');
    setFormOptions([
      { optionText: '', isCorrect: true, explanation: '' },
      { optionText: '', isCorrect: false, explanation: '' },
      { optionText: '', isCorrect: false, explanation: '' },
      { optionText: '', isCorrect: false, explanation: '' },
    ]);
    setFormError('');
    setShowEditor(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setFormText(q.questionText);
    setFormCategory(q.categoryId);
    setFormCourse(q.courseId || '');
    setFormFamily(q.questionFamilyId || '');
    setFormTopic(q.topic || '');
    setFormLearningObjective(q.learningObjective || '');
    setFormDifficulty(q.difficulty);
    setFormMarks(q.marks);
    setFormExplanation(q.explanation || '');
    setFormOptions(
      q.options.map((o: any) => ({
        optionText: o.optionText,
        isCorrect: o.isCorrect,
        explanation: o.explanation || '',
      }))
    );
    setFormError('');
    setShowEditor(true);
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm('Duplicate this question?')) return;
    try {
      const res = await fetch(`/api/admin/assessments/questions/${id}/duplicate`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        displaySuccess('Question duplicated successfully');
        fetchQuestions(page);
      } else {
        displayError(json.error || 'Failed duplicating question');
      }
    } catch (err) {
      console.error(err);
      displayError('Network error while duplicating');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Archive/delete this question? It will no longer appear in new test generations.')) return;
    try {
      const res = await fetch(`/api/admin/assessments/questions/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        displaySuccess('Question deleted successfully');
        fetchQuestions(page);
      } else {
        displayError(json.error || 'Failed deleting question');
      }
    } catch (err) {
      console.error(err);
      displayError('Network error while deleting');
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formText.trim()) {
      setFormError('Question text cannot be empty');
      return;
    }
    if (!formTopic.trim()) {
      setFormError('Topic is required (e.g. CSRF, BGP Hijacking, Buffer Overflow)');
      return;
    }
    const hasCorrect = formOptions.some((o) => o.isCorrect);
    if (!hasCorrect) {
      setFormError('At least one option must be marked as correct');
      return;
    }
    const emptyOption = formOptions.some((o) => !o.optionText.trim());
    if (emptyOption) {
      setFormError('All 4 options must contain text');
      return;
    }

    setSavingQuestion(true);
    try {
      const payload = {
        questionText: formText,
        categoryId: formCategory,
        courseId: formCourse || null,
        questionFamilyId: formFamily || null,
        topic: formTopic,
        learningObjective: formLearningObjective || null,
        difficulty: formDifficulty,
        marks: Number(formMarks),
        explanation: formExplanation || null,
        options: formOptions.map((o, idx) => ({
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          explanation: o.explanation || null,
          displayOrder: idx + 1,
        })),
      };

      const url = editingQuestion
        ? `/api/admin/assessments/questions/${editingQuestion.id}`
        : `/api/admin/assessments/questions`;
      const method = editingQuestion ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        displaySuccess(editingQuestion ? 'Question updated' : 'Question created');
        setShowEditor(false);
        fetchQuestions(page);
      } else {
        setFormError(json.error || 'Save failed');
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setImportReport(null);
    try {
      let records: any[] = [];
      const trimmed = importText.trim();
      if (trimmed.startsWith('[')) {
        records = JSON.parse(trimmed);
      } else {
        // Simple CSV parser
        const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
        // Header check
        const dataLines = lines[0].toLowerCase().includes('question') ? lines.slice(1) : lines;
        records = dataLines.map((line) => {
          const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
          return {
            questionText: parts[0] || '',
            categorySlug: parts[1] || 'web-security',
            topic: parts[2] || 'General',
            difficulty: (parts[3] || 'MEDIUM').toUpperCase(),
            marks: Number(parts[4]) || 1.0,
            options: [
              { optionText: parts[5] || '', isCorrect: true },
              { optionText: parts[6] || '', isCorrect: false },
              { optionText: parts[7] || '', isCorrect: false },
              { optionText: parts[8] || '', isCorrect: false },
            ],
            explanation: parts[9] || '',
          };
        });
      }

      const res = await fetch('/api/admin/assessments/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      const json = await res.json();
      if (json.success) {
        setImportReport(json.report);
        displaySuccess(`Successfully imported ${json.report?.successful || 0} questions.`);
        fetchQuestions(1);
      } else {
        displayError(json.error || 'Import failed');
      }
    } catch (err: any) {
      displayError(`Invalid format: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {globalErrorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4" />
          {globalErrorMsg}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link
              href="/admin/assessments"
              className="hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Assessments
            </Link>
            <span>/</span>
            <span className="text-slate-200">Question Bank</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-red-500" />
            Cybersecurity Question Bank
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage question pools, multi-variant families, learning objectives, and answer keys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200"
          >
            <Upload className="w-4 h-4 mr-2 text-sky-400" />
            Bulk Import
          </Button>
          <Button
            onClick={openCreateModal}
            className="bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Question
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/80 border-slate-800 p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, topic, or question text..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                fetchQuestions(1, e.target.value, selectedDifficulty, search);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                fetchQuestions(1, selectedCategory, e.target.value, search);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <Button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-white px-4"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Filter'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Question Table / List */}
      <Card className="bg-slate-900/80 border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{questions.length}</span> of{' '}
            <span className="font-semibold text-white">{totalCount}</span> questions
          </div>
          <div>Page {page} of {pages || 1}</div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Loading questions from bank...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No questions found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search criteria or add new questions to the bank.
            </p>
            <Button
              onClick={openCreateModal}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Question
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {questions.map((q) => {
              const correctOpt = q.options?.find((o: any) => o.isCorrect);
              return (
                <div key={q.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            q.difficulty === 'EASY'
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : q.difficulty === 'MEDIUM'
                              ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                              : 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                          }
                        >
                          {q.difficulty}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-slate-700 text-slate-300 bg-slate-800"
                        >
                          {q.category?.name || 'Security'}
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono">
                          Topic: <span className="text-slate-200">{q.topic}</span>
                        </span>
                        {q.questionFamily && (
                          <Badge
                            variant="outline"
                            className="border-sky-500/40 text-sky-400 bg-sky-500/10 font-mono text-[10px]"
                          >
                            Family: {q.questionFamily.familyCode}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-500">Marks: {q.marks}</span>
                      </div>

                      <p className="text-sm font-medium text-slate-100">{q.questionText}</p>

                      {/* Options Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options?.map((opt: any, idx: number) => (
                          <div
                            key={opt.id || idx}
                            className={`text-xs px-2.5 py-1.5 rounded flex items-center gap-2 ${
                              opt.isCorrect
                                ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                                : 'bg-slate-950/40 text-slate-400 border border-slate-900'
                            }`}
                          >
                            {opt.isCorrect ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0" />
                            )}
                            <span className="truncate">{opt.optionText}</span>
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="text-xs text-slate-400 italic pt-1">
                          <span className="text-slate-500 font-semibold not-italic">Explanation:</span>{' '}
                          {q.explanation}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        onClick={() => openEditModal(q)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Edit question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDuplicate(q.id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Duplicate question"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(q.id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/20"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <Button
              onClick={() => fetchQuestions(page - 1)}
              disabled={page <= 1 || loading}
              variant="outline"
              size="sm"
              className="border-slate-800 text-slate-300"
            >
              Previous
            </Button>
            <span className="text-xs text-slate-400">
              Page {page} of {pages}
            </span>
            <Button
              onClick={() => fetchQuestions(page + 1)}
              disabled={page >= pages || loading}
              variant="outline"
              size="sm"
              className="border-slate-800 text-slate-300"
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Question Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-red-500" />
                {editingQuestion ? 'Edit Question' : 'Create Bank Question'}
              </h2>
              <button
                onClick={() => setShowEditor(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Question Text *
                </label>
                <textarea
                  rows={3}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. Which HTTP response header prevents clickjacking attacks?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Difficulty *
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Marks *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={formMarks}
                    onChange={(e) => setFormMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Topic / Concept *
                  </label>
                  <input
                    type="text"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    placeholder="e.g. CSRF, SQL Injection, Port Scanning"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Question Family (Variant Group)
                  </label>
                  <select
                    value={formFamily}
                    onChange={(e) => setFormFamily(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">None (Independent Question)</option>
                    {families.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.familyCode} - {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Learning Objective (Optional)
                </label>
                <input
                  type="text"
                  value={formLearningObjective}
                  onChange={(e) => setFormLearningObjective(e.target.value)}
                  placeholder="e.g. Understand OWASP Top 10 A01: Broken Access Control"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Options (Radio button sets the correct option) *
                </label>
                {formOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOptionRadio"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const updated = formOptions.map((o, i) => ({
                          ...o,
                          isCorrect: i === idx,
                        }));
                        setFormOptions(updated);
                      }}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt.optionText}
                      onChange={(e) => {
                        const updated = [...formOptions];
                        updated[idx].optionText = e.target.value;
                        setFormOptions(updated);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                      className={`flex-1 bg-slate-950 border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none ${
                        opt.isCorrect ? 'border-emerald-600/70 bg-emerald-950/20' : 'border-slate-800'
                      }`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Explanation (Revealed to student in post-submit review)
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Detailed rationale for the correct answer..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  variant="outline"
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingQuestion}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {savingQuestion ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : editingQuestion ? (
                    'Update Question'
                  ) : (
                    'Create Question'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-400" />
                Bulk Import Questions (JSON or CSV)
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportReport(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Paste an array of JSON objects or CSV rows. Format:{' '}
              <code className="text-slate-300 bg-slate-950 px-1 py-0.5 rounded font-mono text-[11px]">
                questionText,categorySlug,topic,difficulty,marks,opt1,opt2,opt3,opt4,explanation
              </code>
            </p>

            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`[
  {
    "questionText": "What does a WAF stand for?",
    "categorySlug": "web-security",
    "topic": "WAF",
    "difficulty": "EASY",
    "marks": 1.0,
    "options": [
      { "optionText": "Web Application Firewall", "isCorrect": true },
      { "optionText": "Wide Area Framework", "isCorrect": false },
      { "optionText": "Web Access Facilitator", "isCorrect": false },
      { "optionText": "Wireless Access Filter", "isCorrect": false }
    ],
    "explanation": "WAF inspects incoming HTTP traffic."
  }
]`}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
            />

            {importReport && (
              <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>Import Report</span>
                  <span className="text-emerald-400">
                    {importReport.successful} / {importReport.total} Succeeded
                  </span>
                </div>
                {importReport.failed > 0 && (
                  <p className="text-rose-400">Failed count: {importReport.failed}</p>
                )}
                {importReport.errors?.slice(0, 3).map((err: any, i: number) => (
                  <p key={i} className="text-rose-300 text-[11px]">
                    Row {err.index + 1}: {err.error}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportReport(null);
                }}
                variant="outline"
                className="border-slate-800 text-slate-300 text-xs"
              >
                Close
              </Button>
              <Button
                onClick={handleImportSubmit}
                disabled={importing || !importText.trim()}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Importing...
                  </>
                ) : (
                  'Run Import'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
