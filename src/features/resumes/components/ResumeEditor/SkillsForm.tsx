import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import type { SkillCategory } from '../../types/resume.types';
import { Plus, Trash2, X, Wrench } from 'lucide-react';

interface SkillsFormProps {
  categories: SkillCategory[];
  onAddCategory: (name?: string) => void;
  onUpdateCategory: (id: string, partial: Partial<SkillCategory>) => void;
  onDeleteCategory: (id: string) => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<SkillCategory | null>(null);

  const handleAddSkill = (catId: string) => {
    const text = (newSkillInputs[catId] || '').trim();
    if (!text) return;

    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    // Split by comma if user typed multiple skills
    const rawSkills = text.split(',').map((s) => s.trim()).filter(Boolean);
    const updatedSkills = Array.from(new Set([...cat.skills, ...rawSkills]));

    onUpdateCategory(catId, { skills: updatedSkills });
    setNewSkillInputs((prev) => ({ ...prev, [catId]: '' }));
  };

  const handleRemoveSkill = (catId: string, skillToRemove: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    onUpdateCategory(catId, {
      skills: cat.skills.filter((s) => s !== skillToRemove),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Technical Skills</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Group your competencies by category (e.g. Languages, Frameworks, Cloud).
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAddCategory('New Category')}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="p-8 text-center rounded-radius-md border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">No skill categories defined</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Create skill categories like Languages or Cloud Technologies.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onAddCategory('Languages')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add First Category
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-radius-md border border-slate-200 bg-white space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <Input
                  label="Category Name"
                  placeholder="e.g. Languages, Frameworks, Cloud"
                  value={cat.name}
                  onChange={(e) => onUpdateCategory(cat.id, { name: e.target.value })}
                  className="font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setDeleteCategoryTarget(cat)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-radius-xs hover:bg-rose-50 transition-colors mt-5 focus-ring"
                  aria-label={`Delete category ${cat.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Skills in this category (press Enter or comma to add)
                </label>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 rounded-radius-sm border border-slate-200">
                  {cat.skills.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No skills added yet</span>
                  ) : (
                    cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-radius-xs bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(cat.id, skill)}
                          aria-label={`Remove skill ${skill}`}
                          className="hover:text-rose-600 text-slate-400 transition-colors p-0.5 rounded-radius-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Input for adding new skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type skill and press Enter (or comma separated)..."
                    value={newSkillInputs[cat.id] || ''}
                    onChange={(e) =>
                      setNewSkillInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddSkill(cat.id);
                      }
                    }}
                    className="flex-1 text-xs rounded-radius-sm border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => handleAddSkill(cat.id)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={() => {
          if (deleteCategoryTarget) {
            onDeleteCategory(deleteCategoryTarget.id);
            setDeleteCategoryTarget(null);
          }
        }}
        title="Delete Skill Category"
        description={`Are you sure you want to remove "${deleteCategoryTarget?.name || 'this category'}" and all its skills? This action cannot be undone.`}
        confirmLabel="Delete Category"
        variant="danger"
      />
    </div>
  );
};
