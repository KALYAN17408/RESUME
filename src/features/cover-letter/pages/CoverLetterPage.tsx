import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import {
  Mail,
  FileText,
  Sparkles,
  Building,
  Briefcase,
  User,
  Copy,
  Check,
  Download,
  RotateCcw,
  FolderOpen,
  Plus,
  Save,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { COVER_LETTER_TONES } from '../types/coverLetter.types';
import { useCoverLetter } from '../hooks/useCoverLetter';
import { CoverLetterDraftsModal } from '../components/CoverLetterDraftsModal';

export const CoverLetterPage: React.FC = () => {
  const location = useLocation();
  const routeState = (location.state || {}) as {
    resumeId?: string;
    jobDescription?: string;
    jobTitle?: string;
    companyName?: string;
  };

  const {
    resumes,
    selectedResumeId,
    selectedResume,
    isLoadingResumes,
    jobTitle,
    companyName,
    hiringManagerName,
    jobDescription,
    tone,
    additionalContext,
    generatedResult,
    editedContent,
    subjectLine,
    isLoading,
    isExportingPdf,
    error,
    drafts,
    activeDraftId,
    isSavingDraft,
    selectResume,
    setJobTitle,
    setCompanyName,
    setHiringManagerName,
    setJobDescription,
    setTone,
    setAdditionalContext,
    setEditedContent,
    setSubjectLine,
    generate,
    resetToGenerated,
    saveDraft,
    loadDraft,
    deleteDraft,
    newDraft,
    copyToClipboard,
    downloadPdf,
    downloadTxt,
  } = useCoverLetter({
    initialResumeId: routeState.resumeId,
    initialJobDescription: routeState.jobDescription,
    initialJobTitle: routeState.jobTitle,
    initialCompanyName: routeState.companyName,
  });

  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

  const handleCopyClick = async () => {
    const ok = await copyToClipboard();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = editedContent.trim()
    ? editedContent.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = editedContent.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-zinc-900 tracking-tight">
                  Cover Letter Generator
                </h1>
                <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                  AI Writing Assistant
                </Badge>
              </div>
              <p className="text-xs text-zinc-500">
                Generate and refine customized cover letters tailored strictly to your verified resume and target role.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <Button
            data-testid="open-drafts-btn"
            variant="outline"
            size="sm"
            onClick={() => setIsDraftsModalOpen(true)}
            className="gap-2 text-xs"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>My Drafts ({drafts.length})</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={newDraft}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Letter</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      {/* Accessible Live Announcement Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" role="status">
        {isLoading
          ? 'Generating tailored cover letter...'
          : editedContent
          ? 'Cover letter generated and ready for review.'
          : ''}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Source Selection & Parameters */}
        <div className="lg:col-span-5 space-y-5">
          {/* Resume Selection Box */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span>1. Source Resume</span>
              </label>
              {selectedResume && (
                <Link
                  to={`/dashboard/resumes/${selectedResume.id}/edit`}
                  className="text-[11px] text-zinc-500 hover:text-black flex items-center gap-1"
                >
                  <span>Edit in Builder</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {isLoadingResumes ? (
              <div className="p-3 text-center text-xs text-zinc-400">
                Loading your resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-2">
                <p className="text-xs text-zinc-600">No resumes found in workspace.</p>
                <Link to="/dashboard/resumes">
                  <Button variant="outline" size="sm" className="text-xs">
                    Create or Import Resume
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedResumeId || ''}
                  onChange={(e) => selectResume(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.personalInfo.fullName || 'No name'})
                    </option>
                  ))}
                </select>

                {selectedResume && (
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 space-y-1">
                    <div className="font-semibold text-zinc-900">
                      {selectedResume.personalInfo.fullName || 'Candidate Name'}
                      {selectedResume.personalInfo.professionalTitle && (
                        <span className="font-normal text-zinc-500 ml-1.5">
                          • {selectedResume.personalInfo.professionalTitle}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {[
                        selectedResume.personalInfo.email,
                        selectedResume.personalInfo.phone,
                        selectedResume.personalInfo.location,
                      ]
                        .filter(Boolean)
                        .join(' | ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job & Company Parameters */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
              <span>2. Role & Company Details</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Target Job Title *
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Target Company Name *
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. Stripe, Datadog, Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Job Description (Optional, Recommended for Tailoring)
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste the target job requirements or description here for precise keyword and responsibility alignment..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black resize-y"
                />
              </div>

              {/* Tone Selection Pills */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1.5">
                  Writing Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COVER_LETTER_TONES.map((t) => {
                    const isSelected = tone === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTone(t.id)}
                        className={cn(
                          'p-2.5 rounded-2xl border text-left transition-all',
                          isSelected
                            ? 'border-black bg-zinc-900 text-white shadow-xs'
                            : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50 text-zinc-800'
                        )}
                      >
                        <div className="text-xs font-bold">{t.name}</div>
                        <div
                          className={cn(
                            'text-[10px] mt-0.5 leading-snug',
                            isSelected ? 'text-zinc-300' : 'text-zinc-500'
                          )}
                        >
                          {t.tagline}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Options Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[11px] font-semibold text-zinc-600 hover:text-black flex items-center gap-1"
                >
                  <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform',
                      showAdvanced ? 'rotate-180' : ''
                    )}
                  />
                </button>

                {showAdvanced && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Hiring Manager Name (Optional)
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="e.g. Alex Rivera (defaults to Hiring Team)"
                          value={hiringManagerName}
                          onChange={(e) => setHiringManagerName(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Additional Context / Personal Note
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Referred by Sarah; eager to work on distributed database scalability..."
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        className="w-full p-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black bg-white resize-y"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <Button
                variant="primary"
                size="md"
                onClick={generate}
                disabled={isLoading}
                className="w-full gap-2 text-xs py-2.5"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Generating Tailored Letter...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {generatedResult ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Cover Letter Editor & Toolbar */}
        <div className="lg:col-span-7 space-y-4">
          {!generatedResult && !isLoading ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 bg-white space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto shadow-xs">
                <Mail className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900">
                  Ready to Generate Your Cover Letter
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Select your resume, enter the target role and company name on the left, then click{' '}
                  <strong>Generate Cover Letter</strong> to draft a personalized, ATS-friendly document.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button variant="primary" size="sm" onClick={generate} className="text-xs gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Now</span>
                </Button>
                {drafts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDraftsModalOpen(true)}
                    className="text-xs gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open a Draft</span>
                  </Button>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="p-20 text-center rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
              <Spinner size="lg" className="mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-900">
                  Tailoring Cover Letter to {companyName || 'Target Role'}...
                </p>
                <p className="text-xs text-zinc-500">
                  Synthesizing verified resume qualifications into a compelling 4-paragraph letter.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
              {/* Status Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">
                      Cover Letter Editor
                    </span>
                    {generatedResult?.isDeterministic ? (
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        Grounded Synthesis (Offline)
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm" className="bg-black text-white text-[10px]">
                        AI Generated
                      </Badge>
                    )}
                    <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                      {tone}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {subjectLine || `Application for ${jobTitle} at ${companyName}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveDraft()}
                    disabled={isSavingDraft}
                    className="gap-1.5 text-xs py-1 px-3"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingDraft ? 'Saving...' : activeDraftId ? 'Update Draft' : 'Save Draft'}</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={downloadPdf}
                    disabled={isExportingPdf}
                    className="gap-1.5 text-xs py-1 px-3"
                  >
                    {isExportingPdf ? (
                      <Spinner size="sm" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Download PDF</span>
                  </Button>
                </div>
              </div>

              {/* Offline Safe Notice if Deterministic */}
              {generatedResult?.isDeterministic && (
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-zinc-900 text-[11px]">
                      Grounded Synthesis Active (Offline)
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Generated using factual candidate evidence from your resume without hallucinating qualifications.
                    </p>
                  </div>
                </div>
              )}

              {/* Subject Line Field */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  placeholder="Application for Job Title — Candidate Name"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black bg-zinc-50/50"
                />
              </div>

              {/* Editable Text Area */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                  <span>Cover Letter Content</span>
                  <span className="font-mono text-[10px]">
                    {wordCount} words • {charCount} characters
                  </span>
                </div>
                <textarea
                  rows={17}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Cover letter body paragraphs..."
                  className="w-full p-4 text-xs font-serif rounded-2xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black leading-relaxed resize-y bg-white text-zinc-900"
                />
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyClick}
                    className="gap-1.5 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-zinc-900" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTxt}
                    className="gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToGenerated}
                    className="gap-1.5 text-xs text-zinc-500 hover:text-black"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Changes</span>
                  </Button>
                </div>

                <div className="text-[11px] text-zinc-400">
                  {activeDraftId ? 'Draft active' : 'Unsaved changes'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Drafts Modal */}
      <CoverLetterDraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        drafts={drafts}
        activeDraftId={activeDraftId}
        onLoadDraft={(draftId) => {
          loadDraft(draftId);
          setIsDraftsModalOpen(false);
        }}
        onDeleteDraft={deleteDraft}
        onNewDraft={newDraft}
      />
    </div>
  );
};
