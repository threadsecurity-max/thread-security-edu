'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Layers,
  Plus,
  ArrowLeft,
  HelpCircle,
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
} from 'lucide-react';

interface FamilyQuestion {
  id: string;
  difficulty: string;
  questionText: string;
  status: string;
}

interface QuestionFamilyItem {
  id: string;
  code: string;
  name: string;
  topic?: string | null;
  description?: string | null;
  _count?: {
    questions: number;
  };
  questions: FamilyQuestion[];
}

interface FamiliesClientProps {
  initialFamilies: QuestionFamilyItem[];
}

export function FamiliesClient({ initialFamilies }: FamiliesClientProps) {
  const [families, setFamilies] = useState<QuestionFamilyItem[]>(initialFamilies);
  const [showModal, setShowModal] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setCode('');
    setName('');
    setTopic('');
    setDescription('');
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim() || !name.trim()) {
      setError('Family code and name are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/assessments/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          topic: topic.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFamilies((prev) => [...prev, { ...json.data, questions: [], _count: { questions: 0 } }]);
        setShowModal(false);
      } else {
        setError(json.error || 'Failed creating family');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
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
            <span className="text-slate-200">Question Families</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-red-500" />
            Question Families & Concept Variants
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Group equivalent question variants testing identical cybersecurity concepts. The blueprint engine deduplicates families so a student never sees two variants of the same concept in one attempt.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-red-600 hover:bg-red-700 text-white font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Family
        </Button>
      </div>

      {/* Info Callout */}
      <Card className="bg-slate-900/60 border-slate-800 p-4 border-l-4 border-l-sky-500">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">How Question Variant Deduplication Works</p>
            <p>
              When a test has <strong className="text-sky-300">Prevent Duplicate Families: ON</strong>, the randomizer selects at most one variant per family. For example, if a family contains 3 variants of SQL Injection testing Union-based exploitation, Student A gets Variant 1, Student B gets Variant 2, but neither student receives more than one.
            </p>
          </div>
        </div>
      </Card>

      {/* Families List */}
      <div className="space-y-4">
        {families.map((fam) => (
          <Card key={fam.id} className="bg-slate-900/80 border-slate-800 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <code className="text-sm font-bold text-sky-400 bg-sky-950/40 border border-sky-800/50 px-2 py-0.5 rounded font-mono">
                  {fam.code}
                </code>
                <div>
                  <h3 className="text-base font-semibold text-white">{fam.name}</h3>
                  {fam.topic && (
                    <span className="text-xs text-slate-400">
                      Topic: <span className="text-slate-200">{fam.topic}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-slate-700 text-slate-300 bg-slate-800 text-xs"
                >
                  {fam.questions.length} Variants Linked
                </Badge>
                <Link href={`/admin/assessments/question-bank?familyId=${fam.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs"
                  >
                    View In Bank
                  </Button>
                </Link>
              </div>
            </div>

            {fam.description && (
              <p className="text-xs text-slate-400 mt-2">{fam.description}</p>
            )}

            {/* Linked Variants Preview */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Concept Variants (Randomized 1 per student)
              </h4>
              {fam.questions.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No question variants attached to this family yet. Assign this family code when editing or adding questions in the Question Bank.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {fam.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">
                          Variant #{idx + 1}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            q.difficulty === 'EASY'
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]'
                              : q.difficulty === 'MEDIUM'
                              ? 'border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px]'
                              : 'border-rose-500/40 text-rose-400 bg-rose-500/10 text-[10px]'
                          }
                        >
                          {q.difficulty}
                        </Badge>
                      </div>
                      <p className="text-slate-300 line-clamp-2">{q.questionText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-500" />
                Create Question Family
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Family Code (e.g. AUTH-001, SQLI-001) *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="AUTH-001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Family Concept Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Multi-Factor Authentication Mechanics"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Topic / Subtopic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Authentication"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Concept Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the common concept tested across variants in this family..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Creating...
                    </>
                  ) : (
                    'Create Family'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
