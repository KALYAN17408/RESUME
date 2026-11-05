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
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-teal-500/20">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Cover Letter Generator
                </h1>
                <Badge variant="teal" size="sm" className="font-mono text-[10px]">
                  AI Writing Assistant
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
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
            className="gap-2 text-xs hover:text-teal-700 hover:border-teal-300"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>My Drafts ({drafts.length})</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={newDraft}
            className="gap-1.5 text-xs hover:text-teal-700 hover:border-teal-300"
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
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>1. Source Resume</span>
              </label>
              {selectedResume && (
                <Link
                  to={`/dashboard/resumes/${selectedResume.id}/edit`}
                  className="text-[11px] text-slate-500 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>Edit in Builder</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {isLoadingResumes ? (
              <div className="p-3 text-center text-xs text-slate-400">
                Loading your resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600">No resumes found in workspace.</p>
                <Link to="/dashboard/resumes">
                  <Button variant="outline" size="sm" className="text-xs hover:text-teal-700 hover:border-teal-300">
                    Create or Import Resume
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedResumeId || ''}
                  onChange={(e) => selectResume(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.personalInfo.fullName || 'No name'})
                    </option>
                  ))}
                </select>

                {selectedResume && (
                  <div className="p-3 rounded-2xl bg-teal-50/40 border border-teal-100 text-[11px] text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-900">
                      {selectedResume.personalInfo.fullName || 'Candidate Name'}
                      {selectedResume.personalInfo.professionalTitle && (
                        <span className="font-normal text-slate-500 ml-1.5">
                          • {selectedResume.personalInfo.professionalTitle}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
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
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>2. Role & Company Details</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Job Title *
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Company Name *
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Stripe, Datadog, Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Job Description (Optional, Recommended for Tailoring)
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste the target job requirements or description here for precise keyword and responsibility alignment..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 resize-y transition-colors"
                />
              </div>

              {/* Tone Selection Pills */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
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
                            ? 'border-teal-600 bg-teal-50/80 text-teal-950 ring-1 ring-teal-500 shadow-xs'
                            : 'border-slate-200 hover:border-teal-200 bg-white hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <div className="text-xs font-bold">{t.name}</div>
                        <div
                          className={cn(
                            'text-[10px] mt-0.5 leading-snug',
                            isSelected ? 'text-teal-700 font-medium' : 'text-slate-500'
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
                  className="text-[11px] font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
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
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Hiring Manager Name (Optional)
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Alex Rivera (defaults to Hiring Team)"
                          value={hiringManagerName}
                          onChange={(e) => setHiringManagerName(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Additional Context / Personal Note
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Referred by Sarah; eager to work on distributed database scalability..."
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        className="w-full p-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-white resize-y transition-colors"
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
                variant="teal"
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
            <div className="p-12 text-center rounded-3xl border border-dashed border-teal-200 bg-white space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto shadow-xs">
                <Mail className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Ready to Generate Your Cover Letter
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Select your resume, enter the target role and company name on the left, then click{' '}
                  <strong className="text-teal-700">Generate Cover Letter</strong> to draft a personalized, ATS-friendly document.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button variant="teal" size="sm" onClick={generate} className="text-xs gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Now</span>
                </Button>
                {drafts.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDraftsModalOpen(true)}
                    className="text-xs gap-1.5 hover:text-teal-700 hover:border-teal-300"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open a Draft</span>
                  </Button>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="p-20 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <Spinner size="lg" className="mx-auto text-teal-600" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  Tailoring Cover Letter to {companyName || 'Target Role'}...
                </p>
                <p className="text-xs text-slate-500">
                  Synthesizing verified resume qualifications into a compelling 4-paragraph letter.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              {/* Status Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Cover Letter Editor
                    </span>
                    {generatedResult?.isDeterministic ? (
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        Offline Mode Active
                      </Badge>
                    ) : (
                      <Badge variant="teal" size="sm" className="text-[10px]">
                        AI Generated
                      </Badge>
                    )}
                    <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                      {tone}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {subjectLine || `Application for ${jobTitle} at ${companyName}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveDraft()}
                    disabled={isSavingDraft}
                    className="gap-1.5 text-xs py-1 px-3 hover:text-teal-700 hover:border-teal-300"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingDraft ? 'Saving...' : activeDraftId ? 'Update Draft' : 'Save Draft'}</span>
                  </Button>

                  <Button
                    variant="teal"
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
                <div className="p-3 rounded-2xl bg-teal-50/30 border border-teal-200/80 text-xs text-slate-700 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 text-[11px]">
                      Offline Mode Active
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Generated using candidate information from your saved resume.
                    </p>
                  </div>
                </div>
              )}

              {/* Subject Line Field */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  placeholder="Application for Job Title — Candidate Name"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50 transition-colors"
                />
              </div>

              {/* Editable Text Area */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
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
                  className="w-full p-4 text-xs font-serif rounded-2xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 leading-relaxed resize-y bg-white text-slate-900 transition-colors"
                />
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyClick}
                    className="gap-1.5 text-xs hover:text-teal-700 hover:border-teal-300"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal-600" />
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
                    className="gap-1.5 text-xs hover:text-teal-700 hover:border-teal-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToGenerated}
                    className="gap-1.5 text-xs text-slate-500 hover:text-teal-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Changes</span>
                  </Button>
                </div>

                <div className="text-[11px] text-slate-400">
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
