import React, { useState } from 'react';
import type { OptimizeSummaryResult } from '../types/optimizer.types';
import type { StagedSummaryItem } from '../hooks/useOptimizer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/uiStore';
import {
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Tag,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SummaryOptimizerCardProps {
  originalSummary: string;
  summaryResult: OptimizeSummaryResult | null;
  isLoading: boolean;
  error: string | null;
  stagedSummary: StagedSummaryItem | null;
  onGenerate: () => void;
  onStage: (text: string, tone: string) => void;
  onUnstage: () => void;
}

export const SummaryOptimizerCard: React.FC<SummaryOptimizerCardProps> = ({
  originalSummary,
  summaryResult,
  isLoading,
  error,
  stagedSummary,
  onGenerate,
  onStage,
  onUnstage,
}) => {
  const { addToast } = useUIStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedToneTab, setSelectedToneTab] = useState<string>('impact-driven');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast({ message: 'Summary copied to clipboard!', type: 'success' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const alternatives = summaryResult?.alternatives || [];
  const activeAlternative =
    alternatives.find((a) => a.tone === selectedToneTab) || alternatives[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation CTA */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              AI Professional Summary Optimizer
            </h2>
            {summaryResult?.isDeterministic && (
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                Grounded Heuristics
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Craft 2–3 truthful, role-tailored summaries aligned with target job specifications without hallucinating qualifications.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onGenerate}
          disabled={isLoading}
          className="gap-2 shrink-0 text-xs"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" />
              <span>Optimizing Summary...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{summaryResult ? 'Regenerate Summaries' : 'Generate Summary Rewrites'}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Original vs Generated */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Original Summary */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Current Resume Summary
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {originalSummary ? `${originalSummary.length} chars` : 'Empty'}
            </span>
          </div>

          {originalSummary ? (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed font-sans">
              {originalSummary}
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 text-center space-y-1">
              <p className="text-xs font-bold text-zinc-700">No Summary in Active Resume</p>
              <p className="text-[11px] text-zinc-500">
                ResuMax AI will construct a verified, tailored summary using your skills and experience.
              </p>
            </div>
          )}

          {stagedSummary && (
            <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-zinc-100">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Staged for Resume Apply
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                  {stagedSummary.tone}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 line-clamp-3">
                {stagedSummary.selected}
              </p>
              <div className="pt-1 flex justify-end">
                <button
                  onClick={onUnstage}
                  className="text-[11px] text-zinc-400 hover:text-white underline"
                >
                  Remove from Staging
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Alternatives Workspace */}
        <div className="lg:col-span-7 space-y-4">
          {!summaryResult && !isLoading ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 bg-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Summary Alternatives Not Yet Generated</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Click "Generate Summary Rewrites" above to evaluate and generate 3 role-tailored summary variations.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onGenerate}>
                Run Summary Optimizer
              </Button>
            </div>
          ) : isLoading ? (
            <div className="p-16 text-center rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-xs font-semibold text-zinc-800">
                Grounding summary alternatives on target role and verified skills...
              </p>
              <p className="text-[11px] text-zinc-400">
                Enforcing Google XYZ formula and truthfulness safeguards
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-5">
              {/* Tone Selection Tabs */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex gap-2">
                  {alternatives.map((alt) => (
                    <button
                      key={alt.id}
                      onClick={() => setSelectedToneTab(alt.tone)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize flex items-center gap-1.5',
                        selectedToneTab === alt.tone
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
                      )}
                    >
                      <span>{alt.tone.replace('-', ' ')}</span>
                      {stagedSummary?.selected === alt.text && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onGenerate}
                  className="text-xs text-zinc-500 hover:text-black gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Regenerate</span>
                </Button>
              </div>

              {/* Active Alternative Card */}
              {activeAlternative && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <p className="text-xs sm:text-sm text-zinc-900 leading-relaxed font-sans">
                      {activeAlternative.text}
                    </p>

                    {/* Keywords Used */}
                    {activeAlternative.keywordsUsed.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-200/60">
                        <Tag className="w-3 h-3 text-zinc-400" />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">
                          Keywords:
                        </span>
                        {activeAlternative.keywordsUsed.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-800"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rationale & Insights */}
                  <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200 flex items-start gap-2 text-[11px] text-zinc-600">
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-zinc-800">Strategy Rationale: </span>
                      <span>{activeAlternative.rationale}</span>
                    </div>
                  </div>

                  {/* Placeholders / Confirmation Warnings */}
                  {activeAlternative.requiresConfirmation && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Requires Metric Confirmation</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        To protect candidate truthfulness, placeholders like <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">[add measurable impact...]</code> were inserted instead of inventing fake statistics. Verify before finalizing.
                      </p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(activeAlternative.id, activeAlternative.text)}
                      className="gap-1.5 text-xs"
                    >
                      {copiedId === activeAlternative.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-zinc-900" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </Button>

                    {stagedSummary?.selected === activeAlternative.text ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onUnstage}
                        className="gap-1.5 text-xs border-zinc-900 text-zinc-900"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        <span>Staged (Click to Unstage)</span>
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onStage(activeAlternative.text, activeAlternative.tone)}
                        className="gap-1.5 text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply to Staged Changes</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
