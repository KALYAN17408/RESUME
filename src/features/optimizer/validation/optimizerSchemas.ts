import { z } from 'zod';

/**
 * Common regex and prompt injection sanitizers
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
  /system\s*:\s*(you\s+are|override|instruction)/i,
  /reveal\s+(the\s+)?(system|internal)\s+(prompt|instructions|secret|api\s*key)/i,
  /you\s+are\s+now\s+a\s+different/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/i,
];

/**
 * Checks whether an untrusted input text contains suspected prompt injection patterns.
 */
export function detectPromptInjection(text: string): { isSuspicious: boolean; matchedPattern?: string } {
  if (!text) return { isSuspicious: false };
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { isSuspicious: true, matchedPattern: pattern.source };
    }
  }
  return { isSuspicious: false };
}

/**
 * Sanitizes untrusted text by neutralizing injection markers
 */
export function sanitizeUntrustedText(text: string): string {
  if (!text) return '';
  let sanitized = text;
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED_INSTRUCTION]');
  }
  // Trim excessive control characters
  return sanitized.trim();
}

/**
 * ============================================================================
 * INPUT SCHEMAS
 * ============================================================================
 */

export const optimizeSummaryInputSchema = z.object({
  currentSummary: z.string().max(3000, 'Current summary must not exceed 3,000 characters').optional().default(''),
  targetJobTitle: z.string().max(200, 'Target job title must not exceed 200 characters').optional().default(''),
  targetCompany: z.string().max(200, 'Target company must not exceed 200 characters').optional().default(''),
  jobDescription: z
    .string()
    .min(10, 'Job description must be at least 10 characters')
    .max(25000, 'Job description must not exceed 25,000 characters'),
  skills: z.array(z.string().max(100)).optional().default([]),
  experiencesSummary: z.string().max(5000).optional().default(''),
  allowDeterministicFallback: z.boolean().optional().default(true),
});

export const rewriteBulletInputSchema = z.object({
  originalBullet: z
    .string()
    .min(5, 'Bullet text must be at least 5 characters')
    .max(1000, 'Bullet text must not exceed 1,000 characters'),
  jobTitle: z.string().max(200).optional().default(''),
  company: z.string().max(200).optional().default(''),
  jobDescription: z
    .string()
    .min(10, 'Job description must be at least 10 characters')
    .max(25000, 'Job description must not exceed 25,000 characters'),
  knownSkills: z.array(z.string().max(100)).optional().default([]),
  allowDeterministicFallback: z.boolean().optional().default(true),
});

export const suggestKeywordsInputSchema = z.object({
  resumeTextOrSkills: z
    .string()
    .min(5, 'Resume text or skills must be provided')
    .max(30000, 'Resume text must not exceed 30,000 characters'),
  jobDescription: z
    .string()
    .min(10, 'Job description must be at least 10 characters')
    .max(25000, 'Job description must not exceed 25,000 characters'),
  existingSkills: z.array(z.string().max(100)).optional().default([]),
  allowDeterministicFallback: z.boolean().optional().default(true),
});

export const generateCoverLetterInputSchema = z.object({
  candidateName: z.string().max(150).optional().default('Candidate'),
  professionalTitle: z.string().max(200).optional().default('Professional'),
  jobTitle: z.string().min(2, 'Job title is required').max(200),
  companyName: z.string().min(2, 'Company name is required').max(200),
  hiringManagerName: z.string().max(150).optional().default('Hiring Team'),
  jobDescription: z
    .string()
    .min(10, 'Job description must be at least 10 characters')
    .max(25000, 'Job description must not exceed 25,000 characters'),
  summary: z.string().max(3000).optional().default(''),
  keyAchievements: z.array(z.string().max(1000)).optional().default([]),
  skills: z.array(z.string().max(100)).optional().default([]),
  allowDeterministicFallback: z.boolean().optional().default(true),
});

export const optimizerRequestPayloadSchema = z.object({
  operation: z.enum([
    'optimize-summary',
    'rewrite-bullet',
    'suggest-keywords',
    'generate-cover-letter',
  ]),
  payload: z.record(z.any()),
});

