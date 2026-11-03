import { useState, useCallback } from 'react';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type {
  OptimizeSummaryResult,
  RewriteBulletResult,
  SuggestKeywordsResult,
  GenerateCoverLetterResult,
  UserTriageStatus,
} from '../types/optimizer.types';
import { AiOptimizerService } from '../services/aiOptimizerService';
import {
  rewriteBulletInputSchema,
  optimizeSummaryInputSchema,
  suggestKeywordsInputSchema,
  generateCoverLetterInputSchema,
} from '../validation/optimizerSchemas';

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

export function useOptimizer() {
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Summary generation state
  const [isOptimizingSummary, setIsOptimizingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState<OptimizeSummaryResult | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Bullet rewriting state
  const [isRewritingBullet, setIsRewritingBullet] = useState(false);
  const [activeBulletKey, setActiveBulletKey] = useState<string | null>(null);
  const [bulletResults, setBulletResults] = useState<Record<string, RewriteBulletResult>>({});
  const [bulletError, setBulletError] = useState<string | null>(null);

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

  // Staged changes
  const [stagedSummary, setStagedSummary] = useState<StagedSummaryItem | null>(null);
  const [stagedBullets, setStagedBullets] = useState<StagedBulletItem[]>([]);

  // Selection handlers
  const selectResume = useCallback((resume: ResumeData) => {
    setSelectedResume(resume);
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
      return;
    }

    try {
      optimizeSummaryInputSchema.parse({
        jobDescription,
        currentSummary: selectedResume.personalInfo.summary || '',
        targetJobTitle: jobTitle,
        targetCompany: companyName,
      });
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.errors?.[0]?.message || 'Invalid job description or input');
      return;
    }

    setIsOptimizingSummary(true);
    setSummaryError(null);

    try {
      const skills = (selectedResume.skillCategories || []).flatMap((c) => c.skills);
      const result = await AiOptimizerService.optimizeSummary({
        currentSummary: selectedResume.personalInfo.summary || '',
        targetJobTitle: jobTitle || selectedResume.targetRole,
        targetCompany: companyName,
        jobDescription,
        skills,
        allowDeterministicFallback: true,
      });
      setSummaryResult(result);
    } catch (err: any) {
      console.error('Summary optimization error:', err);
      setSummaryError(err.message || 'Failed to generate optimized summary alternatives.');
    } finally {
      setIsOptimizingSummary(false);
    }
  }, [selectedResume, jobDescription, jobTitle, companyName]);

  // Bullet rewriting
  const runRewriteBullet = useCallback(
    async (
      sourceType: 'experience' | 'project',
      sourceId: string,
      _sourceTitle: string,
      bulletIndex: number,
      bulletText: string
    ) => {
      const bulletKey = `${sourceType}_${sourceId}_${bulletIndex}`;
      setActiveBulletKey(bulletKey);

      try {
        rewriteBulletInputSchema.parse({
          originalBullet: bulletText,
          jobDescription: jobDescription || 'Standard technical evaluation',
        });
        setBulletError(null);
      } catch (err: any) {
        setBulletError(err.errors?.[0]?.message || 'Bullet text must be at least 5 characters');
        return;
      }

      setIsRewritingBullet(true);
      setBulletError(null);

      try {
        const knownSkills = (selectedResume?.skillCategories || []).flatMap((c) => c.skills);
        const result = await AiOptimizerService.rewriteBullet({
          originalBullet: bulletText,
          jobTitle: jobTitle || selectedResume?.targetRole,
          company: companyName,
          jobDescription: jobDescription || 'Standard technical evaluation',
          knownSkills,
          allowDeterministicFallback: true,
        });

        setBulletResults((prev) => ({
          ...prev,
          [bulletKey]: result,
        }));
      } catch (err: any) {
        console.error('Bullet rewrite error:', err);
        setBulletError(err.message || 'Failed to rewrite selected bullet.');
      } finally {
        setIsRewritingBullet(false);
      }
    },
    [selectedResume, jobDescription, jobTitle, companyName]
  );

  // Keyword suggestions
  const runSuggestKeywords = useCallback(async () => {
    if (!selectedResume) {
      setValidationError('Please select a resume first.');
      return;
    }

    try {
      suggestKeywordsInputSchema.parse({
        jobDescription,
        resumeTextOrSkills: selectedResume.personalInfo.summary || selectedResume.title,
      });
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.errors?.[0]?.message || 'Invalid job description');
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
        resumeTextOrSkills: resumeContext,
        existingSkills,
        allowDeterministicFallback: true,
      });
      setKeywordResult(result);
    } catch (err: any) {
      console.error('Keyword suggestion error:', err);
      setKeywordError(err.message || 'Failed to analyze keywords.');
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
      return;
    }

    const effectiveTitle = jobTitle || selectedResume.targetRole || 'Software Professional';
    const effectiveCompany = companyName || 'Hiring Company';

    try {
      generateCoverLetterInputSchema.parse({
        candidateName: selectedResume.personalInfo.fullName || 'Candidate',
        professionalTitle: selectedResume.personalInfo.professionalTitle || 'Software Engineer',
        jobTitle: effectiveTitle,
        companyName: effectiveCompany,
        hiringManagerName: hiringManagerName || 'Hiring Team',
        jobDescription,
      });
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.errors?.[0]?.message || 'Invalid job description or parameters');
      return;
    }

    setIsGeneratingCoverLetter(true);
    setCoverLetterError(null);

    try {
      const skills = (selectedResume.skillCategories || []).flatMap((c) => c.skills);
      const keyAchievements = (selectedResume.achievements || []).map((a) => a.title).concat(
        (selectedResume.experiences || []).flatMap((e) => e.highlights || []).slice(0, 2)
      );

      const result = await AiOptimizerService.generateCoverLetter({
        candidateName: selectedResume.personalInfo.fullName || 'Candidate',
        professionalTitle: selectedResume.personalInfo.professionalTitle || 'Software Engineer',
        jobTitle: effectiveTitle,
        companyName: effectiveCompany,
        hiringManagerName: hiringManagerName || 'Hiring Team',
        jobDescription,
        summary: selectedResume.personalInfo.summary,
        skills,
        keyAchievements,
        allowDeterministicFallback: true,
      });

      // Append additional context if candidate provided any
      let finalContent = result.content;
      if (additionalCoverLetterContext.trim()) {
        finalContent += `\n\nAdditional Context:\n${additionalCoverLetterContext.trim()}`;
      }

      setCoverLetterResult(result);
      setEditedCoverLetter(finalContent);
    } catch (err: any) {
      console.error('Cover letter generation error:', err);
      setCoverLetterError(err.message || 'Failed to generate tailored cover letter.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  }, [selectedResume, jobTitle, companyName, hiringManagerName, jobDescription, additionalCoverLetterContext]);

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
  }, []);

  return {
    selectedResume,
    jobDescription,
    jobTitle,
    companyName,
    validationError,
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
    totalStagedCount:
      (stagedSummary ? 1 : 0) +
      stagedBullets.length +
      confirmedSkills.length +
      (stagedCoverLetter ? 1 : 0),
    // Actions
    selectResume,
    setJobDescription,
    setJobTitle,
    setCompanyName,
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
    resetSession,
  };
}
