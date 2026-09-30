'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Edit3,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  _count?: {
    questions: number;
    assessments: number;
  };
}

interface CategoriesClientProps {
  initialCategories: CategoryItem[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsActive(true);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
    setError('');
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      const res = await fetch(`/api/admin/assessments/categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
        );
      } else {
        alert(json.error || 'Failed updating status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required');
      return;
    }

    setSaving(true);
    try {
      const url = editingCategory
        ? `/api/admin/assessments/categories/${editingCategory.id}`
        : '/api/admin/assessments/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          isActive,
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (editingCategory) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? { ...c, ...json.data } : c))
          );
        } else {
          setCategories((prev) => [...prev, json.data]);
        }
        setShowModal(false);
      } else {
        setError(json.error || 'Failed saving category');
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
            <span className="text-slate-200">Categories</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-red-500" />
            Assessment Domains & Categories
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure dynamic cybersecurity assessment categories (Red Teaming, Blue Teaming, VAPT, DevSecOps, etc.).
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-red-600 hover:bg-red-700 text-white font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className="bg-slate-900/80 border-slate-800 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-semibold text-white">{cat.name}</h3>
                  <code className="text-xs text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">
                    {cat.slug}
                  </code>
                </div>
                <Badge
                  variant="outline"
                  className={
                    cat.isActive
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                      : 'border-slate-700 text-slate-500 bg-slate-800'
                  }
                >
                  {cat.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                {cat.description || 'No description provided.'}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <div>
                  <span className="font-semibold text-slate-200">
                    {cat._count?.questions ?? 0}
                  </span>{' '}
                  Bank Questions
                </div>
                <div>
                  <span className="font-semibold text-slate-200">
                    {cat._count?.assessments ?? 0}
                  </span>{' '}
                  Assessments
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/60">
              <Button
                onClick={() => handleToggleActive(cat)}
                variant="ghost"
                size="sm"
                className={`text-xs ${
                  cat.isActive
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/20'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20'
                }`}
              >
                {cat.isActive ? 'Deactivate' : 'Activate'}
              </Button>

              <Button
                onClick={() => openEditModal(cat)}
                variant="outline"
                size="sm"
                className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-red-500" />
                {editingCategory ? 'Edit Category' : 'New Assessment Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cloud Security"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Slug (URL / Blueprint Identifier) *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. cloud-security"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of skills assessed in this domain..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="categoryIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-red-600 w-4 h-4 rounded cursor-pointer"
                />
                <label
                  htmlFor="categoryIsActive"
                  className="text-xs text-slate-300 cursor-pointer"
                >
                  Active for test blueprint selection
                </label>
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
                      Saving...
                    </>
                  ) : editingCategory ? (
                    'Update Category'
                  ) : (
                    'Create Category'
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
