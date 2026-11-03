import { useState, useCallback } from 'react';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type {
  OptimizeSummaryResult,
  RewriteBulletResult,
} from '../types/optimizer.types';
import { AiOptimizerService } from '../services/aiOptimizerService';
import { rewriteBulletInputSchema, optimizeSummaryInputSchema } from '../validation/optimizerSchemas';

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
    setStagedSummary(null);
    setStagedBullets([]);
  }, []);

  return {
    selectedResume,
    jobDescription,
    jobTitle,
    companyName,
    validationError,
    isOptimizingSummary,
    summaryResult,
    summaryError,
    isRewritingBullet,
    activeBulletKey,
    bulletResults,
    bulletError,
    stagedSummary,
    stagedBullets,
    totalStagedCount: (stagedSummary ? 1 : 0) + stagedBullets.length,
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
    toggleBulletApproval,
    resetSession,
  };
}
