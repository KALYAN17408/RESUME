import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { ResumeSelectorModal } from '@/features/analyzer/components/ResumeSelectorModal';
import { OptimizerHeader } from '../components/OptimizerHeader';
import { SummaryOptimizerCard } from '../components/SummaryOptimizerCard';
import { BulletRewriterCard } from '../components/BulletRewriterCard';
import { KeywordSuggestionsCard } from '../components/KeywordSuggestionsCard';
import { CoverLetterGeneratorCard } from '../components/CoverLetterGeneratorCard';
import { DiffComparisonModal } from '../components/DiffComparisonModal';
import { OptimizationSessionHistory } from '../components/OptimizationSessionHistory';
import type { ApprovedChangesPayload } from '../services/resumeMergeService';
import type { OptimizationSession } from '../types/optimizer.types';
import { useOptimizer } from '../hooks/useOptimizer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  FileText,
  Briefcase,
  Building,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Tag,
  Mail,
  History,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AiOptimizerPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const location = useLocation();

  const effectiveUserId = user?.id || 'demo_user';

  const {
    selectedResume,
    jobDescription,
    jobTitle,
    companyName,
    validationError,
    // Session states & actions
    currentSessionId,
    sessionName,
    saveStatus,
    isStaleResumeVersion,
    loadSession,
    saveCurrentSession,
    newSession,
    dismissStaleResumeWarning,
    isOptimizingSummary,
    summaryResult,
    summaryError,
    isRewritingBullet,
    activeBulletKey,
    bulletResults,
    bulletError,
    stagedSummary,
    stagedBullets,
    totalStagedCount,
    stagedResumeChangesCount,
    isApplyingChanges,
    applyApprovedChanges,
    // Keywords
    isSuggestingKeywords,
    keywordResult,
    keywordError,
    confirmedSkills,
    learningGoals,
    rejectedKeywords,
    runSuggestKeywords,
    triageKeyword,
    stageConfirmedSkill,
    unstageConfirmedSkill,
    // Cover Letter
    isGeneratingCoverLetter,
    coverLetterResult,
    coverLetterError,
    editedCoverLetter,
    hiringManagerName,
    additionalCoverLetterContext,
    stagedCoverLetter,
    runGenerateCoverLetter,
    setEditedCoverLetter,
    setHiringManagerName,
    setAdditionalCoverLetterContext,
    resetCoverLetterToGenerated,
    stageCoverLetter,
    unstageCoverLetter,
    selectResume,
    setJobDescription,
    setJobTitle,
    setCompanyName,
    loadSampleJd,
    runOptimizeSummary,
    runRewriteBullet,
    stageSummary,
    unstageSummary,
    stageBullet,
    unstageBullet,
    resetSession,
  } = useOptimizer({ userId: effectiveUserId, enableAutoSave: true });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'bullets' | 'keywords' | 'cover-letter'>('summary');

  const handleSelectSession = async (session: OptimizationSession) => {
    if (totalStagedCount > 0) {
      const confirmSwitch = window.confirm(
        `You have ${totalStagedCount} staged modification(s) in your current workspace. Loading a different session will replace them. Do you want to proceed?`
      );
      if (!confirmSwitch) return;
    }

    let freshResume = null;
    if (session.resumeId) {
      freshResume = await ResumeService.getResume(session.resumeId, effectiveUserId);
    }
    loadSession(session, freshResume);
    addToast({
      message: `Loaded session "${session.sessionName}".`,
      type: 'info',
    });
  };

  const handleSaveSession = async () => {
    const res = await saveCurrentSession(effectiveUserId);
    if (res.success) {
      addToast({
        message: `Saved session "${res.session?.sessionName}".`,
        type: 'success',
      });
    } else {
      addToast({
        message: `Failed to save session: ${res.error}`,
        type: 'error',
      });
    }
  };

  const handleApplyApprovedChanges = async (approvedPayload: ApprovedChangesPayload) => {
    try {
      const res = await applyApprovedChanges(approvedPayload, effectiveUserId);
      addToast({
        message: `Successfully merged ${res.appliedCount} optimization${res.appliedCount > 1 ? 's' : ''} into "${selectedResume?.title}". Version snapshot saved.`,
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast({ message: `Failed to apply changes: ${msg}`, type: 'error' });
      throw err;
    }
  };

  // Handle incoming navigation state (e.g. from ATS Analyzer "Optimize with AI")
  useEffect(() => {
    const navState = location.state as {
      resumeId?: string;
      jobDescription?: string;
      jobTitle?: string;
      companyName?: string;
    } | null;

    if (navState?.jobDescription && !jobDescription) {
      setJobDescription(navState.jobDescription);
    }
    if (navState?.jobTitle && !jobTitle) {
      setJobTitle(navState.jobTitle);
    }
    if (navState?.companyName && !companyName) {
      setCompanyName(navState.companyName);
    }

    if (navState?.resumeId && !selectedResume) {
      ResumeService.getResume(navState.resumeId, effectiveUserId).then((res) => {
        if (res) {
          selectResume(res);
          addToast({ message: `Loaded resume "${res.title}" from ATS report.`, type: 'info' });
        }
      });
    }
  }, [location.state, effectiveUserId, selectedResume, jobDescription, jobTitle, companyName, selectResume, setJobDescription, setJobTitle, setCompanyName, addToast]);

  const handleSelectResumeItem = async (item: { id: string }) => {
    const full = await ResumeService.getResume(item.id, effectiveUserId);
    if (full) {
      selectResume(full);
      addToast({ message: `Selected resume "${full.title}".`, type: 'info' });
    }
  };


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      {selectedResume ? (
        <div className="space-y-4">
          <OptimizerHeader
            resumeTitle={selectedResume.title}
            resumeId={selectedResume.id}
            targetJobTitle={jobTitle || selectedResume.targetRole}
            companyName={companyName}
            sessionName={sessionName}
            saveStatus={saveStatus}
            totalStagedCount={totalStagedCount}
            stagedResumeChangesCount={stagedResumeChangesCount}
            onOpenDiffModal={() => setIsDiffModalOpen(true)}
            onOpenSessionsHistory={() => setIsHistoryModalOpen(true)}
            onSaveSession={handleSaveSession}
            onChangeResume={() => setIsSelectorOpen(true)}
            onReset={resetSession}
          />

          {/* Stale Resume Version Warning Banner */}
          {isStaleResumeVersion && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Stale Resume Version Detected
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    The underlying resume has been modified since this session was created. Review diffs carefully before applying optimizations.
                  </p>
                </div>
              </div>
              <button
                onClick={dismissStaleResumeWarning}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors shrink-0 self-end sm:self-center"
              >
                Acknowledge & Continue
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 tracking-wider uppercase">
                Module C • Phase 4
              </span>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                Targeted AI Alignment
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 mt-1">
              AI Resume Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
              Tailor and optimize your resume against specific target job postings. Generate truthful professional summaries, strengthen bullets with Google's XYZ formula, and stage approved improvements.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            className="gap-1.5 text-xs self-start sm:self-auto shrink-0"
          >
            <History className="w-3.5 h-3.5" />
            <span>Saved Sessions</span>
          </Button>
        </div>
      )}

      {/* Main Content: Setup View vs Optimizer Workspace */}
      {!selectedResume ? (
        /* Setup / Ingestion View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Select Resume */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                  1. Select Target Resume
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Choose an existing resume from your account to analyze and improve.
                </p>
              </div>

              <div
                onClick={() => setIsSelectorOpen(true)}
                className="border-2 border-dashed border-zinc-200 hover:border-black rounded-2xl p-6 text-center cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-zinc-200/80 flex items-center justify-center mx-auto text-zinc-900 mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-zinc-900">Choose from Saved Resumes</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Select a resume built in ResuMax AI
                </p>
              </div>
            </div>

            {/* Optional Job Details */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Optional Target Role Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Target Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="e.g. Senior Full-Stack Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="e.g. Stripe, Linear, Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Job Description Input */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                    2. Target Job Description
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Paste the target job requirements to generate grounded rewrites and alignment.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSampleJd}
                  className="gap-1.5 text-xs shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Load Sample JD</span>
                </Button>
              </div>

              <div>
                <textarea
                  rows={14}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description here (responsibilities, required skills, technical requirements)..."
                  className="w-full p-4 text-xs font-mono rounded-2xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black focus:border-black leading-relaxed resize-y placeholder:font-sans"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                  <span>{jobDescription.length} characters (min 10)</span>
                  {jobDescription.length > 0 && (
                    <button
                      onClick={() => setJobDescription('')}
                      className="text-zinc-500 hover:text-black underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {validationError && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-2xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsSelectorOpen(true)}
                  className="w-full py-3.5 text-sm gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Choose Resume to Begin Optimization</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Optimization Workspace */
        <div className="space-y-6">
          {/* Staged Changes Summary Banner */}
          {totalStagedCount > 0 && (
            <div className="p-4 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white text-zinc-900 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {totalStagedCount} Optimization{totalStagedCount > 1 ? 's' : ''} Staged in Memory
                  </p>
                  <p className="text-[11px] text-zinc-300">
                    {stagedSummary ? '1 summary rewrite' : ''}
                    {stagedSummary && (stagedBullets.length > 0 || confirmedSkills.length > 0 || stagedCoverLetter) ? ', ' : ''}
                    {stagedBullets.length > 0 ? `${stagedBullets.length} bullet rewrite${stagedBullets.length > 1 ? 's' : ''}` : ''}
                    {stagedBullets.length > 0 && (confirmedSkills.length > 0 || stagedCoverLetter) ? ', ' : ''}
                    {confirmedSkills.length > 0 ? `${confirmedSkills.length} verified skill${confirmedSkills.length > 1 ? 's' : ''}` : ''}
                    {confirmedSkills.length > 0 && stagedCoverLetter ? ', ' : ''}
                    {stagedCoverLetter ? '1 cover letter' : ''}
                    {' '}(Original resume content is preserved untouched until approved in Phase 4E).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {stagedResumeChangesCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDiffModalOpen(true)}
                    className="bg-white text-zinc-900 border-white hover:bg-zinc-100 text-xs font-bold gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                    <span>Review & Apply ({stagedResumeChangesCount})</span>
                  </Button>
                )}
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                  Phase 4E Safe Staging
                </span>
              </div>
            </div>
          )}

          {/* Module Sub-Navigation Tabs */}
          <div className="border-b border-zinc-200 flex gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={cn(
                'pb-3 px-3.5 text-xs font-bold transition-all relative flex items-center gap-2',
                activeTab === 'summary'
                  ? 'text-black'
                  : 'text-zinc-500 hover:text-black'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Professional Summary</span>
              {stagedSummary && (
                <span className="w-2 h-2 rounded-full bg-black" />
              )}
              {activeTab === 'summary' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('bullets')}
              className={cn(
                'pb-3 px-3.5 text-xs font-bold transition-all relative flex items-center gap-2',
                activeTab === 'bullets'
                  ? 'text-black'
                  : 'text-zinc-500 hover:text-black'
              )}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Bullet Rewriter</span>
              {stagedBullets.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black text-white font-mono">
                  {stagedBullets.length}
                </span>
              )}
              {activeTab === 'bullets' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('keywords')}
              className={cn(
                'pb-3 px-3.5 text-xs font-bold transition-all relative flex items-center gap-2',
                activeTab === 'keywords'
                  ? 'text-black'
                  : 'text-zinc-500 hover:text-black'
              )}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Skills & Keywords</span>
              {confirmedSkills.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black text-white font-mono">
                  {confirmedSkills.length}
                </span>
              )}
              {activeTab === 'keywords' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('cover-letter')}
              className={cn(
                'pb-3 px-3.5 text-xs font-bold transition-all relative flex items-center gap-2',
                activeTab === 'cover-letter'
                  ? 'text-black'
                  : 'text-zinc-500 hover:text-black'
              )}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Cover Letter</span>
              {stagedCoverLetter && (
                <span className="w-2 h-2 rounded-full bg-black" />
              )}
              {activeTab === 'cover-letter' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
              )}
            </button>
          </div>

          {/* Active Workspace View */}
          <div className="pt-2">
            {activeTab === 'summary' && (
              <SummaryOptimizerCard
                originalSummary={selectedResume.personalInfo.summary || ''}
                summaryResult={summaryResult}
                isLoading={isOptimizingSummary}
                error={summaryError}
                stagedSummary={stagedSummary}
                onGenerate={runOptimizeSummary}
                onStage={stageSummary}
                onUnstage={unstageSummary}
              />
            )}

            {activeTab === 'bullets' && (
              <BulletRewriterCard
                resume={selectedResume}
                bulletResults={bulletResults}
                activeBulletKey={activeBulletKey}
                isLoading={isRewritingBullet}
                error={bulletError}
                stagedBullets={stagedBullets}
                onRewrite={runRewriteBullet}
                onStageBullet={stageBullet}
                onUnstageBullet={unstageBullet}
              />
            )}

            {activeTab === 'keywords' && (
              <KeywordSuggestionsCard
                keywordResult={keywordResult}
                isLoading={isSuggestingKeywords}
                error={keywordError}
                confirmedSkills={confirmedSkills}
                learningGoals={learningGoals}
                rejectedKeywords={rejectedKeywords}
                onAnalyze={runSuggestKeywords}
                onTriage={triageKeyword}
                onStageSkill={stageConfirmedSkill}
                onUnstageSkill={unstageConfirmedSkill}
              />
            )}

            {activeTab === 'cover-letter' && (
              <CoverLetterGeneratorCard
                jobTitle={jobTitle}
                companyName={companyName}
                hiringManagerName={hiringManagerName}
                additionalContext={additionalCoverLetterContext}
                coverLetterResult={coverLetterResult}
                editedCoverLetter={editedCoverLetter}
                isLoading={isGeneratingCoverLetter}
                error={coverLetterError}
                stagedCoverLetter={stagedCoverLetter}
                onJobTitleChange={setJobTitle}
                onCompanyNameChange={setCompanyName}
                onHiringManagerChange={setHiringManagerName}
                onAdditionalContextChange={setAdditionalCoverLetterContext}
                onCoverLetterTextChange={setEditedCoverLetter}
                onGenerate={runGenerateCoverLetter}
                onResetToGenerated={resetCoverLetterToGenerated}
                onStageCoverLetter={stageCoverLetter}
                onUnstageCoverLetter={unstageCoverLetter}
              />
            )}
          </div>
        </div>
      )}

      {/* Resume Selector Modal */}
      {effectiveUserId && (
        <ResumeSelectorModal
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          userId={effectiveUserId}
          selectedResumeId={selectedResume?.id}
          onSelectResume={handleSelectResumeItem}
        />
      )}

      {/* Diff Comparison & Selective Merge Modal */}
      {selectedResume && (
        <DiffComparisonModal
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          resume={selectedResume}
          stagedSummary={stagedSummary}
          stagedBullets={stagedBullets}
          confirmedSkills={confirmedSkills}
          onApplyApprovedChanges={handleApplyApprovedChanges}
          isApplying={isApplyingChanges}
          isStaleResumeVersion={isStaleResumeVersion}
        />
      )}

      {/* Session History Modal */}
      {effectiveUserId && (
        <OptimizationSessionHistory
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          userId={effectiveUserId}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={newSession}
        />
      )}
    </div>
  );
};
