import { useState, useCallback, useEffect, useRef } from 'react';
import { ZodError } from 'zod';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import { ResumeService } from '@/features/resumes/services/resumeService';
import {
  ResumeMergeService,
  type ApprovedChangesPayload,
  type MergeResult,
} from '../services/resumeMergeService';
import type {
  OptimizeSummaryResult,
  RewriteBulletResult,
  SuggestKeywordsResult,
  GenerateCoverLetterResult,
  UserTriageStatus,
  OptimizationSession,
  OptimizationSessionStatus,
  BulletStrategy,
} from '../types/optimizer.types';
import { AiOptimizerService } from '../services/aiOptimizerService';
import { OptimizationSessionService } from '../services/optimizationSessionService';
import {
  rewriteBulletInputSchema,
  optimizeSummaryInputSchema,
  suggestKeywordsInputSchema,
  generateCoverLetterInputSchema,
} from '../validation/optimizerSchemas';

export interface UseOptimizerOptions {
  userId?: string;
  enableAutoSave?: boolean;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ZodError) {
    return err.errors[0]?.message || fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export interface StagedBulletItem {
  key: string;
  sourceType: 'experience' | 'project';
  sourceId: string;
  sourceTitle: string;
  bulletIndex: number;
  original: string;
  rewritten: string;
  formula: string;
  approved: boolean;
}

export interface StagedSummaryItem {
  original: string;
  selected: string;
  tone: string;
  approved: boolean;
}

export interface ConfirmedSkillItem {
  skill: string;
  category: string;
  suggestedSection: 'skills' | 'experience' | 'summary' | 'projects';
  approved: boolean;
}

export interface StagedCoverLetterItem {
  content: string;
  subjectLine: string;
  companyName: string;
  jobTitle: string;
  hiringManagerName?: string;
  approved: boolean;
}

const SAMPLE_JOB_DESCRIPTION = `Senior Full-Stack Software Engineer

About the Role:
We are looking for an experienced Senior Full-Stack Software Engineer to design, architect, and scale our core SaaS platform. You will lead technical initiatives across our React, TypeScript, and Node.js microservices stack deployed on AWS.

Responsibilities:
• Architect, build, and maintain high-throughput web applications using React, Next.js, and TypeScript.
• Design robust REST APIs and GraphQL microservices powered by Node.js and PostgreSQL.
• Implement automated CI/CD pipelines with GitHub Actions and Docker containerization.
• Optimize application performance, caching with Redis, and reducing database query latency.
• Collaborate closely with cross-functional teams, product managers, and UI/UX designers in an Agile/Scrum environment.
• Mentor junior engineers and uphold engineering excellence through comprehensive code reviews.

Qualifications:
• 5+ years of software engineering experience building production web applications.
• Strong proficiency in TypeScript, JavaScript, React, and Node.js.
• Hands-on expertise with relational databases (PostgreSQL) and caching layers (Redis).
• Familiarity with cloud infrastructure (AWS or GCP), Docker, and Kubernetes.
• Solid grasp of system design, distributed systems, and clean code architecture.
• Experience with automated testing suites (Jest, Vitest, Cypress, or Playwright).
• Excellent problem-solving, communication, and cross-functional collaboration skills.
• Bachelor’s degree in Computer Science, Software Engineering, or equivalent practical experience.`;

export function useOptimizer(options?: UseOptimizerOptions) {
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Session persistence state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<OptimizationSessionStatus>('draft');
  const [originalResumeSnapshot, setOriginalResumeSnapshot] = useState<ResumeData | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isStaleResumeVersion, setIsStaleResumeVersion] = useState<boolean>(false);
  const isRestoringRef = useRef<boolean>(false);
  const sessionCreatedAtRef = useRef<string | null>(null);

  // Summary generation state
  const [isOptimizingSummary, setIsOptimizingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState<OptimizeSummaryResult | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryGenerationsHistory, setSummaryGenerationsHistory] = useState<string[]>([]);

  // Bullet rewriting state
  const [isRewritingBullet, setIsRewritingBullet] = useState(false);
  const [activeBulletKey, setActiveBulletKey] = useState<string | null>(null);
  const [bulletResults, setBulletResults] = useState<Record<string, RewriteBulletResult>>({});
  const [bulletError, setBulletError] = useState<string | null>(null);
  const [bulletGenerationsHistory, setBulletGenerationsHistory] = useState<Record<string, string[]>>({});

  // Keyword suggestions state
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState(false);
  const [keywordResult, setKeywordResult] = useState<SuggestKeywordsResult | null>(null);
  const [keywordError, setKeywordError] = useState<string | null>(null);
  const [confirmedSkills, setConfirmedSkills] = useState<ConfirmedSkillItem[]>([]);
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [rejectedKeywords, setRejectedKeywords] = useState<string[]>([]);

  // Cover letter state
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterResult, setCoverLetterResult] = useState<GenerateCoverLetterResult | null>(null);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [editedCoverLetter, setEditedCoverLetter] = useState<string>('');
  const [hiringManagerName, setHiringManagerName] = useState<string>('');
  const [additionalCoverLetterContext, setAdditionalCoverLetterContext] = useState<string>('');
  const [stagedCoverLetter, setStagedCoverLetter] = useState<StagedCoverLetterItem | null>(null);
  const [coverLetterGenerationsHistory, setCoverLetterGenerationsHistory] = useState<string[]>([]);

  // Staged changes
  const [stagedSummary, setStagedSummary] = useState<StagedSummaryItem | null>(null);
  const [stagedBullets, setStagedBullets] = useState<StagedBulletItem[]>([]);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);

  // Selection handlers
  const selectResume = useCallback((resume: ResumeData) => {
    setSelectedResume(resume);
    setOriginalResumeSnapshot((prev) => prev || resume);
    setValidationError(null);
    if (!jobTitle && resume.targetRole) {
      setJobTitle(resume.targetRole);
    }
  }, [jobTitle]);

  const loadSampleJd = useCallback(() => {
    setJobTitle('Senior Full-Stack Engineer');
    setCompanyName('TechScale Global');
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setValidationError(null);
  }, []);

  // Summary optimization
  const runOptimizeSummary = useCallback(async () => {
    if (!selectedResume) {
      setValidationError('Please select a resume first.');
      setSummaryError('Please select a resume first.');
      return;
    }

    try {
      optimizeSummaryInputSchema.parse({
        jobDescription: jobDescription || '',
        currentSummary: selectedResume.personalInfo.summary || '',
        targetJobTitle: jobTitle,
        targetCompany: companyName,
      });
      setValidationError(null);
      setSummaryError(null);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Invalid input for summary optimization');
      setValidationError(msg);
      setSummaryError(msg);
      return;
    }

    setIsOptimizingSummary(true);
    setSummaryError(null);

    try {
      const skills = (selectedResume.skillCategories || []).flatMap((c) => c.skills);
      const experiences = selectedResume.experiences || [];
      const isFresher = experiences.length === 0 || experiences.every((e) => /intern|trainee|apprentice|student/i.test(e.jobTitle));
      const educations = (selectedResume.educations || []).map((e) => `${e.degree} from ${e.institution}`);
      const projects = (selectedResume.projects || []).map((p) => p.name);

      const result = await AiOptimizerService.optimizeSummary({
        currentSummary: selectedResume.personalInfo.summary || '',
        targetJobTitle: jobTitle || selectedResume.targetRole,
        targetCompany: companyName,
        jobDescription: jobDescription || '',
        skills,
        previousGenerations: summaryGenerationsHistory,
        candidateProfile: {
          isFresher,
          totalYearsExperience: isFresher ? 0 : experiences.length,
          educations,
          projects,
          careerObjective: selectedResume.personalInfo.summary || '',
        },
        allowDeterministicFallback: true,
      });
      setSummaryResult(result);
      setSummaryGenerationsHistory((prev) => [
        ...prev,
        ...result.alternatives.map((a) => a.text),
      ]);
    } catch (err: unknown) {
      console.error('Summary optimization error:', err);
      setSummaryError(getErrorMessage(err, 'Failed to generate optimized summary alternatives.'));
    } finally {
      setIsOptimizingSummary(false);
    }
  }, [selectedResume, jobDescription, jobTitle, companyName, summaryGenerationsHistory]);

  // Bullet rewriting
  const runRewriteBullet = useCallback(
    async (
      sourceType: 'experience' | 'project',
      sourceId: string,
      _sourceTitle: string,
      bulletIndex: number,
      bulletText: string,
      strategy?: BulletStrategy
    ) => {
      const bulletKey = `${sourceType}_${sourceId}_${bulletIndex}`;
      setActiveBulletKey(bulletKey);

      try {
        rewriteBulletInputSchema.parse({
          originalBullet: bulletText,
          jobDescription: jobDescription || '',
          strategy,
        });
        setBulletError(null);
        setValidationError(null);
      } catch (err: unknown) {
        const msg = getErrorMessage(err, 'Bullet text must be at least 5 characters');
        setBulletError(msg);
        setValidationError(msg);
        return;
      }

      setIsRewritingBullet(true);
      setBulletError(null);

      try {
        const knownSkills = (selectedResume?.skillCategories || []).flatMap((c) => c.skills);
        const prevGenForBullet = bulletGenerationsHistory[bulletKey] || [];
        const result = await AiOptimizerService.rewriteBullet({
          originalBullet: bulletText,
          jobTitle: jobTitle || selectedResume?.targetRole,
          company: companyName,
          jobDescription: jobDescription || '',
          knownSkills,
          strategy,
          previousGenerations: prevGenForBullet,
          resumeContext: {
            jobTitle: jobTitle || selectedResume?.targetRole,
            company: companyName,
            skills: knownSkills,
          },
          allowDeterministicFallback: true,
        });

        setBulletResults((prev) => ({
          ...prev,
          [bulletKey]: result,
        }));
        setBulletGenerationsHistory((prev) => ({
          ...prev,
          [bulletKey]: [
            ...(prev[bulletKey] || []),
            ...result.alternatives.map((a) => a.text),
          ],
        }));
      } catch (err: unknown) {
        console.error('Bullet rewrite error:', err);
        setBulletError(getErrorMessage(err, 'Failed to rewrite selected bullet.'));
      } finally {
        setIsRewritingBullet(false);
      }
    },
    [selectedResume, jobDescription, jobTitle, companyName, bulletGenerationsHistory]
  );

  // Keyword suggestions
  const runSuggestKeywords = useCallback(async () => {
    if (!selectedResume) {
      setValidationError('Please select a resume first.');
      setKeywordError('Please select a resume first.');
      return;
    }

    try {
      suggestKeywordsInputSchema.parse({
        jobDescription: jobDescription || '',
        resumeTextOrSkills: selectedResume.personalInfo.summary || selectedResume.title || 'Technical Candidate Profile',
      });
      setValidationError(null);
      setKeywordError(null);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Please paste a target job description (minimum 10 characters)');
      setValidationError(msg);
      setKeywordError(msg);
      return;
    }

    setIsSuggestingKeywords(true);
    setKeywordError(null);

    try {
      const existingSkills = (selectedResume.skillCategories || []).flatMap((c) => c.skills);
      const resumeContext = [
        selectedResume.personalInfo.summary,
        selectedResume.targetRole,
        ...existingSkills,
        ...(selectedResume.experiences || []).flatMap((e) => [e.jobTitle, e.company, ...(e.highlights || [])]),
        ...(selectedResume.projects || []).flatMap((p) => [p.name, p.description, ...(p.technologies || [])]),
      ].filter(Boolean).join(' ');

      const result = await AiOptimizerService.suggestKeywords({
        jobDescription,
        resumeTextOrSkills: resumeContext || 'Technical Candidate',
        existingSkills,
        allowDeterministicFallback: true,
      });
      setKeywordResult(result);
    } catch (err: unknown) {
      console.error('Keyword suggestion error:', err);
      setKeywordError(getErrorMessage(err, 'Failed to analyze keywords.'));
    } finally {
      setIsSuggestingKeywords(false);
    }
  }, [selectedResume, jobDescription]);

  // Keyword triage
  const triageKeyword = useCallback(
    (term: string, category: string, status: UserTriageStatus, suggestedSection: 'skills' | 'experience' | 'summary' | 'projects' = 'skills') => {
      // Update result model
      setKeywordResult((prev) => {
        if (!prev) return prev;
        const updateList = (list: typeof prev.allSuggestions) =>
          list.map((k) => (k.term.toLowerCase() === term.toLowerCase() ? { ...k, userTriageStatus: status } : k));

        return {
          ...prev,
          allSuggestions: updateList(prev.allSuggestions),
          missingKeywords: updateList(prev.missingKeywords),
          matchedKeywords: updateList(prev.matchedKeywords),
          underEmphasizedKeywords: updateList(prev.underEmphasizedKeywords),
        };
      });

      // Update triage lists
      if (status === 'already_have') {
        setConfirmedSkills((prev) => {
          if (prev.some((s) => s.skill.toLowerCase() === term.toLowerCase())) return prev;
          return [...prev, { skill: term, category, suggestedSection, approved: true }];
        });
        setLearningGoals((prev) => prev.filter((s) => s.toLowerCase() !== term.toLowerCase()));
        setRejectedKeywords((prev) => prev.filter((s) => s.toLowerCase() !== term.toLowerCase()));
      } else if (status === 'need_to_learn') {
        setLearningGoals((prev) => {
          if (prev.includes(term)) return prev;
          return [...prev, term];
        });
        setConfirmedSkills((prev) => prev.filter((s) => s.skill.toLowerCase() !== term.toLowerCase()));
        setRejectedKeywords((prev) => prev.filter((s) => s.toLowerCase() !== term.toLowerCase()));
      } else if (status === 'not_relevant') {
        setRejectedKeywords((prev) => {
          if (prev.includes(term)) return prev;
          return [...prev, term];
        });
        setConfirmedSkills((prev) => prev.filter((s) => s.skill.toLowerCase() !== term.toLowerCase()));
        setLearningGoals((prev) => prev.filter((s) => s.toLowerCase() !== term.toLowerCase()));
      } else {
        // Unreviewed / reset
        setConfirmedSkills((prev) => prev.filter((s) => s.skill.toLowerCase() !== term.toLowerCase()));
        setLearningGoals((prev) => prev.filter((s) => s.toLowerCase() !== term.toLowerCase()));
        setRejectedKeywords((prev) => prev.filter((s) => s.toLowerCase() !== term.toLowerCase()));
      }
    },
    []
  );

  const stageConfirmedSkill = useCallback((skill: string, category: string, suggestedSection: 'skills' | 'experience' | 'summary' | 'projects' = 'skills') => {
    setConfirmedSkills((prev) => {
      if (prev.some((s) => s.skill.toLowerCase() === skill.toLowerCase())) return prev;
      return [...prev, { skill, category, suggestedSection, approved: true }];
    });
  }, []);

  const unstageConfirmedSkill = useCallback((skill: string) => {
    setConfirmedSkills((prev) => prev.filter((s) => s.skill.toLowerCase() !== skill.toLowerCase()));
  }, []);

  // Cover letter generation
  const runGenerateCoverLetter = useCallback(async () => {
    if (!selectedResume) {
      setValidationError('Please select a resume first.');
      setCoverLetterError('Please select a resume first.');
      return;
    }

    const effectiveTitle = jobTitle || selectedResume.targetRole || 'Software Professional';
    const effectiveCompany = companyName || 'Target Company';

    try {
      generateCoverLetterInputSchema.parse({
        candidateName: selectedResume.personalInfo.fullName || 'Candidate',
        professionalTitle: selectedResume.personalInfo.professionalTitle || 'Software Engineer',
        jobTitle: effectiveTitle,
        companyName: effectiveCompany,
        hiringManagerName: hiringManagerName || 'Hiring Team',
        jobDescription: jobDescription || '',
      });
      setValidationError(null);
      setCoverLetterError(null);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Please specify both Role Title and Company Name');
      setValidationError(msg);
      setCoverLetterError(msg);
      return;
    }

    setIsGeneratingCoverLetter(true);
    setCoverLetterError(null);

    try {
      const skills = (selectedResume.skillCategories || []).flatMap((c) => c.skills);
      const keyAchievements = (selectedResume.achievements || []).map((a) => a.title).concat(
        (selectedResume.experiences || []).flatMap((e) => e.highlights || []).slice(0, 2)
      );
      const educations = (selectedResume.educations || []).map((e) => ({
        degree: e.degree,
        institution: e.institution,
      }));
      const projects = (selectedResume.projects || []).map((p) => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies || [],
      }));
      const experiences = (selectedResume.experiences || []).map((e) => ({
        jobTitle: e.jobTitle,
        company: e.company,
        highlights: e.highlights || [],
      }));

      const result = await AiOptimizerService.generateCoverLetter({
        candidateName: selectedResume.personalInfo.fullName || 'Candidate',
        professionalTitle: selectedResume.personalInfo.professionalTitle || 'Software Engineer',
        jobTitle: effectiveTitle,
        companyName: effectiveCompany,
        hiringManagerName: hiringManagerName || 'Hiring Team',
        jobDescription: jobDescription || '',
        summary: selectedResume.personalInfo.summary,
        skills,
        keyAchievements,
        educations,
        projects,
        experiences,
        previousGenerations: coverLetterGenerationsHistory,
        allowDeterministicFallback: true,
      });

      // Append additional context if candidate provided any
      let finalContent = result.content;
      if (additionalCoverLetterContext.trim()) {
        finalContent += `\n\nAdditional Context:\n${additionalCoverLetterContext.trim()}`;
      }

      setCoverLetterResult(result);
      setEditedCoverLetter(finalContent);
      setCoverLetterGenerationsHistory((prev) => [...prev, result.content]);
    } catch (err: unknown) {
      console.error('Cover letter generation error:', err);
      setCoverLetterError(getErrorMessage(err, 'Failed to generate tailored cover letter.'));
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  }, [selectedResume, jobTitle, companyName, hiringManagerName, jobDescription, additionalCoverLetterContext, coverLetterGenerationsHistory]);

  const resetCoverLetterToGenerated = useCallback(() => {
    if (coverLetterResult) {
      setEditedCoverLetter(coverLetterResult.content);
    }
  }, [coverLetterResult]);

  const stageCoverLetter = useCallback(() => {
    if (!coverLetterResult && !editedCoverLetter) return;
    setStagedCoverLetter({
      content: editedCoverLetter,
      subjectLine: coverLetterResult?.subjectLine || `Application for ${jobTitle || 'Role'} — ${selectedResume?.personalInfo.fullName || 'Candidate'}`,
      companyName: companyName || 'Company',
      jobTitle: jobTitle || 'Target Role',
      hiringManagerName: hiringManagerName || 'Hiring Team',
      approved: true,
    });
  }, [coverLetterResult, editedCoverLetter, jobTitle, companyName, hiringManagerName, selectedResume]);

  const unstageCoverLetter = useCallback(() => {
    setStagedCoverLetter(null);
  }, []);

  // Staging handlers
  const stageSummary = useCallback((selectedText: string, tone = 'impact-driven') => {
    if (!selectedResume) return;
    setStagedSummary({
      original: selectedResume.personalInfo.summary || '',
      selected: selectedText,
      tone,
      approved: true,
    });
  }, [selectedResume]);

  const unstageSummary = useCallback(() => {
    setStagedSummary(null);
  }, []);

  const stageBullet = useCallback(
    (item: {
      sourceType: 'experience' | 'project';
      sourceId: string;
      sourceTitle: string;
      bulletIndex: number;
      original: string;
      rewritten: string;
      formula: string;
    }) => {
      const key = `${item.sourceType}_${item.sourceId}_${item.bulletIndex}`;
      setStagedBullets((prev) => {
        const filtered = prev.filter((b) => b.key !== key);
        return [
          ...filtered,
          {
            key,
            sourceType: item.sourceType,
            sourceId: item.sourceId,
            sourceTitle: item.sourceTitle,
            bulletIndex: item.bulletIndex,
            original: item.original,
            rewritten: item.rewritten,
            formula: item.formula,
            approved: true,
          },
        ];
      });
    },
    []
  );

  const unstageBullet = useCallback((key: string) => {
    setStagedBullets((prev) => prev.filter((b) => b.key !== key));
  }, []);

  const toggleBulletApproval = useCallback((key: string) => {
    setStagedBullets((prev) =>
      prev.map((b) => (b.key === key ? { ...b, approved: !b.approved } : b))
    );
  }, []);

  const applyApprovedChanges = useCallback(
    async (
      approvedPayload: ApprovedChangesPayload,
      effectiveUserId: string
    ): Promise<MergeResult> => {
      if (!selectedResume) {
        throw new Error('No resume selected to apply optimizations to.');
      }

      setIsApplyingChanges(true);
      try {
        // 1. Fetch current latest state and check ownership
        const currentResume = await ResumeService.getResume(selectedResume.id, effectiveUserId);
        if (!currentResume) {
          throw new Error('Selected resume could not be retrieved from storage.');
        }

        if (currentResume.userId !== effectiveUserId && effectiveUserId !== 'demo_user') {
          throw new Error('Unauthorized: Resume does not belong to the active user.');
        }

        // 2. Count planned modifications
        const changesCount =
          (approvedPayload.summary ? 1 : 0) +
          (approvedPayload.bullets?.length || 0) +
          (approvedPayload.skills?.length || 0);

        if (changesCount === 0) {
          throw new Error('No approved changes selected for merging.');
        }

        // 3. Create pre-mutation version snapshot
        const snapshotResult = await ResumeService.createSnapshot(
          currentResume,
          `Pre-optimization snapshot before applying ${changesCount} AI improvement(s)`
        );

        if (!snapshotResult.success) {
          throw new Error(
            `Failed to create resume version snapshot: ${snapshotResult.error || 'Unknown error'}. Aborting update for safety.`
          );
        }

        // 4. Merge approved modifications immutably
        const mergeResult = ResumeMergeService.mergeApprovedChanges(
          currentResume,
          approvedPayload
        );

        // 5. Persist updated resume
        const saveResult = await ResumeService.saveResume(mergeResult.updatedResume);
        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to persist merged resume to storage.');
        }

        // 6. Refresh state
        setSelectedResume(mergeResult.updatedResume);

        // Clear only applied changes
        if (approvedPayload.summary) {
          setStagedSummary(null);
        }

        if (approvedPayload.bullets && approvedPayload.bullets.length > 0) {
          const appliedKeys = new Set(approvedPayload.bullets.map((b) => b.key));
          setStagedBullets((prev) => prev.filter((b) => !appliedKeys.has(b.key)));
        }

        if (approvedPayload.skills && approvedPayload.skills.length > 0) {
          const appliedSkillNames = new Set(
            approvedPayload.skills.map((s) => s.skill.toLowerCase())
          );
          setConfirmedSkills((prev) =>
            prev.filter((s) => !appliedSkillNames.has(s.skill.toLowerCase()))
          );
        }

        const remainingResumeChanges =
          (approvedPayload.summary ? 0 : (stagedSummary ? 1 : 0)) +
          stagedBullets.filter((b) => !approvedPayload.bullets?.some((ab) => ab.key === b.key)).length +
          confirmedSkills.filter((s) => !approvedPayload.skills?.some((as) => as.skill.toLowerCase() === s.skill.toLowerCase())).length;

        const nextStatus: OptimizationSessionStatus = remainingResumeChanges === 0 ? 'completed' : 'partially_applied';
        setSessionStatus(nextStatus);

        return mergeResult;
      } finally {
        setIsApplyingChanges(false);
      }
    },
    [selectedResume, stagedSummary, stagedBullets, confirmedSkills]
  );

  const resetSession = useCallback(() => {
    setSelectedResume(null);
    setJobDescription('');
    setJobTitle('');
    setCompanyName('');
    setValidationError(null);
    setSummaryResult(null);
    setBulletResults({});
    setKeywordResult(null);
    setConfirmedSkills([]);
    setLearningGoals([]);
    setRejectedKeywords([]);
    setCoverLetterResult(null);
    setEditedCoverLetter('');
    setHiringManagerName('');
    setAdditionalCoverLetterContext('');
    setStagedCoverLetter(null);
    setStagedSummary(null);
    setStagedBullets([]);
    setCurrentSessionId(null);
    setSessionName('');
    setSessionStatus('draft');
    setOriginalResumeSnapshot(null);
    setIsStaleResumeVersion(false);
    setLastSavedAt(null);
    setSaveStatus('idle');
    sessionCreatedAtRef.current = null;
  }, []);

  const loadSession = useCallback(
    (session: OptimizationSession, freshResume?: ResumeData | null) => {
      isRestoringRef.current = true;
      setCurrentSessionId(session.id);
      setSessionName(session.sessionName);
      setSessionStatus(session.status);
      sessionCreatedAtRef.current = session.createdAt;
      setJobDescription(session.jobDescription || '');
      setJobTitle(session.jobTitle || '');
      setCompanyName(session.companyName || '');

      // Staged Items
      const restoredConfirmedSkills = session.stagedChanges?.confirmedSkills || [];
      const restoredLearningGoals = session.stagedChanges?.learningGoals || [];
      const restoredRejectedKeywords = session.stagedChanges?.rejectedKeywords || [];

      setStagedSummary(session.stagedChanges?.stagedSummary || null);
      setStagedBullets(session.stagedChanges?.stagedBullets || []);
      setConfirmedSkills(restoredConfirmedSkills);
      setLearningGoals(restoredLearningGoals);
      setRejectedKeywords(restoredRejectedKeywords);

      // Results
      setSummaryResult(session.optimizationResults?.summaryResult || null);
      setBulletResults(session.optimizationResults?.bulletResults || {});

      // Reconcile keyword triage statuses if keywordResult is present
      const rawKeywordResult = session.optimizationResults?.keywordResult;
      if (rawKeywordResult) {
        const confirmedSkillNames = new Set(restoredConfirmedSkills.map((s) => s.skill.toLowerCase()));
        const learningGoalNames = new Set(restoredLearningGoals.map((g) => g.toLowerCase()));
        const rejectedNames = new Set(restoredRejectedKeywords.map((r) => r.toLowerCase()));

        const reconcileKw = (kw: any) => {
          const lowerTerm = kw.term.toLowerCase();
          let status: UserTriageStatus = kw.userTriageStatus || 'unreviewed';
          if (confirmedSkillNames.has(lowerTerm)) {
            status = 'already_have';
          } else if (learningGoalNames.has(lowerTerm)) {
            status = 'need_to_learn';
          } else if (rejectedNames.has(lowerTerm)) {
            status = 'not_relevant';
          }
          return { ...kw, userTriageStatus: status };
        };

        setKeywordResult({
          ...rawKeywordResult,
          allSuggestions: (rawKeywordResult.allSuggestions || []).map(reconcileKw),
          missingKeywords: (rawKeywordResult.missingKeywords || []).map(reconcileKw),
          matchedKeywords: (rawKeywordResult.matchedKeywords || []).map(reconcileKw),
          underEmphasizedKeywords: (rawKeywordResult.underEmphasizedKeywords || []).map(reconcileKw),
        });
      } else {
        setKeywordResult(null);
      }

      // Cover Letter
      setCoverLetterResult(session.coverLetter?.coverLetterResult || null);
      setEditedCoverLetter(session.coverLetter?.editedCoverLetter || '');
      setHiringManagerName(session.coverLetter?.hiringManagerName || '');
      setAdditionalCoverLetterContext(session.coverLetter?.additionalCoverLetterContext || '');
      setStagedCoverLetter(session.coverLetter?.stagedCoverLetter || null);

      // Snapshot & Resume
      setOriginalResumeSnapshot(session.originalResumeSnapshot || null);
      const activeResume = freshResume !== undefined ? freshResume : (session.originalResumeSnapshot || null);
      if (activeResume) {
        setSelectedResume(activeResume);
      }

      // Stale Resume Warning Detection
      if (session.originalResumeSnapshot && freshResume) {
        const isStale = Boolean(
          session.originalResumeSnapshot.updatedAt &&
          freshResume.updatedAt &&
          session.originalResumeSnapshot.updatedAt !== freshResume.updatedAt
        );
        setIsStaleResumeVersion(isStale);
      } else {
        setIsStaleResumeVersion(false);
      }

      setLastSavedAt(session.updatedAt);
      setSaveStatus('saved');
      setValidationError(null);

      setTimeout(() => {
        isRestoringRef.current = false;
      }, 100);
    },
    []
  );

  const saveCurrentSession = useCallback(
    async (
      userIdOverride?: string,
      customStatus?: OptimizationSessionStatus
    ): Promise<{ success: boolean; session?: OptimizationSession; error?: string }> => {
      const effectiveUser = userIdOverride || options?.userId || 'demo_user';
      if (!selectedResume && !jobDescription) {
        return { success: false, error: 'Cannot save an empty session.' };
      }

      setSaveStatus('saving');

      const sessionId = currentSessionId || crypto.randomUUID();
      const now = new Date().toISOString();

      const hasStagedItems = Boolean(
        stagedSummary || stagedBullets.length > 0 || confirmedSkills.length > 0 || stagedCoverLetter
      );
      const calculatedStatus: OptimizationSessionStatus =
        customStatus ||
        sessionStatus ||
        (hasStagedItems ? 'in_progress' : 'draft');

      const sessionTitle =
        sessionName.trim() ||
        (selectedResume
          ? `${selectedResume.title} - ${jobTitle || 'Optimization'}`
          : jobTitle
          ? `${jobTitle} Optimization`
          : 'Untitled Session');

      const sessionPayload: OptimizationSession = {
        id: sessionId,
        userId: effectiveUser,
        resumeId: selectedResume?.id || null,
        resumeTitle: selectedResume?.title,
        sessionName: sessionTitle,
        jobTitle: jobTitle || '',
        companyName: companyName || '',
        jobDescription: jobDescription || '',
        resumeVersionId: selectedResume?.id || null,
        originalResumeSnapshot: originalResumeSnapshot || selectedResume || null,
        optimizationResults: {
          summaryResult,
          bulletResults,
          keywordResult,
        },
        stagedChanges: {
          stagedSummary,
          stagedBullets,
          confirmedSkills,
          learningGoals,
          rejectedKeywords,
        },
        coverLetter: {
          coverLetterResult,
          editedCoverLetter,
          hiringManagerName,
          additionalCoverLetterContext,
          stagedCoverLetter,
        },
        status: calculatedStatus,
        createdAt: sessionCreatedAtRef.current || now,
        updatedAt: now,
        lastOpenedAt: now,
      };

      try {
        const res = await OptimizationSessionService.saveSession(sessionPayload);
        if (res.success) {
          setCurrentSessionId(sessionId);
          setSessionName(sessionTitle);
          setSessionStatus(calculatedStatus);
          sessionCreatedAtRef.current = sessionPayload.createdAt;
          setLastSavedAt(now);
          setSaveStatus('saved');
          return { success: true, session: sessionPayload };
        } else {
          setSaveStatus('error');
          return { success: false, error: res.error };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setSaveStatus('error');
        return { success: false, error: msg };
      }
    },
    [
      options?.userId,
      selectedResume,
      jobDescription,
      currentSessionId,
      sessionStatus,
      sessionName,
      jobTitle,
      companyName,
      originalResumeSnapshot,
      summaryResult,
      bulletResults,
      keywordResult,
      stagedSummary,
      stagedBullets,
      confirmedSkills,
      learningGoals,
      rejectedKeywords,
      coverLetterResult,
      editedCoverLetter,
      hiringManagerName,
      additionalCoverLetterContext,
      stagedCoverLetter,
    ]
  );

  // Debounced auto-save
  useEffect(() => {
    if (!options?.enableAutoSave || isRestoringRef.current) return;
    if (!selectedResume && !jobDescription) return;

    const timer = setTimeout(() => {
      saveCurrentSession();
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    options?.enableAutoSave,
    selectedResume,
    jobDescription,
    jobTitle,
    companyName,
    stagedSummary,
    stagedBullets,
    confirmedSkills,
    stagedCoverLetter,
    saveCurrentSession,
  ]);

  const newSession = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const dismissStaleResumeWarning = useCallback(() => {
    setIsStaleResumeVersion(false);
  }, []);

  return {
    selectedResume,
    jobDescription,
    jobTitle,
    companyName,
    validationError,
    // Session state
    currentSessionId,
    sessionName,
    sessionStatus,
    originalResumeSnapshot,
    saveStatus,
    lastSavedAt,
    isStaleResumeVersion,
    // Summary
    isOptimizingSummary,
    summaryResult,
    summaryError,
    // Bullets
    isRewritingBullet,
    activeBulletKey,
    bulletResults,
    bulletError,
    // Keywords
    isSuggestingKeywords,
    keywordResult,
    keywordError,
    confirmedSkills,
    learningGoals,
    rejectedKeywords,
    // Cover letter
    isGeneratingCoverLetter,
    coverLetterResult,
    coverLetterError,
    editedCoverLetter,
    hiringManagerName,
    additionalCoverLetterContext,
    stagedCoverLetter,
    // Staging
    stagedSummary,
    stagedBullets,
    isApplyingChanges,
    totalStagedCount:
      (stagedSummary ? 1 : 0) +
      stagedBullets.length +
      confirmedSkills.length +
      (stagedCoverLetter ? 1 : 0),
    stagedResumeChangesCount:
      (stagedSummary ? 1 : 0) +
      stagedBullets.length +
      confirmedSkills.length,
    // Actions
    selectResume,
    setJobDescription,
    setJobTitle,
    setCompanyName,
    setSessionName,
    setSessionStatus,
    loadSession,
    saveCurrentSession,
    newSession,
    dismissStaleResumeWarning,
    loadSampleJd,
    runOptimizeSummary,
    runRewriteBullet,
    runSuggestKeywords,
    triageKeyword,
    stageConfirmedSkill,
    unstageConfirmedSkill,
    runGenerateCoverLetter,
    setEditedCoverLetter,
    setHiringManagerName,
    setAdditionalCoverLetterContext,
    resetCoverLetterToGenerated,
    stageCoverLetter,
    unstageCoverLetter,
    stageSummary,
    unstageSummary,
    stageBullet,
    unstageBullet,
    toggleBulletApproval,
    applyApprovedChanges,
    resetSession,
  };
}