/**
 * ============================================================================
 * OUTPUT SCHEMAS
 * ============================================================================
 */

export const providerTypeSchema = z.enum(['supabase-edge', 'deterministic', 'external-llm']);

export const summaryAlternativeSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(10, 'Generated summary must be at least 10 characters'),
  tone: z.enum(['impact-driven', 'technical-focus', 'executive']),
  keywordsUsed: z.array(z.string()),
  rationale: z.string().min(5),
  requiresConfirmation: z.boolean(),
  suggestedPlaceholders: z.array(z.string()),
});

export const optimizeSummaryResultSchema = z.object({
  originalSummary: z.string(),
  alternatives: z.array(summaryAlternativeSchema).min(1, 'At least one alternative must be returned'),
  provider: providerTypeSchema,
  isDeterministic: z.boolean(),
  processingTimeMs: z.number().nonnegative(),
});

export const bulletAlternativeSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(10, 'Rewritten bullet must be at least 10 characters'),
  formula: z.enum(['XYZ', 'Action-Result', 'Leadership-Scope']),
  actionVerb: z.string().min(2),
  metricsOrPlaceholders: z.array(z.string()),
  improvements: z.array(z.string()),
  requiresConfirmation: z.boolean(),
  unsupportedClaims: z.array(z.string()),
});

export const rewriteBulletResultSchema = z.object({
  originalBullet: z.string(),
  alternatives: z.array(bulletAlternativeSchema).min(1, 'At least one alternative must be returned'),
  provider: providerTypeSchema,
  isDeterministic: z.boolean(),
  processingTimeMs: z.number().nonnegative(),
});

export const suggestedKeywordSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  category: z.enum([
    'Languages',
    'Frameworks & Libraries',
    'Databases & Cloud',
    'Tools & DevOps',
    'Methodologies',
    'Soft Skills',
    'General',
  ]),
  importance: z.enum(['critical', 'important', 'nice_to_have']),
  evidenceStatus: z.enum(['in_resume', 'missing', 'under_emphasized']),
  frequencyInJD: z.number().nonnegative(),
  whyItMatters: z.string().min(5),
  suggestedSection: z.enum(['skills', 'experience', 'summary', 'projects']),
  userTriageStatus: z.enum(['already_have', 'need_to_learn', 'not_relevant', 'unreviewed']),
});

export const suggestKeywordsResultSchema = z.object({
  matchedKeywords: z.array(suggestedKeywordSchema),
  missingKeywords: z.array(suggestedKeywordSchema),
  underEmphasizedKeywords: z.array(suggestedKeywordSchema),
  allSuggestions: z.array(suggestedKeywordSchema),
  provider: providerTypeSchema,
  isDeterministic: z.boolean(),
  processingTimeMs: z.number().nonnegative(),
});

export const generateCoverLetterResultSchema = z.object({
  content: z.string().min(50, 'Cover letter content must be at least 50 characters'),
  subjectLine: z.string().min(5),
  usedResumeEvidence: z.array(z.string()),
  requiresConfirmation: z.boolean(),
  suggestedPlaceholders: z.array(z.string()),
  provider: providerTypeSchema,
  isDeterministic: z.boolean(),
  processingTimeMs: z.number().nonnegative(),
});

/**
 * ============================================================================
 * OPTIMIZATION SESSION SCHEMAS
 * ============================================================================
 */

export const optimizationSessionStatusSchema = z.enum([
  'draft',
  'in_progress',
  'partially_applied',
  'completed',
  'archived',
]);

export const saveSessionInputSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
  resumeId: z.string().nullable().optional(),
  sessionName: z.string().max(200).optional().default('Untitled Optimization'),
  jobTitle: z.string().max(200).optional().default(''),
  companyName: z.string().max(200).optional().default(''),
  jobDescription: z.string().min(1, 'Job description cannot be empty').max(30000, 'Job description must not exceed 30,000 characters'),
  resumeVersionId: z.string().nullable().optional(),
  originalResumeSnapshot: z.any().nullable().optional(),
  optimizationResults: z.any().optional(),
  stagedChanges: z.any().optional(),
  coverLetter: z.any().optional(),
  status: optimizationSessionStatusSchema.optional().default('draft'),
});

