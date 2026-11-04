import React, { useState } from 'react';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type { RewriteBulletResult, BulletStrategy } from '../types/optimizer.types';
import type { StagedBulletItem } from '../hooks/useOptimizer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/uiStore';
import {
  Briefcase,
  FolderGit2,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Edit3,
  X,
  Undo2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface BulletRewriterCardProps {
  resume: ResumeData;
  bulletResults: Record<string, RewriteBulletResult>;
  activeBulletKey: string | null;
  isLoading: boolean;
  error: string | null;
  stagedBullets: StagedBulletItem[];
  onRewrite: (
    sourceType: 'experience' | 'project',
    sourceId: string,
    sourceTitle: string,
    bulletIndex: number,
    bulletText: string,
    strategy?: BulletStrategy
  ) => void;
  onStageBullet: (item: {
    sourceType: 'experience' | 'project';
    sourceId: string;
    sourceTitle: string;
    bulletIndex: number;
    original: string;
    rewritten: string;
    formula: string;
  }) => void;
  onUnstageBullet: (key: string) => void;
}

export const BulletRewriterCard: React.FC<BulletRewriterCardProps> = ({
  resume,
  bulletResults,
  activeBulletKey,
  isLoading,
  error,
  stagedBullets,
  onRewrite,
  onStageBullet,
  onUnstageBullet,
}) => {
  const { addToast } = useUIStore();
  const [sourceType, setSourceType] = useState<'experience' | 'project'>('experience');
  const [selectedItemId, setSelectedItemId] = useState<string>(
    resume.experiences?.[0]?.id || resume.projects?.[0]?.id || ''
  );
  const [selectedBulletIndex, setSelectedBulletIndex] = useState<number>(0);
  const [selectedStrategy, setSelectedStrategy] = useState<BulletStrategy | 'diverse'>('diverse');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [editedBulletMap, setEditedBulletMap] = useState<Record<string, string>>({});
  const [dismissedAltIds, setDismissedAltIds] = useState<Set<string>>(new Set());

  // Available experience / project items
  const experiences = resume.experiences || [];
  const projects = resume.projects || [];

  const currentItem =
    sourceType === 'experience'
      ? experiences.find((e) => e.id === selectedItemId) || experiences[0]
      : projects.find((p) => p.id === selectedItemId) || projects[0];

  const currentItemTitle = currentItem
    ? sourceType === 'experience'
      ? `${(currentItem as any).jobTitle} at ${(currentItem as any).company}`
      : (currentItem as any).name
    : 'Selected Role';

  // Bullets for current item
  const bullets: string[] = currentItem
    ? sourceType === 'experience'
      ? (currentItem as any).highlights || []
      : [(currentItem as any).description].filter(Boolean)
    : [];

  const activeBulletText = bullets[selectedBulletIndex] || '';
  const currentBulletKey = currentItem
    ? `${sourceType}_${currentItem.id}_${selectedBulletIndex}`
    : '';

  const activeResult = bulletResults[currentBulletKey];
  const stagedItem = stagedBullets.find((b) => b.key === currentBulletKey);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast({ message: 'Bullet copied to clipboard!', type: 'success' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerRewrite = () => {
    if (!currentItem || !activeBulletText) return;
    setDismissedAltIds(new Set());
    setEditingAltId(null);
    onRewrite(
      sourceType,
      currentItem.id,
      currentItemTitle,
      selectedBulletIndex,
      activeBulletText,
      selectedStrategy === 'diverse' ? undefined : selectedStrategy
    );
  };

  const handleBulletTextChange = (altId: string, val: string) => {
    setEditedBulletMap((prev) => ({
      ...prev,
      [altId]: val,
    }));
  };

  const handleResetBullet = (altId: string) => {
    setEditedBulletMap((prev) => {
      const copy = { ...prev };
      delete copy[altId];
      return copy;
    });
    addToast({ message: 'Reset bullet to generated version.', type: 'info' });
  };

  const handleDismissAlt = (altId: string) => {
    setDismissedAltIds((prev) => new Set([...prev, altId]));
    if (editingAltId === altId) {
      setEditingAltId(null);
    }
    addToast({ message: 'Dismissed bullet alternative.', type: 'info' });
  };

  const visibleAlternatives = (activeResult?.alternatives || []).filter(
    (alt) => !dismissedAltIds.has(alt.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Experience & Project Bullet Rewriter
            </h2>
            <Badge variant="outline" size="sm" className="font-mono text-[10px]">
              Google XYZ Formula
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Optimize bullet points for strong active verbs, technical specificity, and measurable impact while strictly preventing fabricated metrics.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value as any)}
            className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-semibold focus:outline-none focus:ring-1 focus:ring-black shadow-xs"
          >
            <option value="diverse">All Strategies (Diverse Rotation)</option>
            <option value="action-oriented">Action-Oriented (Strong Leadership)</option>
            <option value="impact-oriented">Impact-Oriented (Outcome & Value)</option>
            <option value="technical-oriented">Technical-Oriented (Stack & Architecture)</option>
            <option value="concise-oriented">Concise-Oriented (Zero Fluff)</option>
            <option value="achievement-oriented">Achievement-Oriented (Google XYZ)</option>
            <option value="job-targeted">Job-Targeted (JD Alignment)</option>
          </select>

          {activeBulletText && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleTriggerRewrite}
              disabled={isLoading}
              className="gap-2 shrink-0 text-xs"
            >
              {isLoading && activeBulletKey === currentBulletKey ? (
                <>
                  <Spinner size="sm" />
                  <span>Rewriting Bullet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeResult ? 'Regenerate Rewrites' : 'Rewrite Selected Bullet'}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Grounded Heuristics Explanatory Strip */}
      {activeResult?.isDeterministic && (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900">Grounded Heuristics Active</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
                Offline Safe
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              {activeResult.fallbackReason || 'Remote AI Edge Function is offline or unconfigured. Bullets were restructured using Google XYZ formula heuristics.'}
              {' '}To enable remote LLM generation, deploy: <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-900 font-mono text-[10px]">supabase functions deploy ai-optimizer</code>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Experience/Project & Bullet Selector */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-5">
          {/* Section Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
            <button
              type="button"
              onClick={() => {
                setSourceType('experience');
                setSelectedItemId(experiences[0]?.id || '');
                setSelectedBulletIndex(0);
              }}
              className={cn(
                'py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2',
                sourceType === 'experience'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              )}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Work Experience ({experiences.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceType('project');
                setSelectedItemId(projects[0]?.id || '');
                setSelectedBulletIndex(0);
              }}
              className={cn(
                'py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2',
                sourceType === 'project'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-zinc-600 hover:text-black'
              )}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Projects ({projects.length})</span>
            </button>
          </div>

          {/* Item Selector Dropdown/List */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Select {sourceType === 'experience' ? 'Position' : 'Project'}
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {sourceType === 'experience' ? (
                experiences.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => {
                      setSelectedItemId(exp.id);
                      setSelectedBulletIndex(0);
                    }}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between',
                      selectedItemId === exp.id
                        ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                        : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-800'
                    )}
                  >
                    <div className="truncate">
                      <p className="truncate">{exp.jobTitle || 'Untitled Position'}</p>
                      <p className={cn('text-[10px] font-normal truncate', selectedItemId === exp.id ? 'text-zinc-400' : 'text-zinc-500')}>
                        {exp.company || 'Company'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono shrink-0 ml-2">
                      {exp.highlights?.length || 0} bullets
                    </span>
                  </div>
                ))
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedItemId(proj.id);
                      setSelectedBulletIndex(0);
                    }}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between',
                      selectedItemId === proj.id
                        ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                        : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-800'
                    )}
                  >
                    <span className="truncate">{proj.name || 'Untitled Project'}</span>
                    <span className="text-[10px] font-mono shrink-0 ml-2">1 description</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bullet Point Selector */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Select Bullet Point to Optimize
            </label>
            {bullets.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No bullets found for this entry.</p>
            ) : (
              <div className="space-y-2">
                {bullets.map((bullet, idx) => {
                  const key = currentItem ? `${sourceType}_${currentItem.id}_${idx}` : '';
                  const isSelected = selectedBulletIndex === idx;
                  const isStaged = stagedBullets.some((b) => b.key === key);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedBulletIndex(idx)}
                      className={cn(
                        'p-3 rounded-2xl border text-xs cursor-pointer transition-all space-y-1',
                        isSelected
                          ? 'border-black bg-zinc-50 shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>Bullet #{idx + 1}</span>
                        {isStaged && (
                          <span className="text-[10px] text-zinc-900 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-black" />
                            Staged
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-800 text-xs line-clamp-2 leading-relaxed">
                        {bullet || '(Empty bullet)'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Rewrites and Comparison Workspace */}
        <div className="lg:col-span-7 space-y-4">
          {/* Selected Original Bullet Preview Card */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Original Bullet Text
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {currentItemTitle} • Bullet #{selectedBulletIndex + 1}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 leading-relaxed font-sans">
              {activeBulletText || 'No bullet text selected.'}
            </div>

            {stagedItem && (
              <div className="p-3 rounded-xl bg-zinc-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span className="font-semibold">Staged Alternative: {stagedItem.formula}</span>
                </div>
                <button
                  onClick={() => onUnstageBullet(currentBulletKey)}
                  className="text-[11px] text-zinc-400 hover:text-white underline"
                >
                  Unstage
                </button>
              </div>
            )}
          </div>

          {/* Alternatives Workspace */}
          {!activeResult && !isLoading ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 bg-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Bullet Rewrites Not Yet Generated</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Click "Rewrite Selected Bullet" to generate 3 high-impact alternatives formatted with Google's XYZ formula.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleTriggerRewrite}>
                Generate Bullet Rewrites
              </Button>
            </div>
          ) : isLoading && activeBulletKey === currentBulletKey ? (
            <div className="p-16 text-center rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-xs font-semibold text-zinc-800">
                Rewriting bullet with Google XYZ heuristic...
              </p>
              <p className="text-[11px] text-zinc-400">
                Injecting active verbs and safeguarding verified metrics
              </p>
            </div>
          ) : activeResult ? (
            visibleAlternatives.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
                <p className="text-xs font-bold text-zinc-700">All generated bullet alternatives were dismissed.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDismissedAltIds(new Set())}
                  className="text-xs"
                >
                  Restore Dismissed Rewrites
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleAlternatives.map((alt, idx) => {
                  const currentRewrittenText = editedBulletMap[alt.id] ?? alt.text;
                  const isSelectedInStaging = stagedItem?.rewritten === currentRewrittenText;
                  const isCurrentlyEditing = editingAltId === alt.id;

                  return (
                    <div
                      key={alt.id}
                      className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4 animate-fade-in"
                    >
                      {/* Alternative Title & Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                            Alternative #{idx + 1}
                          </span>
                          <Badge variant="default" size="sm" className="bg-zinc-100 text-zinc-800 text-[10px]">
                            {alt.formula} Formula
                          </Badge>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                            Verb: {alt.actionVerb}
                          </span>
                          {editedBulletMap[alt.id] && (
                            <Badge variant="outline" size="sm" className="text-[9px] bg-white text-zinc-700">
                              Custom Edited
                            </Badge>
                          )}
                        </div>

                        {activeResult.isDeterministic && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Grounded Formula
                          </span>
                        )}
                      </div>

                      {/* Rewritten Text (View vs Edit Mode) */}
                      {isCurrentlyEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={currentRewrittenText}
                            onChange={(e) => handleBulletTextChange(alt.id, e.target.value)}
                            rows={3}
                            className="w-full p-3 rounded-xl bg-white border border-zinc-300 text-xs sm:text-sm text-zinc-900 leading-relaxed font-sans focus:outline-hidden focus:ring-2 focus:ring-black"
                            placeholder="Edit bullet point and replace bracketed placeholders with real metrics..."
                          />
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => handleResetBullet(alt.id)}
                              className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                            >
                              <Undo2 className="w-3 h-3" />
                              <span>Reset to Generated</span>
                            </button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setEditingAltId(null)}
                              className="text-xs py-1 px-3"
                            >
                              Done Editing
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 leading-relaxed font-sans">
                          {currentRewrittenText}
                        </div>
                      )}

                      {/* Improvements List */}
                      {alt.improvements.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            <Zap className="w-3 h-3 text-zinc-400" />
                            <span>Applied Heuristics</span>
                          </div>
                          <ul className="text-[11px] text-zinc-600 space-y-0.5 list-disc list-inside">
                            {alt.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Placeholders / Metric Warnings */}
                      {alt.requiresConfirmation && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-950">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                            <span>Placeholder Metric Required</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Original bullet lacked quantifiable numbers. Click <strong>Edit & Fill Metric</strong> below to replace <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">[add measurable result...]</code> with your actual stats.
                          </p>
                        </div>
                      )}

                      {/* Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(alt.id, currentRewrittenText)}
                            className="gap-1.5 text-xs"
                          >
                            {copiedId === alt.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-zinc-900" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Bullet</span>
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAltId(isCurrentlyEditing ? null : alt.id)}
                            className="gap-1.5 text-xs text-zinc-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isCurrentlyEditing ? 'Done' : 'Edit & Fill Metric'}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismissAlt(alt.id)}
                            className="text-xs text-zinc-400 hover:text-rose-600 gap-1 p-2"
                            title="Dismiss this alternative"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Dismiss</span>
                          </Button>
                        </div>

                        {isSelectedInStaging ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUnstageBullet(currentBulletKey)}
                            className="gap-1.5 text-xs border-zinc-900 text-zinc-900"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                            <span>Staged (Click to Unstage)</span>
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              onStageBullet({
                                sourceType,
                                sourceId: currentItem.id,
                                sourceTitle: currentItemTitle,
                                bulletIndex: selectedBulletIndex,
                                original: activeBulletText,
                                rewritten: currentRewrittenText,
                                formula: alt.formula,
                              })
                            }
                            className="gap-1.5 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply to Staged Changes</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};
