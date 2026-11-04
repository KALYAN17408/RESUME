import type { ResumeData } from '@/features/resumes/types/resume.types';

export type OptimizerOperation =
  | 'optimize-summary'
  | 'rewrite-bullet'
  | 'suggest-keywords'
  | 'generate-cover-letter';

export type ProviderType = 'supabase-edge' | 'deterministic' | 'external-llm';

export type ToneType =
  | 'professional-concise'
  | 'skills-focused'
  | 'role-aligned'
  | 'impact-driven'
  | 'technical-focus'
  | 'executive';

export type BulletStrategy =
  | 'action-oriented'
  | 'impact-oriented'
  | 'technical-oriented'
  | 'concise-oriented'
  | 'achievement-oriented'
  | 'job-targeted';

export type FormulaType =
  | 'XYZ'
  | 'Action-Result'
  | 'Leadership-Scope'
  | 'Action-Oriented'
  | 'Impact-Oriented'
  | 'Technical-Oriented'
  | 'Concise'
  | 'Achievement'
  | 'Job-Targeted'
  | (string & {});

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
  jobDescription?: string;
  skills?: string[];
  experiencesSummary?: string;
  previousGenerations?: string[];
  candidateProfile?: {
    isFresher?: boolean;
    totalYearsExperience?: number;
    educations?: any[];
    projects?: any[];
    careerObjective?: string;
  };
  allowDeterministicFallback?: boolean;
}

export interface RewriteBulletInput {
  originalBullet: string;
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  knownSkills?: string[];
  strategy?: BulletStrategy;
  previousGenerations?: string[];
  resumeContext?: {
    jobTitle?: string;
    company?: string;
    skills?: string[];
    projectHighlights?: string[];
  };
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
  jobDescription?: string;
  summary?: string;
  keyAchievements?: string[];
  skills?: string[];
  educations?: Array<{ degree: string; institution: string; year?: string }>;
  projects?: Array<{ name: string; description?: string; technologies: string[] }>;
  experiences?: Array<{ jobTitle: string; company: string; highlights: string[] }>;
  previousGenerations?: string[];
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
  fallbackReason?: string;
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
  fallbackReason?: string;
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
  suggestedAction?: string;
  isTransferable?: boolean;
  isLearningGoal?: boolean;
}

export interface SuggestKeywordsResult {
  matchedKeywords: SuggestedKeyword[];
  missingKeywords: SuggestedKeyword[];
  underEmphasizedKeywords: SuggestedKeyword[];
  transferableKeywords?: SuggestedKeyword[];
  learningGoalKeywords?: SuggestedKeyword[];
  allSuggestions: SuggestedKeyword[];
  provider: ProviderType;
  isDeterministic: boolean;
  processingTimeMs: number;
  fallbackReason?: string;
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
  fallbackReason?: string;
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
export type OptimizationSessionStatus =
  | 'draft'
  | 'in_progress'
  | 'partially_applied'
  | 'completed'
  | 'archived';

export interface OptimizationResultsState {
  summaryResult: OptimizeSummaryResult | null;
  bulletResults: Record<string, RewriteBulletResult>;
  keywordResult: SuggestKeywordsResult | null;
}

export interface StagedChangesState {
  stagedSummary: {
    original: string;
    selected: string;
    tone: string;
    approved: boolean;
  } | null;
  stagedBullets: Array<{
    key: string;
    sourceType: 'experience' | 'project';
    sourceId: string;
    sourceTitle: string;
    bulletIndex: number;
    original: string;
    rewritten: string;
    formula: string;
    approved: boolean;
  }>;
  confirmedSkills: Array<{
    skill: string;
    category: string;
    suggestedSection: 'skills' | 'experience' | 'summary' | 'projects';
    approved: boolean;
  }>;
  learningGoals: string[];
  rejectedKeywords: string[];
}

export interface CoverLetterState {
  coverLetterResult: GenerateCoverLetterResult | null;
  editedCoverLetter: string;
  hiringManagerName: string;
  additionalCoverLetterContext: string;
  stagedCoverLetter: {
    content: string;
    subjectLine: string;
    companyName: string;
    jobTitle: string;
    hiringManagerName?: string;
    approved: boolean;
  } | null;
}

export interface OptimizationSession {
  id: string;
  userId: string;
  resumeId: string | null;
  resumeTitle?: string;
  sessionName: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumeVersionId?: string | null;
  originalResumeSnapshot: ResumeData | null;
  optimizationResults: OptimizationResultsState;
  stagedChanges: StagedChangesState;
  coverLetter: CoverLetterState;
  status: OptimizationSessionStatus;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
}

export interface OptimizationSessionListItem {
  id: string;
  userId: string;
  resumeId: string | null;
  resumeTitle?: string;
  sessionName: string;
  jobTitle?: string;
  companyName?: string;
  status: OptimizationSessionStatus;
  stagedCount: number;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
}
