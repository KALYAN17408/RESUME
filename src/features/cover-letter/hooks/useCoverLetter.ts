import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ResumeService } from '@/features/resumes/services/resumeService';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type {
  CoverLetterTone,
  CoverLetterDraft,
  CoverLetterGenerationResult,
} from '../types/coverLetter.types';
import { CoverLetterAiService } from '../services/coverLetterAiService';
import { CoverLetterService } from '../services/coverLetterService';
import { downloadCoverLetterPdf } from '../services/coverLetterPdf';

export interface UseCoverLetterOptions {
  initialResumeId?: string | null;
  initialJobDescription?: string;
  initialJobTitle?: string;
  initialCompanyName?: string;
}

export function useCoverLetter(options: UseCoverLetterOptions = {}) {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const userId = user?.id || 'demo_user';

  // Resumes list & selected resume
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(
    options.initialResumeId || null
  );
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  // Form parameters
  const [jobTitle, setJobTitle] = useState(options.initialJobTitle || '');
  const [companyName, setCompanyName] = useState(options.initialCompanyName || '');
  const [hiringManagerName, setHiringManagerName] = useState('');
  const [jobDescription, setJobDescription] = useState(options.initialJobDescription || '');
  const [tone, setTone] = useState<CoverLetterTone>('professional');
  const [additionalContext, setAdditionalContext] = useState('');

  // Generation & Editor State
  const [generatedResult, setGeneratedResult] = useState<CoverLetterGenerationResult | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [subjectLine, setSubjectLine] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);

  // Drafts Management State
  const [drafts, setDrafts] = useState<CoverLetterDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

  // Load user resumes
  useEffect(() => {
    let isMounted = true;
    async function loadResumes() {
      setIsLoadingResumes(true);
      try {
        const items = await ResumeService.listResumes(userId);
        if (isMounted) {
          const fullResumes: ResumeData[] = [];
          for (const item of items) {
            const full = await ResumeService.getResume(item.id, userId);
            if (full) fullResumes.push(full);
          }
          setResumes(fullResumes);
          if (fullResumes.length > 0) {
            const matched = options.initialResumeId
              ? fullResumes.find((r: ResumeData) => r.id === options.initialResumeId)
              : fullResumes[0];
            const target = matched || fullResumes[0];
            setSelectedResumeId(target.id);
            setSelectedResume(target);
            if (!jobTitle && target.targetRole) {
              setJobTitle(target.targetRole);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load user resumes for cover letter:', err);
      } finally {
        if (isMounted) setIsLoadingResumes(false);
      }
    }

    loadResumes();
    return () => {
      isMounted = false;
    };
  }, [userId, options.initialResumeId]);

  // Handle selected resume change
  const handleSelectResume = useCallback(
    (resumeId: string) => {
      setSelectedResumeId(resumeId);
      const found = resumes.find((r: ResumeData) => r.id === resumeId) || null;
      setSelectedResume(found);
      if (found?.targetRole && !jobTitle) {
        setJobTitle(found.targetRole);
      }
    },
    [resumes, jobTitle]
  );

  // Load drafts from storage
  const refreshDrafts = useCallback(() => {
    const list = CoverLetterService.getDrafts(userId);
    setDrafts(list);
  }, [userId]);

  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  // Generate or Regenerate Cover Letter
  const handleGenerate = useCallback(async () => {
    if (!jobTitle.trim()) {
      setError('Please provide a Target Job Title.');
      return;
    }
    if (!companyName.trim()) {
      setError('Please provide a Target Company Name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await CoverLetterAiService.generateCoverLetter({
        candidateName: selectedResume?.personalInfo.fullName,
        professionalTitle: selectedResume?.personalInfo.professionalTitle || jobTitle,
        email: selectedResume?.personalInfo.email,
        phone: selectedResume?.personalInfo.phone,
        location: selectedResume?.personalInfo.location,
        linkedinUrl: selectedResume?.personalInfo.linkedinUrl,
        githubUrl: selectedResume?.personalInfo.githubUrl,
        portfolioUrl: selectedResume?.personalInfo.portfolioUrl,
        resumeData: selectedResume,
        jobTitle,
        companyName,
        hiringManagerName,
        jobDescription,
        tone,
        additionalContext,
        previousGenerations: generationHistory,
      });

      setGeneratedResult(result);
      setEditedContent(result.content);
      setSubjectLine(result.subjectLine);
      setGenerationHistory((prev) => [...prev, result.content]);

      addToast({
        message: result.isDeterministic
          ? 'Generated structured cover letter using verified resume achievements!'
          : 'AI Cover letter successfully generated!',
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate cover letter.';
      setError(msg);
      addToast({ message: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [
    jobTitle,
    companyName,
    hiringManagerName,
    jobDescription,
    tone,
    additionalContext,
    selectedResume,
    generationHistory,
    addToast,
  ]);

  // Reset to original generated text
  const handleResetToGenerated = useCallback(() => {
    if (generatedResult) {
      setEditedContent(generatedResult.content);
      addToast({ message: 'Reset content to original generated text', type: 'info' });
    }
  }, [generatedResult, addToast]);

  // Save current draft
  const handleSaveDraft = useCallback(
    (customTitle?: string) => {
      if (!editedContent.trim()) {
        addToast({ message: 'Cannot save an empty cover letter.', type: 'warning' });
        return;
      }

      setIsSavingDraft(true);
      try {
        const title = customTitle || `${companyName || 'Company'} — ${jobTitle || 'Role'}`;
        const saved = CoverLetterService.saveDraft(userId, {
          id: activeDraftId || undefined,
          title,
          resumeId: selectedResumeId,
          resumeTitle: selectedResume?.title,
          jobTitle: jobTitle || 'Software Engineer',
          companyName: companyName || 'Company',
          hiringManagerName,
          jobDescription,
          tone,
          additionalContext,
          subjectLine,
          content: editedContent,
          originalGeneratedContent: generatedResult?.content,
          usedResumeEvidence: generatedResult?.usedResumeEvidence || [],
          isDeterministic: generatedResult?.isDeterministic ?? true,
          provider: generatedResult?.provider || 'deterministic',
        });

        setActiveDraftId(saved.id);
        refreshDrafts();
        addToast({ message: `Draft "${saved.title}" saved successfully!`, type: 'success' });
      } catch {
        addToast({ message: 'Failed to save draft.', type: 'error' });
      } finally {
        setIsSavingDraft(false);
      }
    },
    [
      editedContent,
      companyName,
      jobTitle,
      userId,
      activeDraftId,
      selectedResumeId,
      selectedResume,
      hiringManagerName,
      jobDescription,
      tone,
      additionalContext,
      subjectLine,
      generatedResult,
      refreshDrafts,
      addToast,
    ]
  );

  // Load a draft
  const handleLoadDraft = useCallback(
    (draftId: string) => {
      const draft = CoverLetterService.getDraftById(userId, draftId);
      if (!draft) {
        addToast({ message: 'Draft not found.', type: 'error' });
        return;
      }

      setActiveDraftId(draft.id);
      setJobTitle(draft.jobTitle);
      setCompanyName(draft.companyName);
      setHiringManagerName(draft.hiringManagerName || '');
      setJobDescription(draft.jobDescription || '');
      setTone(draft.tone || 'professional');
      setAdditionalContext(draft.additionalContext || '');
      setSubjectLine(draft.subjectLine);
      setEditedContent(draft.content);
      if (draft.resumeId) {
        setSelectedResumeId(draft.resumeId);
        const r = resumes.find((item) => item.id === draft.resumeId);
        if (r) setSelectedResume(r);
      }

      setGeneratedResult({
        content: draft.originalGeneratedContent || draft.content,
        subjectLine: draft.subjectLine,
        usedResumeEvidence: draft.usedResumeEvidence || [],
        isDeterministic: draft.isDeterministic,
        provider: draft.provider,
        tone: draft.tone || 'professional',
        processingTimeMs: 0,
      });

      setIsDraftsModalOpen(false);
      addToast({ message: `Opened draft "${draft.title}"`, type: 'info' });
    },
    [userId, resumes, addToast]
  );

  // Delete draft
  const handleDeleteDraft = useCallback(
    (draftId: string) => {
      CoverLetterService.deleteDraft(userId, draftId);
      if (activeDraftId === draftId) {
        setActiveDraftId(null);
      }
      refreshDrafts();
      addToast({ message: 'Draft deleted.', type: 'info' });
    },
    [userId, activeDraftId, refreshDrafts, addToast]
  );

  // Start fresh draft
  const handleNewDraft = useCallback(() => {
    setActiveDraftId(null);
    setGeneratedResult(null);
    setEditedContent('');
    setSubjectLine('');
    setJobTitle(selectedResume?.targetRole || '');
    setCompanyName('');
    setHiringManagerName('');
    setJobDescription('');
    setAdditionalContext('');
    setError(null);
    addToast({ message: 'Started new cover letter.', type: 'info' });
  }, [selectedResume, addToast]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!editedContent.trim()) return false;
    try {
      await navigator.clipboard.writeText(editedContent);
      addToast({ message: 'Cover letter copied to clipboard!', type: 'success' });
      return true;
    } catch {
      addToast({ message: 'Failed to copy to clipboard.', type: 'error' });
      return false;
    }
  }, [editedContent, addToast]);

  // Download PDF
  const handleDownloadPdf = useCallback(async () => {
    if (!editedContent.trim()) {
      addToast({ message: 'Cannot export empty cover letter.', type: 'warning' });
      return;
    }

    setIsExportingPdf(true);
    try {
      const filename = await downloadCoverLetterPdf({
        content: editedContent,
        subjectLine,
        candidateName: selectedResume?.personalInfo.fullName,
        candidateTitle: selectedResume?.personalInfo.professionalTitle || jobTitle,
        recipientName: hiringManagerName || 'Hiring Team',
        companyName,
        resumeData: selectedResume,
      });
      addToast({ message: `Downloaded PDF: ${filename}`, type: 'success' });
    } catch (err: any) {
      addToast({
        message: `Failed to export PDF: ${err.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setIsExportingPdf(false);
    }
  }, [
    editedContent,
    subjectLine,
    selectedResume,
    jobTitle,
    hiringManagerName,
    companyName,
    addToast,
  ]);

  // Download TXT
  const handleDownloadTxt = useCallback(() => {
    if (!editedContent.trim()) {
      addToast({ message: 'Cannot export empty cover letter.', type: 'warning' });
      return;
    }

    const filename = `Cover_Letter_${(companyName || 'Company').replace(/\s+/g, '_')}_${(jobTitle || 'Role').replace(/\s+/g, '_')}.txt`;
    const fullText = `${subjectLine ? `Subject: ${subjectLine}\n\n` : ''}${editedContent}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ message: `Downloaded ${filename}`, type: 'success' });
  }, [editedContent, subjectLine, companyName, jobTitle, addToast]);

  return {
    // State
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
    isDraftsModalOpen,

    // Actions
    selectResume: handleSelectResume,
    setJobTitle,
    setCompanyName,
    setHiringManagerName,
    setJobDescription,
    setTone,
    setAdditionalContext,
    setEditedContent,
    setSubjectLine,
    setIsDraftsModalOpen,
    generate: handleGenerate,
    resetToGenerated: handleResetToGenerated,
    saveDraft: handleSaveDraft,
    loadDraft: handleLoadDraft,
    deleteDraft: handleDeleteDraft,
    newDraft: handleNewDraft,
    copyToClipboard: handleCopy,
    downloadPdf: handleDownloadPdf,
    downloadTxt: handleDownloadTxt,
  };
}
