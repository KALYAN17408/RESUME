import React, { useState, useMemo } from 'react';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type { StagedSummaryItem, StagedBulletItem, ConfirmedSkillItem } from '../hooks/useOptimizer';
import type { ApprovedChangesPayload } from '../services/resumeMergeService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import {
  Check,
  X,
  FileText,
  ListOrdered,
  Tag,
  AlertTriangle,
  History,
  Eye,
  ShieldCheck,
  CheckSquare,
  Square,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DiffComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  stagedSummary: StagedSummaryItem | null;
  stagedBullets: StagedBulletItem[];
  confirmedSkills: ConfirmedSkillItem[];
  onApplyApprovedChanges: (approvedPayload: ApprovedChangesPayload) => Promise<void>;
  isApplying?: boolean;
  isStaleResumeVersion?: boolean;
}

export const DiffComparisonModal: React.FC<DiffComparisonModalProps> = ({
  isOpen,
  onClose,
  resume,
  stagedSummary,
  stagedBullets,
  confirmedSkills,
  onApplyApprovedChanges,
  isApplying = false,
  isStaleResumeVersion = false,
}) => {
  // Selection state: Set of approved item keys
  // Summary: 'summary'
  // Bullets: 'bullet_${b.key}'
  // Skills: 'skill_${s.skill}'
  const [approvedIds, setApprovedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (stagedSummary) initial.add('summary');
    for (const b of stagedBullets) initial.add(`bullet_${b.key}`);
    for (const s of confirmedSkills) initial.add(`skill_${s.skill}`);
    return initial;
  });

  const [viewMode, setViewMode] = useState<'diff' | 'preview'>('diff');
  const [showConfirmationStep, setShowConfirmationStep] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Sync approved IDs if props change while open
  const allAvailableIds = useMemo(() => {
    const ids: string[] = [];
    if (stagedSummary) ids.push('summary');
    for (const b of stagedBullets) ids.push(`bullet_${b.key}`);
    for (const s of confirmedSkills) ids.push(`skill_${s.skill}`);
    return ids;
  }, [stagedSummary, stagedBullets, confirmedSkills]);

  if (!isOpen) return null;

  const totalAvailableCount = allAvailableIds.length;
  const selectedCount = approvedIds.size;

  const handleToggle = (id: string) => {
    setApprovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setApprovedIds(new Set(allAvailableIds));
  };

  const handleDeselectAll = () => {
    setApprovedIds(new Set());
  };

  const handleProceedToApply = () => {
    if (selectedCount === 0) return;
    setShowConfirmationStep(true);
    setActionError(null);
  };

  const handleExecuteApply = async () => {
    setActionError(null);
    try {
      const payload: ApprovedChangesPayload = {
        summary:
          stagedSummary && approvedIds.has('summary')
            ? {
                original: stagedSummary.original,
                selected: stagedSummary.selected,
                tone: stagedSummary.tone,
              }
            : null,
        bullets: stagedBullets
          .filter((b) => approvedIds.has(`bullet_${b.key}`))
          .map((b) => ({
            key: b.key,
            sourceType: b.sourceType,
            sourceId: b.sourceId,
            sourceTitle: b.sourceTitle,
            bulletIndex: b.bulletIndex,
            original: b.original,
            rewritten: b.rewritten,
            formula: b.formula,
          })),
        skills: confirmedSkills
          .filter((s) => approvedIds.has(`skill_${s.skill}`))
          .map((s) => ({
            skill: s.skill,
            category: s.category,
            suggestedSection: s.suggestedSection,
          })),
      };

      await onApplyApprovedChanges(payload);
      setShowConfirmationStep(false);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setActionError(message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isApplying && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-zinc-200 z-10 animate-fade-in overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 tracking-wider uppercase">
                Selective Merge & Approval
              </span>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                Phase 4E Safe Persist
              </Badge>
            </div>
            <h2 id="diff-modal-title" className="text-xl font-black text-zinc-900 tracking-tight mt-1">
              Review AI Optimizations for "{resume.title}"
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Compare proposed modifications against your current resume. An original version snapshot will be saved automatically before changes are merged.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-zinc-200/70 p-0.5 text-xs font-bold">
              <button
                onClick={() => setViewMode('diff')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all',
                  viewMode === 'diff'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-black'
                )}
              >
                Diff Review
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all flex items-center gap-1',
                  viewMode === 'preview'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-black'
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Result Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              disabled={isApplying}
              className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Controls Bar */}
        <div className="px-6 py-3 border-b border-zinc-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900">
              {selectedCount} of {totalAvailableCount} changes selected
            </span>
            <span className="text-zinc-300">•</span>
            <button
              onClick={handleSelectAll}
              disabled={isApplying || selectedCount === totalAvailableCount}
              className="text-zinc-600 hover:text-black font-semibold underline disabled:opacity-40"
            >
              Select All
            </button>
            <span className="text-zinc-300">•</span>
            <button
              onClick={handleDeselectAll}
              disabled={isApplying || selectedCount === 0}
              className="text-zinc-600 hover:text-black font-semibold underline disabled:opacity-40"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
            <span>Zero-loss guarantee: snapshot saved prior to update</span>
          </div>
        </div>

        {/* Error Alert */}
        {actionError && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Stale Resume Warning */}
        {isStaleResumeVersion && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Notice: Underlying Resume Was Modified Outside This Session</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                The resume was edited after this optimization session was opened. Applying these changes will overwrite the affected sections with your staged versions. An automatic snapshot will still be captured for safety.
              </p>
            </div>
          </div>
        )}

        {/* Confirmation Screen */}
        {showConfirmationStep ? (
          <div className="p-8 space-y-6 flex-1 overflow-y-auto animate-fade-in">
            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-zinc-900 text-white shadow-xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-zinc-900 flex items-center justify-center shrink-0">
                  <History className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Confirm Version Snapshot & Resume Merge
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    You are about to merge <span className="font-bold text-white">{selectedCount} approved change{selectedCount > 1 ? 's' : ''}</span> into your active resume.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-xs space-y-2">
                <p className="font-semibold text-zinc-200">Execution Safety Safeguards:</p>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
                  <li>A point-in-time snapshot of "{resume.title}" will be recorded in resume versions.</li>
                  <li>Only the {selectedCount} explicitly checked change{selectedCount > 1 ? 's' : ''} will be applied.</li>
                  <li>Unchecked or unreviewed suggestions will be discarded or left staged in memory.</li>
                  <li>Original personal info, education, and other bullet points remain completely preserved.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmationStep(false)}
                  disabled={isApplying}
                  className="text-white border-zinc-700 hover:bg-zinc-800 text-xs"
                >
                  Back to Review
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExecuteApply}
                  disabled={isApplying}
                  className="bg-white text-zinc-900 hover:bg-zinc-100 text-xs gap-1.5"
                >
                  {isApplying ? (
                    <>
                      <Spinner size="sm" />
                      <span>Creating Snapshot & Merging...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Apply to Resume</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : viewMode === 'preview' ? (
          /* Preview Result Tab */
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
              <span>This preview simulates how your resume sections will look with all currently selected changes applied.</span>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                Simulated Result
              </Badge>
            </div>

            {/* Summary Preview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Professional Summary
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-xs text-zinc-800 leading-relaxed font-serif">
                {stagedSummary && approvedIds.has('summary') ? (
                  <div>
                    <span className="font-bold text-black font-sans text-[11px] block mb-1">
                      [Updated with AI Rewrite — {stagedSummary.tone}]
                    </span>
                    {stagedSummary.selected}
                  </div>
                ) : (
                  <div>{resume.personalInfo.summary || 'No summary configured.'}</div>
                )}
              </div>
            </div>

            {/* Bullets Preview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Experience & Project Bullets
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 text-xs">
                {stagedBullets.filter((b) => approvedIds.has(`bullet_${b.key}`)).length === 0 ? (
                  <p className="text-zinc-400 italic">No bullet changes selected.</p>
                ) : (
                  stagedBullets
                    .filter((b) => approvedIds.has(`bullet_${b.key}`))
                    .map((b) => (
                      <div key={b.key} className="space-y-1">
                        <span className="text-[11px] font-bold text-zinc-700">{b.sourceTitle}:</span>
                        <p className="pl-3 border-l-2 border-black text-zinc-900 leading-relaxed">
                          • {b.rewritten}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Skills Preview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Newly Added Confirmed Skills
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-xs">
                {confirmedSkills.filter((s) => approvedIds.has(`skill_${s.skill}`)).length === 0 ? (
                  <p className="text-zinc-400 italic">No skill additions selected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {confirmedSkills
                      .filter((s) => approvedIds.has(`skill_${s.skill}`))
                      .map((s) => (
                        <span
                          key={s.skill}
                          className="px-2.5 py-1 rounded-xl bg-zinc-900 text-white font-medium text-xs flex items-center gap-1.5"
                        >
                          <Check className="w-3 h-3" />
                          <span>{s.skill}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">({s.category})</span>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Diff Review View */
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {totalAvailableCount === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 text-zinc-500 text-xs space-y-2">
                <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="font-bold text-zinc-800">No optimizations staged in memory.</p>
                <p>Stage summary rewrites, bullet improvements, or confirmed skills before opening merge review.</p>
              </div>
            ) : null}

            {/* A. Summary Comparison */}
            {stagedSummary && (
              <div className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle('summary')}
                      className="text-zinc-900 hover:text-black"
                    >
                      {approvedIds.has('summary') ? (
                        <CheckSquare className="w-5 h-5 text-black" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-400" />
                      )}
                    </button>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">Professional Summary</h3>
                      <p className="text-[11px] text-zinc-500">
                        Tone: <strong className="capitalize">{stagedSummary.tone}</strong>
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={approvedIds.has('summary') ? 'default' : 'outline'}
                    size="sm"
                    className="text-[10px] font-mono"
                  >
                    {approvedIds.has('summary') ? 'APPROVED' : 'REJECTED / SKIPPED'}
                  </Badge>
                </div>

                {/* Side-by-Side or Stacked Diff */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Original */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Original Summary
                    </span>
                    <p className="text-zinc-600 leading-relaxed font-serif">
                      {stagedSummary.original || 'No previous summary set.'}
                    </p>
                  </div>

                  {/* Optimized */}
                  <div
                    className={cn(
                      'p-4 rounded-2xl border space-y-1.5 transition-all',
                      approvedIds.has('summary')
                        ? 'bg-zinc-900 text-white border-black'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 opacity-60'
                    )}
                  >
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider',
                        approvedIds.has('summary') ? 'text-zinc-300' : 'text-zinc-400'
                      )}
                    >
                      Proposed AI Rewrite
                    </span>
                    <p
                      className={cn(
                        'leading-relaxed font-serif',
                        approvedIds.has('summary') ? 'text-white' : 'text-zinc-500'
                      )}
                    >
                      {stagedSummary.selected}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* B. Bullet Comparison */}
            {stagedBullets.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Experience & Project Bullets ({stagedBullets.length})</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {stagedBullets.map((bullet) => {
                    const isApproved = approvedIds.has(`bullet_${bullet.key}`);
                    return (
                      <div
                        key={bullet.key}
                        className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3 hover:border-zinc-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggle(`bullet_${bullet.key}`)}
                              className="text-zinc-900 hover:text-black"
                            >
                              {isApproved ? (
                                <CheckSquare className="w-5 h-5 text-black" />
                              ) : (
                                <Square className="w-5 h-5 text-zinc-400" />
                              )}
                            </button>
                            <div>
                              <span className="text-xs font-bold text-zinc-900">
                                {bullet.sourceTitle}
                              </span>
                              <span className="text-[10px] text-zinc-400 ml-2 font-mono">
                                (Bullet #{bullet.bulletIndex + 1})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {bullet.formula && (
                              <Badge variant="outline" size="sm" className="font-mono text-[9px]">
                                {bullet.formula}
                              </Badge>
                            )}
                            <Badge
                              variant={isApproved ? 'default' : 'outline'}
                              size="sm"
                              className="text-[10px] font-mono"
                            >
                              {isApproved ? 'APPROVED' : 'SKIPPED'}
                            </Badge>
                          </div>
                        </div>

                        {/* Bullet Diff */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Original
                            </span>
                            <p className="text-zinc-600 leading-relaxed">• {bullet.original}</p>
                          </div>

                          <div
                            className={cn(
                              'p-3.5 rounded-2xl border space-y-1 transition-all',
                              isApproved
                                ? 'bg-zinc-900 text-white border-black'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-500 opacity-60'
                            )}
                          >
                            <span
                              className={cn(
                                'text-[10px] font-bold uppercase tracking-wider',
                                isApproved ? 'text-zinc-300' : 'text-zinc-400'
                              )}
                            >
                              Google XYZ Rewrite
                            </span>
                            <p
                              className={cn(
                                'leading-relaxed',
                                isApproved ? 'text-white' : 'text-zinc-500'
                              )}
                            >
                              • {bullet.rewritten}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* C. Verified Skills Comparison */}
            {confirmedSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Candidate-Confirmed Skills ({confirmedSkills.length})</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Grounded in Phase 4D explicit confirmation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {confirmedSkills.map((skill) => {
                    const isApproved = approvedIds.has(`skill_${skill.skill}`);
                    return (
                      <div
                        key={skill.skill}
                        className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => handleToggle(`skill_${skill.skill}`)}
                            className="text-zinc-900 hover:text-black shrink-0"
                          >
                            {isApproved ? (
                              <CheckSquare className="w-4 h-4 text-black" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                          <div className="truncate">
                            <span className="text-xs font-bold text-zinc-900 block truncate">
                              {skill.skill}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {skill.category} • Section: {skill.suggestedSection.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={isApproved ? 'default' : 'outline'}
                          size="sm"
                          className="text-[9px] font-mono shrink-0"
                        >
                          {isApproved ? 'APPROVED' : 'SKIPPED'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isApplying}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'preview' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('diff')}
                disabled={isApplying}
                className="text-xs"
              >
                Back to Diff Review
              </Button>
            ) : null}

            {!showConfirmationStep && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleProceedToApply}
                disabled={selectedCount === 0 || isApplying}
                className="text-xs gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Approved Changes ({selectedCount})</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
