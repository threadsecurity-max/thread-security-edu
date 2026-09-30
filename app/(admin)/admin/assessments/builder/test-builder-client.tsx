'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Save,
  Send,
  Loader2,
  Trash2,
  Plus,
  HelpCircle,
} from 'lucide-react';

export interface CourseOption {
  id: string;
  title: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface TestBuilderClientProps {
  initialTest?: any;
  courses: CourseOption[];
  categories: CategoryOption[];
}

export function TestBuilderClient({ initialTest, courses, categories }: TestBuilderClientProps) {
  const router = useRouter();
  const isEditing = !!initialTest;

  // Section 1: Basic Information
  const [title, setTitle] = useState(initialTest?.title || '');
  const [slug, setSlug] = useState(initialTest?.slug || '');
  const [courseId, setCourseId] = useState(initialTest?.courseId || courses[0]?.id || '');
  const [categoryId, setCategoryId] = useState(initialTest?.categoryId || categories[0]?.id || '');
  const [description, setDescription] = useState(initialTest?.description || '');
  const [instructions, setInstructions] = useState(initialTest?.instructions || '');
  const [durationMinutes, setDurationMinutes] = useState(initialTest?.durationMinutes || 30);
  const [questionsPerAttempt, setQuestionsPerAttempt] = useState(initialTest?.questionsPerAttempt || 10);
  const [totalMarks, setTotalMarks] = useState(initialTest?.totalMarks || 20);
  const [passingScore, setPassingScore] = useState(initialTest?.passingScore || 70);
  const [maxAttempts, setMaxAttempts] = useState(initialTest?.maxAttempts ?? 3);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(initialTest?.status || 'DRAFT');

  // Section 2: Randomization & Anti-Cheating Switches
  const [randomQuestionSelection, setRandomQuestionSelection] = useState(
    initialTest?.randomQuestionSelection ?? true
  );
  const [randomQuestionOrder, setRandomQuestionOrder] = useState(
    initialTest?.randomQuestionOrder ?? true
  );
  const [randomOptionOrder, setRandomOptionOrder] = useState(
    initialTest?.randomOptionOrder ?? true
  );
  const [difficultyBalancing, setDifficultyBalancing] = useState(
    initialTest?.difficultyBalancing ?? true
  );
  const [categoryBalancing, setCategoryBalancing] = useState(
    initialTest?.categoryBalancing ?? true
  );
  const [questionVariants, setQuestionVariants] = useState(
    initialTest?.questionVariants ?? true
  );
  const [preventDuplicateFamilies, setPreventDuplicateFamilies] = useState(
    initialTest?.preventDuplicateFamilies ?? true
  );
  const [autoSave, setAutoSave] = useState(initialTest?.autoSave ?? true);
  const [autoSubmit, setAutoSubmit] = useState(initialTest?.autoSubmit ?? true);
  const [fullScreen, setFullScreen] = useState(initialTest?.fullScreen ?? false);
  const [tabSwitchDetection, setTabSwitchDetection] = useState(
    initialTest?.tabSwitchDetection ?? true
  );
  const [copyPasteRestriction, setCopyPasteRestriction] = useState(
    initialTest?.copyPasteRestriction ?? true
  );
  const [rightClickRestriction, setRightClickRestriction] = useState(
    initialTest?.rightClickRestriction ?? true
  );

  // Section 3: Difficulty Balancing
  const [easyPercent, setEasyPercent] = useState<number>(initialTest?.easyPercent ?? 40);
  const [mediumPercent, setMediumPercent] = useState<number>(initialTest?.mediumPercent ?? 40);
  const [hardPercent, setHardPercent] = useState<number>(initialTest?.hardPercent ?? 20);

  // Section 4: Category Distributions
  const [categoryDistributions, setCategoryDistributions] = useState<
    Array<{ categoryId: string; percentage: number }>
  >(() => {
    if (initialTest?.categoryDistributionJson) {
      try {
        return JSON.parse(initialTest.categoryDistributionJson);
      } catch {
        // fallback
      }
    }
    return categories.slice(0, 3).map((c, i) => ({
      categoryId: c.id,
      percentage: i === 0 ? 40 : 30,
    }));
  });

  // State & Loading
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live Math Validations
  const difficultySum = Math.round(Number(easyPercent) + Number(mediumPercent) + Number(hardPercent));
  const isDifficultyValid = !difficultyBalancing || difficultySum === 100;

  const categorySum = Math.round(
    categoryDistributions.reduce((acc, c) => acc + (Number(c.percentage) || 0), 0)
  );
  const isCategoryValid = !categoryBalancing || categorySum === 100;

  const handleAddCategoryRow = () => {
    const unselected = categories.find((c) => !categoryDistributions.some((d) => d.categoryId === c.id));
    if (unselected) {
      setCategoryDistributions([...categoryDistributions, { categoryId: unselected.id, percentage: 10 }]);
    }
  };

  const handleRemoveCategoryRow = (idx: number) => {
    setCategoryDistributions(categoryDistributions.filter((_, i) => i !== idx));
  };

  const handleUpdateCategoryPercentage = (idx: number, percentage: number) => {
    setCategoryDistributions(
      categoryDistributions.map((item, i) => (i === idx ? { ...item, percentage } : item))
    );
  };

  const handleUpdateCategorySelection = (idx: number, categoryId: string) => {
    setCategoryDistributions(
      categoryDistributions.map((item, i) => (i === idx ? { ...item, categoryId } : item))
    );
  };

  const handleSave = async (publishImmediately = false) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg('Test title is required.');
      return;
    }
    if (!courseId) {
      setErrorMsg('Course is required.');
      return;
    }
    if (!isDifficultyValid) {
      setErrorMsg(`Difficulty distribution must total 100% (currently ${difficultySum}%).`);
      return;
    }
    if (!isCategoryValid) {
      setErrorMsg(`Category distribution must total 100% (currently ${categorySum}%).`);
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        courseId,
        categoryId: categoryId || undefined,
        description: description.trim(),
        instructions: instructions.trim() || undefined,
        durationMinutes: Number(durationMinutes),
        questionsPerAttempt: Number(questionsPerAttempt),
        totalMarks: Number(totalMarks),
        passingScore: Number(passingScore),
        maxAttempts: Number(maxAttempts),
        status: publishImmediately ? 'PUBLISHED' : status,

        // Settings
        randomQuestionSelection,
        randomQuestionOrder,
        randomOptionOrder,
        difficultyBalancing,
        categoryBalancing,
        questionVariants,
        preventDuplicateFamilies,
        autoSave,
        autoSubmit,
        fullScreen,
        tabSwitchDetection,
        copyPasteRestriction,
        rightClickRestriction,

        // Blueprint
        easyPercent: Number(easyPercent),
        mediumPercent: Number(mediumPercent),
        hardPercent: Number(hardPercent),
        categoryDistribution: categoryDistributions,
      };

