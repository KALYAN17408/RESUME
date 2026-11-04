import React, { useState } from 'react';
import type { SuggestKeywordsResult, SuggestedKeyword, UserTriageStatus } from '../types/optimizer.types';
import type { ConfirmedSkillItem } from '../hooks/useOptimizer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/uiStore';
import {
  Tag,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Check,
  Compass,
  Layers,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface KeywordSuggestionsCardProps {
  keywordResult: SuggestKeywordsResult | null;
  isLoading: boolean;
  error: string | null;
  confirmedSkills: ConfirmedSkillItem[];
  learningGoals: string[];
  rejectedKeywords: string[];
  onAnalyze: () => void;
  onTriage: (
    term: string,
    category: string,
    status: UserTriageStatus,
    suggestedSection: 'skills' | 'experience' | 'summary' | 'projects'
  ) => void;
  onStageSkill: (skill: string, category: string, suggestedSection?: 'skills' | 'experience' | 'summary' | 'projects') => void;
  onUnstageSkill: (skill: string) => void;
}

export const KeywordSuggestionsCard: React.FC<KeywordSuggestionsCardProps> = ({
  keywordResult,
  isLoading,
  error,
  confirmedSkills,
  learningGoals,
  rejectedKeywords,
  onAnalyze,
  onTriage,
  onUnstageSkill,
}) => {
  const { addToast } = useUIStore();
  const [filterTab, setFilterTab] = useState<'all' | 'missing' | 'matched' | 'under_emphasized' | 'transferable' | 'learning_goals'>('missing');
  const [importanceFilter, setImportanceFilter] = useState<'all' | 'critical' | 'important'>('all');
  const [confirmingSkill, setConfirmingSkill] = useState<SuggestedKeyword | null>(null);

  const allKeywords = keywordResult?.allSuggestions || [];
  const missingKeywords = keywordResult?.missingKeywords || [];
  const matchedKeywords = keywordResult?.matchedKeywords || [];
  const underEmphasizedKeywords = keywordResult?.underEmphasizedKeywords || [];
  const transferableKeywords = keywordResult?.transferableKeywords || [];
  const learningGoalKeywords = keywordResult?.learningGoalKeywords || [];

  const getFilteredList = () => {
    let list: SuggestedKeyword[] = [];
    if (filterTab === 'all') list = allKeywords;
    else if (filterTab === 'missing') list = missingKeywords;
    else if (filterTab === 'matched') list = matchedKeywords;
    else if (filterTab === 'under_emphasized') list = underEmphasizedKeywords;
    else if (filterTab === 'transferable') list = transferableKeywords;
    else if (filterTab === 'learning_goals') list = learningGoalKeywords;

    if (importanceFilter !== 'all') {
      list = list.filter((k) => k.importance === importanceFilter);
    }
    return list;
  };

  const filteredKeywords = getFilteredList();

  const handleConfirmPossession = (kw: SuggestedKeyword) => {
    onTriage(kw.term, kw.category, 'already_have', kw.suggestedSection);
    setConfirmingSkill(null);
    addToast({
      message: `Confirmed "${kw.term}". Staged for ${kw.suggestedSection.toUpperCase()} section.`,
      type: 'success',
    });
  };

  const handleMarkLearn = (kw: SuggestedKeyword) => {
    onTriage(kw.term, kw.category, 'need_to_learn', kw.suggestedSection);
    addToast({ message: `Added "${kw.term}" to your learning goals.`, type: 'info' });
  };

  const handleMarkNotRelevant = (kw: SuggestedKeyword) => {
    onTriage(kw.term, kw.category, 'not_relevant', kw.suggestedSection);
    addToast({ message: `Marked "${kw.term}" as not relevant for this role.`, type: 'info' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Job-Specific Skills & Keyword Suggestions
            </h2>
            {keywordResult?.isDeterministic && (
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                Taxonomy Extracted
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Identify critical requirements from the target job posting. Classify skills truthfully before staging additions to your resume.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onAnalyze}
          disabled={isLoading}
          className="gap-2 shrink-0 text-xs"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" />
              <span>Analyzing JD Keywords...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{keywordResult ? 'Re-Analyze Keywords' : 'Extract JD Keywords'}</span>
            </>
          )}
        </Button>
      </div>

      {/* Grounded Heuristics Explanatory Strip */}
      {keywordResult?.isDeterministic && (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900">Taxonomy Matcher Active</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
                Offline Safe
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              {keywordResult.fallbackReason || 'Keywords were extracted using ResuMax AI curated technical taxonomy matcher.'}
              {' '}To enable remote LLM keyword intelligence, deploy: <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-900 font-mono text-[10px]">supabase functions deploy ai-optimizer</code>
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

      {/* Confirmation Modal / Prompt */}
      {confirmingSkill && (
        <div className="p-6 rounded-3xl bg-zinc-900 text-white shadow-xl border border-zinc-800 space-y-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-zinc-900 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Confirm Skill Possession: <span className="underline">{confirmingSkill.term}</span>
              </h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                ResuMax AI strictly prohibits inventing candidate qualifications. Please confirm that you have hands-on, practical experience with <span className="font-semibold text-white">{confirmingSkill.term}</span> before it is staged for your {confirmingSkill.suggestedSection.toUpperCase()} section.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmingSkill(null)}
              className="text-white border-zinc-700 hover:bg-zinc-800 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleConfirmPossession(confirmingSkill)}
              className="bg-white text-zinc-900 hover:bg-zinc-100 text-xs gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Yes, I Have This Skill (Stage Addition)</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      {!keywordResult && !isLoading ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 bg-white space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Keywords Not Yet Analyzed</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Click "Extract JD Keywords" to cross-reference your resume against target requirements using our curated technical taxonomy.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onAnalyze}>
            Analyze Target Keywords
          </Button>
        </div>
      ) : isLoading ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-xs font-semibold text-zinc-800">
            Scanning job description against technical taxonomy...
          </p>
          <p className="text-[11px] text-zinc-400">
            Comparing against resume sections for matched, missing, and under-emphasized skills
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-center">
              <span className="text-2xl font-black text-zinc-900">{missingKeywords.length}</span>
              <p className="text-[10px] font-bold uppercase text-zinc-400 mt-0.5">Missing in Resume</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-center">
              <span className="text-2xl font-black text-zinc-900">{matchedKeywords.length}</span>
              <p className="text-[10px] font-bold uppercase text-zinc-400 mt-0.5">Verified Matched</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-center">
              <span className="text-2xl font-black text-zinc-900">{transferableKeywords.length}</span>
              <p className="text-[10px] font-bold uppercase text-zinc-400 mt-0.5">Transferable Skills</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-center">
              <span className="text-2xl font-black text-zinc-900">{learningGoalKeywords.length}</span>
              <p className="text-[10px] font-bold uppercase text-zinc-400 mt-0.5">Learning Goals</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-center col-span-2 sm:col-span-1">
              <span className="text-2xl font-black text-zinc-900">{confirmedSkills.length}</span>
              <p className="text-[10px] font-bold uppercase text-zinc-400 mt-0.5">Confirmed & Staged</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterTab('missing')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                  filterTab === 'missing'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
                )}
              >
                <span>Missing</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {missingKeywords.length}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('matched')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                  filterTab === 'matched'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
                )}
              >
                <span>Matched</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {matchedKeywords.length}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('under_emphasized')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                  filterTab === 'under_emphasized'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
                )}
              >
                <span>Under-Emphasized</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {underEmphasizedKeywords.length}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('transferable')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                  filterTab === 'transferable'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
                )}
              >
                <span>Transferable</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {transferableKeywords.length}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('learning_goals')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                  filterTab === 'learning_goals'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
                )}
              >
                <span>Learning Goals</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {learningGoalKeywords.length}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('all')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                  filterTab === 'all'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200'
                )}
              >
                <span>All Suggestions</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {allKeywords.length}
                </span>
              </button>
            </div>

            {/* Importance Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-zinc-500 uppercase">Importance:</span>
              <select
                value={importanceFilter}
                onChange={(e) => setImportanceFilter(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 font-medium focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Levels</option>
                <option value="critical">Critical (3+ mentions)</option>
                <option value="important">Important (1-2 mentions)</option>
              </select>
            </div>
          </div>

          {/* Keywords List Grid */}
          <div className="space-y-3">
            {filteredKeywords.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-500 text-xs">
                No keywords found matching current filter selection.
              </div>
            ) : (
              filteredKeywords.map((kw) => {
                const isConfirmed = confirmedSkills.some((s) => s.skill.toLowerCase() === kw.term.toLowerCase());
                const isLearning = learningGoals.some((s) => s.toLowerCase() === kw.term.toLowerCase());
                const isRejected = rejectedKeywords.some((s) => s.toLowerCase() === kw.term.toLowerCase());

                return (
                  <div
                    key={kw.id}
                    className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-zinc-300"
                  >
                    {/* Left Keyword Metadata */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-zinc-900 tracking-tight">
                          {kw.term}
                        </span>

                        <Badge
                          variant="default"
                          size="sm"
                          className={cn(
                            'text-[10px] font-mono',
                            kw.importance === 'critical'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : kw.importance === 'important'
                              ? 'bg-zinc-100 text-zinc-800 border-zinc-200'
                              : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                          )}
                        >
                          {kw.importance.toUpperCase()}
                        </Badge>

                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                          {kw.category}
                        </span>

                        <span className="text-[10px] text-zinc-400 font-mono">
                          {kw.frequencyInJD}x in JD
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl">
                        {kw.whyItMatters}
                      </p>

                      {kw.suggestedAction && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl max-w-2xl">
                          <Compass className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span><strong className="font-semibold text-zinc-900">Suggested Action:</strong> {kw.suggestedAction}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-zinc-400" />
                          Recommended Placement: <strong className="text-zinc-800 capitalize">{kw.suggestedSection}</strong>
                        </span>
                        <span className="text-zinc-300">•</span>
                        <span>
                          Status:{' '}
                          <strong
                            className={cn(
                              kw.evidenceStatus === 'in_resume'
                                ? 'text-zinc-900 font-bold'
                                : kw.evidenceStatus === 'under_emphasized'
                                ? 'text-amber-800 font-bold'
                                : 'text-zinc-500'
                            )}
                          >
                            {kw.evidenceStatus === 'in_resume'
                              ? 'Verified In Resume'
                              : kw.evidenceStatus === 'under_emphasized'
                              ? 'Under-Emphasized'
                              : 'Missing in Current Resume'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Right Triage Controls */}
                    <div className="shrink-0 flex flex-wrap items-center gap-2">
                      {isConfirmed ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-900 text-white flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmed & Staged</span>
                          </span>
                          <button
                            onClick={() => onUnstageSkill(kw.term)}
                            className="text-[11px] text-zinc-400 hover:text-black underline"
                          >
                            Unstage
                          </button>
                        </div>
                      ) : isLearning ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
                            <span>Learning Goal</span>
                          </span>
                          <button
                            onClick={() => onTriage(kw.term, kw.category, 'unreviewed', kw.suggestedSection)}
                            className="text-[11px] text-zinc-400 hover:text-black underline"
                          >
                            Reset
                          </button>
                        </div>
                      ) : isRejected ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-zinc-50 text-zinc-400 border border-zinc-200 line-through">
                            Not Relevant
                          </span>
                          <button
                            onClick={() => onTriage(kw.term, kw.category, 'unreviewed', kw.suggestedSection)}
                            className="text-[11px] text-zinc-400 hover:text-black underline"
                          >
                            Undo
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setConfirmingSkill(kw)}
                            className="gap-1 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>I Have This</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkLearn(kw)}
                            className="gap-1 text-xs text-zinc-700"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Need to Learn</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkNotRelevant(kw)}
                            className="text-xs text-zinc-400 hover:text-rose-600 p-1.5"
                            title="Mark as not relevant"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
