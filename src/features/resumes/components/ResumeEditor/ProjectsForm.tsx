import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import type { ProjectItem } from '../../types/resume.types';
import { Plus, Trash2, ChevronDown, ChevronUp, FolderGit2 } from 'lucide-react';

interface ProjectsFormProps {
  projects: ProjectItem[];
  onAdd: () => void;
  onUpdate: (id: string, partial: Partial<ProjectItem>) => void;
  onDelete: (id: string) => void;
}

export const ProjectsForm: React.FC<ProjectsFormProps> = ({
  projects,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    projects[0]?.id || null
  );
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Personal & Open Source Projects</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Highlight technical initiatives demonstrating hands-on architectural experience.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onAdd}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center rounded-radius-md border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">No projects added yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add engineering projects, side initiatives, or open-source repositories.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Project
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((proj, index) => {
            const isExpanded = expandedId === proj.id;
            return (
              <div
                key={proj.id}
                className="rounded-radius-md border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
              >
                {/* Header preview row */}
                <div className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between transition-colors">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`proj-body-${proj.id}`}
                    onClick={() => setExpandedId(isExpanded ? null : proj.id)}
                    className="flex-1 flex items-center gap-2.5 text-left focus-ring rounded-radius-xs"
                  >
                    <span className="w-6 h-6 rounded-radius-xs bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {proj.name || 'New Project'}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {proj.technologies.length > 0 ? proj.technologies.join(', ') : 'Technologies not specified'}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(proj)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-radius-xs hover:bg-rose-50 transition-colors focus-ring"
                      aria-label={`Delete project ${proj.name || 'project'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`proj-body-${proj.id}`}
                      aria-label={isExpanded ? 'Collapse project section' : 'Expand project section'}
                      onClick={() => setExpandedId(isExpanded ? null : proj.id)}
                      className="text-slate-400 p-1 rounded-radius-xs hover:text-slate-700 focus-ring"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                {isExpanded && (
                  <div id={`proj-body-${proj.id}`} className="p-4 space-y-3.5 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Project Name"
                        placeholder="e.g. PulseQueue"
                        value={proj.name}
                        onChange={(e) => onUpdate(proj.id, { name: e.target.value })}
                      />
                      <Input
                        label="Technologies (comma separated)"
                        placeholder="e.g. Go, Redis, Docker, AWS"
                        value={proj.technologies.join(', ')}
                        onChange={(e) =>
                          onUpdate(proj.id, {
                            technologies: e.target.value
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                      <Input
                        label="Live URL / Demo"
                        placeholder="https://example.com"
                        value={proj.url || ''}
                        onChange={(e) => onUpdate(proj.id, { url: e.target.value })}
                      />
                      <Input
                        label="GitHub Repository URL"
                        placeholder="https://github.com/..."
                        value={proj.githubUrl || ''}
                        onChange={(e) => onUpdate(proj.id, { githubUrl: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Start Date (Optional)"
                        placeholder="YYYY-MM (e.g. 2023-01)"
                        value={proj.startDate || ''}
                        onChange={(e) => onUpdate(proj.id, { startDate: e.target.value })}
                      />
                      <Input
                        label="End Date (Optional)"
                        placeholder="YYYY-MM (e.g. 2023-06)"
                        value={proj.endDate || ''}
                        onChange={(e) => onUpdate(proj.id, { endDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Project Description & Technical Impact
                      </label>
                      <textarea
                        rows={3}
                        value={proj.description}
                        placeholder="Engineered high-throughput background queue handling 50k requests/min with automatic backoff..."
                        onChange={(e) => onUpdate(proj.id, { description: e.target.value })}
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
        title="Delete Project"
        description={`Are you sure you want to remove project "${deleteTarget?.name || 'this project'}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
        variant="danger"
      />
    </div>
  );
};