      const url = isEditing ? `/api/admin/assessments/${initialTest.id}` : '/api/admin/assessments';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed saving test');
      }

      setSuccessMsg(
        isEditing
          ? 'Assessment test updated successfully!'
          : 'Assessment test created successfully!'
      );

      setTimeout(() => {
        router.push('/admin/assessments');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving assessment');
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-sans">
      {/* Back button */}
      <div>
        <Link
          href="/admin/assessments"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO ASSESSMENTS OVERVIEW</span>
        </Link>
      </div>

      <div className="flex items-center justify-between border-b border-red-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 font-mono tracking-tight">
            {isEditing ? 'EDIT ASSESSMENT TEST & BLUEPRINT' : 'CREATE ASSESSMENT TEST & BLUEPRINT'}
          </h1>
          <p className="text-xs text-slate-600 font-mono mt-0.5">
            Configure test metadata, randomized variant constraints, and anti-cheating rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </Button>

          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving || !isDifficultyValid || !isCategoryValid}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Publish Test</span>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── SECTION 1: BASIC INFORMATION ── */}
      <Card className="p-6 bg-white border border-red-200/70 rounded-2xl shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-slate-900 font-mono tracking-tight uppercase">
            1. Basic Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-slate-700 font-bold block">Test Title *</label>
            <input
              type="text"
              placeholder="e.g. Offensive Security & Web VAPT Qualification Exam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Associated Course *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-sm cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Primary Domain Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-sm cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-slate-700 font-bold block">Short Description</label>
            <textarea
              rows={2}
              placeholder="Brief summary displayed on student cards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-slate-700 font-bold block">Assessment Instructions &amp; Rules</label>
            <textarea
              rows={3}
              placeholder="Guidelines for students prior to starting..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Duration (Minutes)</label>
            <input
              type="number"
              min={5}
              max={300}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Questions Per Attempt</label>
            <input
              type="number"
              min={1}
              max={100}
              value={questionsPerAttempt}
              onChange={(e) => setQuestionsPerAttempt(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Total Marks</label>
            <input
              type="number"
              min={1}
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Passing Percentage (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Max Attempts (0 for unlimited)</label>
            <input
              type="number"
              min={0}
              max={20}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Publishing Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-sm cursor-pointer"
            >
              <option value="DRAFT">DRAFT (Hidden from students)</option>
              <option value="PUBLISHED">PUBLISHED (Active in course)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── SECTION 2: DIFFICULTY BALANCING ── */}
      <Card className="p-6 bg-white border border-red-200/70 rounded-2xl shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 font-mono tracking-tight uppercase">
              2. Difficulty Distribution UI
            </h2>
          </div>

          {/* Live Validation Pill */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500">Total:</span>
            <Badge
              className={
                difficultySum === 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-rose-50 text-rose-700 border-rose-300'
              }
            >
              {difficultySum}% {difficultySum === 100 ? '✓ Valid' : '✕ Must Equal 100%'}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-mono">
          The engine deterministically selects questions matching these exact proportions for every student.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Easy Difficulty</span>
              <span className="font-bold text-slate-900">{easyPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={easyPercent}
              onChange={(e) => setEasyPercent(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              ~{Math.round((questionsPerAttempt * easyPercent) / 100)} Questions
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Medium Difficulty</span>
              <span className="font-bold text-slate-900">{mediumPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={mediumPercent}
              onChange={(e) => setMediumPercent(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              ~{Math.round((questionsPerAttempt * mediumPercent) / 100)} Questions
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Hard Difficulty</span>
              <span className="font-bold text-slate-900">{hardPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={hardPercent}
              onChange={(e) => setHardPercent(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              ~{Math.round((questionsPerAttempt * hardPercent) / 100)} Questions
            </span>
          </div>
        </div>
      </Card>

      {/* ── SECTION 3: CATEGORY BLUEPRINT UI ── */}
      <Card className="p-6 bg-white border border-red-200/70 rounded-2xl shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 font-mono tracking-tight uppercase">
              3. Category Blueprint UI
            </h2>
          </div>

          {/* Live Validation Pill */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500">Total:</span>
            <Badge
              className={
                categorySum === 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-rose-50 text-rose-700 border-rose-300'
              }
            >
              {categorySum}% {categorySum === 100 ? '✓ Valid' : '✕ Must Equal 100%'}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-mono">
          Specify exact domain percentages. Configured dynamically against available categories in the database.
        </p>

        <div className="space-y-3 font-mono text-xs">
          {categoryDistributions.map((row, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
            >
              <select
                value={row.categoryId}
                onChange={(e) => handleUpdateCategorySelection(idx, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-sans text-xs cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 w-36">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={row.percentage}
                  onChange={(e) => handleUpdateCategoryPercentage(idx, Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white text-center font-bold text-xs"
                />
                <span className="text-slate-500">%</span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveCategoryRow(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                title="Remove Domain"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {categoryDistributions.length < categories.length && (
            <button
              type="button"
              onClick={handleAddCategoryRow}
              className="w-full py-2 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category Requirement</span>
            </button>
          )}
        </div>
      </Card>

      {/* ── SECTION 4: RANDOMIZATION & ANTI-CHEATING TOGGLES ── */}
      <Card className="p-6 bg-white border border-red-200/70 rounded-2xl shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-slate-900 font-mono tracking-tight uppercase">
            4. Randomization &amp; Proctoring Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono">
          {[
            {
              label: 'Random Question Selection',
              desc: 'Draws different questions for each attempt matching blueprint',
              value: randomQuestionSelection,
              set: setRandomQuestionSelection,
            },
            {
              label: 'Random Question Order',
              desc: 'Shuffles presentation sequence of questions for each attempt',
              value: randomQuestionOrder,
              set: setRandomQuestionOrder,
            },
            {
              label: 'Random Option Order',
              desc: 'Shuffles answer choice order (A, B, C, D) for each question',
              value: randomOptionOrder,
              set: setRandomOptionOrder,
            },
            {
              label: 'Difficulty Balancing',
              desc: 'Enforces strict Easy/Medium/Hard percentage quotas',
              value: difficultyBalancing,
              set: setDifficultyBalancing,
            },
            {
              label: 'Category Balancing',
              desc: 'Enforces domain category distribution percentages',
              value: categoryBalancing,
              set: setCategoryBalancing,
            },
            {
              label: 'Question Variants (Families)',
              desc: 'Selects 1 variant per family to test concepts without repetition',
              value: questionVariants,
              set: setQuestionVariants,
            },
            {
              label: 'Prevent Duplicate Families',
              desc: 'Guarantees no two questions from the same family in 1 attempt',
              value: preventDuplicateFamilies,
              set: setPreventDuplicateFamilies,
            },
            {
              label: 'Real-time Server Auto-Save',
              desc: 'Syncs every answer immediately to authoritative backend',
              value: autoSave,
              set: setAutoSave,
            },
            {
              label: 'Auto-Submit on Timer Expiry',
              desc: 'Submits attempt automatically when countdown reaches 0:00',
              value: autoSubmit,
              set: setAutoSubmit,
            },
            {
              label: 'Full Screen Proctoring',
              desc: 'Prompts student to take exam in distraction-free fullscreen',
              value: fullScreen,
              set: setFullScreen,
            },
            {
              label: 'Tab Switch & Blur Auditing',
              desc: 'Logs tab switches and window blur events in audit timeline',
              value: tabSwitchDetection,
              set: setTabSwitchDetection,
            },
            {
              label: 'Clipboard Restriction Guard',
              desc: 'Restricts copy/paste actions within examination room',
              value: copyPasteRestriction,
              set: setCopyPasteRestriction,
            },
            {
              label: 'Context Menu Restriction',
              desc: 'Disables right-click context menu within test room',
              value: rightClickRestriction,
              set: setRightClickRestriction,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.set(!item.value)}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 flex items-start justify-between gap-3 cursor-pointer select-none"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block text-xs">{item.label}</span>
                <span className="text-[10px] text-slate-500 font-sans block">{item.desc}</span>
              </div>

              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 mt-0.5 ${
                  item.value ? 'bg-slate-900' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    item.value ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── FOOTER ACTIONS ── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Link href="/admin/assessments">
          <Button variant="outline" className="font-mono text-xs font-bold border-slate-200">
            Cancel
          </Button>
        </Link>

        <Button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save As Draft</span>
        </Button>

        <Button
          onClick={() => handleSave(true)}
          disabled={isSaving || !isDifficultyValid || !isCategoryValid}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Validate &amp; Publish Test</span>
        </Button>
      </div>
    </div>
  );
}
