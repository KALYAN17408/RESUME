import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import type { ExperienceItem } from '../../types/resume.types';
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';

interface ExperienceFormProps {
  experiences: ExperienceItem[];
  onAdd: () => void;
  onUpdate: (id: string, partial: Partial<ExperienceItem>) => void;
  onDelete: (id: string) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experiences,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    experiences[0]?.id || null
  );
  const [deleteTarget, setDeleteTarget] = useState<ExperienceItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Work Experience</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            List your employment history in reverse chronological order.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onAdd();
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Role
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="p-8 text-center rounded-radius-md border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">No work experiences added yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add your current or previous positions to populate your resume.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, index) => {
            const isExpanded = expandedId === exp.id;
            return (
              <div
                key={exp.id}
                className="rounded-radius-md border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
              >
                {/* Accessible Accordion Header */}
                <div className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between transition-colors">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`exp-body-${exp.id}`}
                    onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                    className="flex-1 flex items-center gap-2.5 text-left focus-ring rounded-radius-xs"
                  >
                    <span className="w-6 h-6 rounded-radius-xs bg-slate-200/80 text-slate-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {exp.jobTitle || 'New Position'}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {exp.company || 'Company Name'} • {exp.startDate || 'Start Date'} – {exp.current ? 'Present' : exp.endDate || 'End Date'}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(exp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-radius-xs hover:bg-rose-50 transition-colors focus-ring"
                      aria-label={`Delete position ${exp.jobTitle || 'role'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`exp-body-${exp.id}`}
                      aria-label={isExpanded ? 'Collapse role section' : 'Expand role section'}
                      onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                      className="text-slate-400 p-1 rounded-radius-xs hover:text-slate-700 focus-ring"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                {isExpanded && (
                  <div id={`exp-body-${exp.id}`} className="p-4 space-y-3.5 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Job Title"
                        placeholder="e.g. Senior Frontend Engineer"
                        value={exp.jobTitle}
                        onChange={(e) => onUpdate(exp.id, { jobTitle: e.target.value })}
                      />
                      <Input
                        label="Company / Employer"
                        placeholder="e.g. Acme Corp"
                        value={exp.company}
                        onChange={(e) => onUpdate(exp.id, { company: e.target.value })}
                      />
                      <Input
                        label="Location"
                        placeholder="e.g. New York, NY (or Remote)"
                        value={exp.location}
                        onChange={(e) => onUpdate(exp.id, { location: e.target.value })}
                      />
                      <Input
                        label="Employment Type"
                        placeholder="e.g. Full-time, Contract, Internship"
                        value={exp.employmentType || ''}
                        onChange={(e) => onUpdate(exp.id, { employmentType: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <Input
                        label="Start Date"
                        type="text"
                        placeholder="YYYY-MM (e.g. 2022-01)"
                        value={exp.startDate}
                        onChange={(e) => onUpdate(exp.id, { startDate: e.target.value })}
                      />

                      <div className="space-y-1.5">
                        <Input
                          label="End Date"
                          type="text"
                          placeholder="YYYY-MM (e.g. 2024-06)"
                          value={exp.current ? 'Present' : exp.endDate}
                          disabled={exp.current}
                          onChange={(e) => onUpdate(exp.id, { endDate: e.target.value })}
                        />
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) =>
                              onUpdate(exp.id, {
                                current: e.target.checked,
                                endDate: e.target.checked ? '' : exp.endDate,
                              })
                            }
                            className="rounded-radius-xs border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                          />
                          <span className="text-xs text-slate-700 font-medium">
                            I currently work here
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Bullet Highlights */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Key Achievements & Responsibilities (Google XYZ Formula)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdate(exp.id, {
                              highlights: [...exp.highlights, ''],
                            });
                          }}
                          className="text-xs text-slate-900 font-semibold hover:underline flex items-center gap-1 focus-ring rounded-radius-xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Bullet
                        </button>
                      </div>

                      <div className="space-y-2">
                        {exp.highlights.map((highlight, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2">
                            <span className="text-xs text-slate-400 mt-2.5 font-bold">•</span>
                            <textarea
                              rows={2}
                              value={highlight}
                              placeholder="Accomplished [X] as measured by [Y], by doing [Z]..."
                              onChange={(e) => {
                                const newHighlights = [...exp.highlights];
                                newHighlights[hIdx] = e.target.value;
                                onUpdate(exp.id, { highlights: newHighlights });
                              }}
                              className="flex-1 text-xs rounded-radius-sm border border-slate-200 p-2.5 text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newHighlights = exp.highlights.filter((_, idx) => idx !== hIdx);
                                onUpdate(exp.id, { highlights: newHighlights });
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 transition-colors focus-ring rounded-radius-xs"
                              aria-label={`Delete highlight bullet ${hIdx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Position"
        description={`Are you sure you want to remove "${deleteTarget?.jobTitle || 'this role'}"? This action cannot be undone.`}
        confirmLabel="Delete Role"
        variant="danger"
      />
    </div>
  );
};
