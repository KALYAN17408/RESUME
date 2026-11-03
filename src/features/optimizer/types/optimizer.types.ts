import type { ResumeData } from '@/features/resumes/types/resume.types';

export type OptimizerOperation =
  | 'optimize-summary'
  | 'rewrite-bullet'
  | 'suggest-keywords'
  | 'generate-cover-letter';

export type ProviderType = 'supabase-edge' | 'deterministic' | 'external-llm';

export type ToneType = 'impact-driven' | 'technical-focus' | 'executive';

export type FormulaType = 'XYZ' | 'Action-Result' | 'Leadership-Scope';

export type KeywordCategory =
  | 'Languages'
  | 'Frameworks & Libraries'
  | 'Databases & Cloud'
  | 'Tools & DevOps'
  | 'Methodologies'
  | 'Soft Skills'
  | 'General';

export type KeywordImportance = 'critical' | 'important' | 'nice_to_have';

export type EvidenceStatus = 'in_resume' | 'missing' | 'under_emphasized';

export type UserTriageStatus = 'already_have' | 'need_to_learn' | 'not_relevant' | 'unreviewed';

/**
 * Sanitized resume data scrubbed of sensitive PII (phone, full address, private URLs)
 * safe for external transmission
 */
export interface SanitizedResumeContext {
  fullName: string;
  professionalTitle: string;
  targetRole?: string;
  summary: string;
  experiences: Array<{
    id: string;
    jobTitle: string;
    company: string;
    highlights: string[];
  }>;
  educations: Array<{
    degree: string;
    institution: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
  }>;
}

/**
 * Input schemas for each operation
 */
export interface OptimizeSummaryInput {
  currentSummary?: string;
  targetJobTitle?: string;
  targetCompany?: string;
  jobDescription: string;
  skills?: string[];
  experiencesSummary?: string;
  allowDeterministicFallback?: boolean;
}

export interface RewriteBulletInput {
  originalBullet: string;
  jobTitle?: string;
  company?: string;
  jobDescription: string;
  knownSkills?: string[];
  allowDeterministicFallback?: boolean;
}

export interface SuggestKeywordsInput {
  resumeTextOrSkills: string;
  jobDescription: string;
  existingSkills?: string[];
  allowDeterministicFallback?: boolean;
}

export interface GenerateCoverLetterInput {
  candidateName?: string;
  professionalTitle?: string;
  jobTitle: string;
  companyName: string;
  hiringManagerName?: string;
  jobDescription: string;
  summary?: string;
  keyAchievements?: string[];
  skills?: string[];
  allowDeterministicFallback?: boolean;
}

/**
 * Output data models
 */
export interface SummaryAlternative {
  id: string;
  text: string;
  tone: ToneType;
  keywordsUsed: string[];
  rationale: string;
  requiresConfirmation: boolean;
  suggestedPlaceholders: string[];
}

export interface OptimizeSummaryResult {
  originalSummary: string;
  alternatives: SummaryAlternative[];
  provider: ProviderType;
  isDeterministic: boolean;
  processingTimeMs: number;
}

export interface BulletAlternative {
  id: string;
  text: string;
  formula: FormulaType;
  actionVerb: string;
  metricsOrPlaceholders: string[];
  improvements: string[];
  requiresConfirmation: boolean;
  unsupportedClaims: string[];
}

export interface RewriteBulletResult {
  originalBullet: string;
  alternatives: BulletAlternative[];
  provider: ProviderType;
  isDeterministic: boolean;
  processingTimeMs: number;
}

export interface SuggestedKeyword {
  id: string;
  term: string;
  category: KeywordCategory;
  importance: KeywordImportance;
  evidenceStatus: EvidenceStatus;
  frequencyInJD: number;
  whyItMatters: string;
  suggestedSection: 'skills' | 'experience' | 'summary' | 'projects';
  userTriageStatus: UserTriageStatus;
}

export interface SuggestKeywordsResult {
  matchedKeywords: SuggestedKeyword[];
  missingKeywords: SuggestedKeyword[];
  underEmphasizedKeywords: SuggestedKeyword[];
  allSuggestions: SuggestedKeyword[];
  provider: ProviderType;
  isDeterministic: boolean;
  processingTimeMs: number;
}

export interface GenerateCoverLetterResult {
  content: string;
  subjectLine: string;
  usedResumeEvidence: string[];
  requiresConfirmation: boolean;
  suggestedPlaceholders: string[];
  provider: ProviderType;
  isDeterministic: boolean;
  processingTimeMs: number;
}

/**
 * Claim validation types
 */
export type ClaimType =
  | 'invented_metric'
  | 'invented_skill'
  | 'unsupported_qualification'
  | 'unsupported_experience';

export interface DetectedClaim {
  type: ClaimType;
  text: string;
  reason: string;
  severity: 'warning' | 'violation';
}

export interface ClaimValidationReport {
  isValid: boolean;
  detectedClaims: DetectedClaim[];
  hasViolations: boolean;
}

/**
 * Staged changes ready for user review and approval before persisting to ResumeData
 */
export interface StagedOptimizationChanges {
  summary?: {
    original: string;
    selected: string;
    approved: boolean;
  };
  bulletRewrites: Array<{
    experienceId?: string;
    projectId?: string;
    bulletIndex: number;
    original: string;
    rewritten: string;
    approved: boolean;
  }>;
  confirmedSkillsToAdd: Array<{
    skill: string;
    category: string;
    approved: boolean;
  }>;
  coverLetter?: {
    content: string;
    subjectLine: string;
    companyName: string;
    jobTitle: string;
  };
}

/**
 * Optimization Session representation (database & local storage)
 */
export interface OptimizationSession {
  id: string;
  userId: string;
  resumeId?: string;
  jobTitle?: string;
  companyName?: string;
  jobDescription: string;
  originalResumeSnapshot: Partial<ResumeData>;
  optimizationResults: {
    summaryResult?: OptimizeSummaryResult;
    bulletResults?: Record<string, RewriteBulletResult>; // keyed by `${expOrProjId}_${bulletIndex}`
    keywordResult?: SuggestKeywordsResult;
  };
  coverLetter?: string;
  stagedChanges?: StagedOptimizationChanges;
  createdAt: string;
  updatedAt: string;
}
