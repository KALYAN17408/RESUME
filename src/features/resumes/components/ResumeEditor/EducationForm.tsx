import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import type { EducationItem } from '../../types/resume.types';
import { Plus, Trash2, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';

interface EducationFormProps {
  educations: EducationItem[];
  onAdd: () => void;
  onUpdate: (id: string, partial: Partial<EducationItem>) => void;
  onDelete: (id: string) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  educations,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    educations[0]?.id || null
  );
  const [deleteTarget, setDeleteTarget] = useState<EducationItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Education</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Degrees, academic institutions, and notable achievements.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onAdd}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Education
        </Button>
      </div>

      {educations.length === 0 ? (
        <div className="p-8 text-center rounded-radius-md border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">No education entries added yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add your university, college, or academic degrees.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Education
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {educations.map((edu, index) => {
            const isExpanded = expandedId === edu.id;
            return (
              <div
                key={edu.id}
                className="rounded-radius-md border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
              >
                {/* Header preview row */}
                <div className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between transition-colors">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`edu-body-${edu.id}`}
                    onClick={() => setExpandedId(isExpanded ? null : edu.id)}
                    className="flex-1 flex items-center gap-2.5 text-left focus-ring rounded-radius-xs"
                  >
                    <span className="w-6 h-6 rounded-radius-xs bg-slate-200/80 text-slate-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {edu.degree || 'Degree / Major'}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {edu.institution || 'University Name'} • {edu.startDate || 'Start Date'} – {edu.current ? 'Present' : edu.endDate || 'Grad Date'}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(edu)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-radius-xs hover:bg-rose-50 transition-colors focus-ring"
                      aria-label={`Delete education ${edu.degree || 'entry'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`edu-body-${edu.id}`}
                      aria-label={isExpanded ? 'Collapse education section' : 'Expand education section'}
                      onClick={() => setExpandedId(isExpanded ? null : edu.id)}
                      className="text-slate-400 p-1 rounded-radius-xs hover:text-slate-700 focus-ring"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                {isExpanded && (
                  <div id={`edu-body-${edu.id}`} className="p-4 space-y-3.5 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Degree / Major"
                        placeholder="e.g. B.S. in Computer Science"
                        value={edu.degree}
                        onChange={(e) => onUpdate(edu.id, { degree: e.target.value })}
                      />
                      <Input
                        label="Institution / University"
                        placeholder="e.g. UC Berkeley"
                        value={edu.institution}
                        onChange={(e) => onUpdate(edu.id, { institution: e.target.value })}
                      />
                      <Input
                        label="Location"
                        placeholder="e.g. Berkeley, CA"
                        value={edu.location}
                        onChange={(e) => onUpdate(edu.id, { location: e.target.value })}
                      />
                      <Input
                        label="GPA / Grade"
                        placeholder="e.g. 3.85 / 4.0 (optional)"
                        value={edu.gpa || ''}
                        onChange={(e) => onUpdate(edu.id, { gpa: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <Input
                        label="Start Date"
                        type="text"
                        placeholder="YYYY-MM (e.g. 2018-08)"
                        value={edu.startDate}
                        onChange={(e) => onUpdate(edu.id, { startDate: e.target.value })}
                      />

                      <div className="space-y-1.5">
                        <Input
                          label="Graduation Date"
                          type="text"
                          placeholder="YYYY-MM (e.g. 2022-05)"
                          value={edu.current ? 'Present' : edu.endDate}
                          disabled={edu.current}
                          onChange={(e) => onUpdate(edu.id, { endDate: e.target.value })}
                        />
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={edu.current || false}
                            onChange={(e) =>
                              onUpdate(edu.id, {
                                current: e.target.checked,
                                endDate: e.target.checked ? '' : edu.endDate,
                              })
                            }
                            className="rounded-radius-xs border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                          />
                          <span className="text-xs text-slate-700 font-medium">
                            Currently enrolled
                          </span>
                        </label>
                      </div>
                    </div>

                    <Input
                      label="Honors & Distinctions"
                      placeholder="e.g. Magna Cum Laude, Dean's Honors List"
                      value={edu.honors || ''}
                      onChange={(e) => onUpdate(edu.id, { honors: e.target.value })}
                    />

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Relevant Coursework & Activities
                      </label>
                      <textarea
                        rows={2}
                        value={edu.description || ''}
                        placeholder="e.g. Algorithms & Data Structures, Distributed Systems, Database Management..."
                        onChange={(e) => onUpdate(edu.id, { description: e.target.value })}
                        className="w-full text-xs rounded-radius-sm border border-slate-300 p-2.5 text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                      />
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
        title="Delete Education"
        description={`Are you sure you want to remove "${deleteTarget?.degree || 'this education entry'}"? This action cannot be undone.`}
        confirmLabel="Delete Education"
        variant="danger"
      />
    </div>
  );
};
