import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type {
  OptimizeSummaryInput,
  OptimizeSummaryResult,
  RewriteBulletInput,
  RewriteBulletResult,
  SuggestKeywordsInput,
  SuggestKeywordsResult,
  GenerateCoverLetterInput,
  GenerateCoverLetterResult,
  SanitizedResumeContext,
  BulletStrategy,
} from '../types/optimizer.types';
import {
  optimizeSummaryInputSchema,
  rewriteBulletInputSchema,
  suggestKeywordsInputSchema,
  generateCoverLetterInputSchema,
  optimizeSummaryResultSchema,
  rewriteBulletResultSchema,
  suggestKeywordsResultSchema,
  generateCoverLetterResultSchema,
  sanitizeUntrustedText,
  detectPromptInjection,
} from '../validation/optimizerSchemas';
import {
  optimizeSummaryDeterministic,
  rewriteBulletDeterministic,
  suggestKeywordsDeterministic,
  generateCoverLetterDeterministic,
} from './deterministicOptimizer';
import { validateClaimIntegrity } from './claimValidator';

export class AiOptimizerService {
  /**
   * Check whether remote Supabase Edge functions can be invoked
   */
  static isRemoteConfigured(): boolean {
    const env = getSupabaseEnv();
    return env.isConfigured;
  }

  /**
   * Sanitizes resume data to remove unnecessary PII (phone numbers, physical address,
   * personal social URLs) before any external AI transmission.
   */
  static sanitizeResume(resume: ResumeData): SanitizedResumeContext {
    return {
      fullName: resume.personalInfo.fullName || 'Candidate',
      professionalTitle: resume.personalInfo.professionalTitle || 'Software Professional',
      targetRole: resume.targetRole,
      summary: resume.personalInfo.summary || '',
      experiences: (resume.experiences || []).map((exp) => ({
        id: exp.id,
        jobTitle: exp.jobTitle,
        company: exp.company,
        highlights: (exp.highlights || []).map((h) => sanitizeUntrustedText(h)),
      })),
      educations: (resume.educations || []).map((edu) => ({
        degree: edu.degree,
        institution: edu.institution,
      })),
      skills: (resume.skillCategories || []).flatMap((c) => c.skills),
      projects: (resume.projects || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: sanitizeUntrustedText(p.description),
        technologies: p.technologies || [],
      })),
    };
  }

  /**
   * Operation 1: Optimize Resume Summary
   */
  static async optimizeSummary(input: OptimizeSummaryInput): Promise<OptimizeSummaryResult> {
    // 1. Validate Input
    const validatedInput = optimizeSummaryInputSchema.parse(input);

    // 2. Sanitize untrusted input text
    const sanitizedJD = sanitizeUntrustedText(validatedInput.jobDescription || '');
    const sanitizedCurrentSummary = sanitizeUntrustedText(validatedInput.currentSummary || '');

    // Check injection warnings
    const injectionCheck = detectPromptInjection(validatedInput.jobDescription || '');
    if (injectionCheck.isSuspicious) {
      console.warn('Potential prompt injection detected in JD and neutralized:', injectionCheck.matchedPattern);
    }

    let fallbackDiagnostic = '';

    // 3. Try Remote Server-Side Edge Function if available
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-optimizer', {
          body: {
            operation: 'optimize-summary',
            payload: {
              ...validatedInput,
              jobDescription: sanitizedJD,
              currentSummary: sanitizedCurrentSummary,
            },
          },
        });

        if (!error && data) {
          const validatedOutput = optimizeSummaryResultSchema.parse(data);

          // Verify claim integrity against original summary and known skills
          for (const alt of validatedOutput.alternatives) {
            const audit = validateClaimIntegrity(
              sanitizedCurrentSummary,
              alt.text,
              validatedInput.skills || []
            );
            if (audit.hasViolations) {
              alt.requiresConfirmation = true;
            }
          }

          return validatedOutput;
        }

        if (error) {
          fallbackDiagnostic = `Remote Edge Function unavailable: ${error.message || 'Function not deployed or offline'}. Using local Grounded Heuristics engine.`;
          console.warn('[AiOptimizerService] Edge function optimize-summary returned error:', error);
          if (!validatedInput.allowDeterministicFallback) {
            throw new Error(`AI service is unreachable: ${error.message || 'Remote edge function not found'}. Deploy with: supabase functions deploy ai-optimizer`);
          }
        }
      } catch (remoteErr: any) {
        fallbackDiagnostic = `Remote Edge Function offline or unreachable: ${remoteErr?.message || 'Connection error'}. Using local Grounded Heuristics engine.`;
        console.warn('[AiOptimizerService] Edge Function ai-optimizer failed or is offline:', remoteErr);
        if (!validatedInput.allowDeterministicFallback) {
          throw new Error(`AI service is currently unreachable: ${remoteErr?.message || 'Remote edge function offline'}. Deploy with: supabase functions deploy ai-optimizer`);
        }
      }
    } else {
      fallbackDiagnostic = 'Remote AI credentials are not configured. Using local Grounded Heuristics engine.';
    }

    // 4. Deterministic Grounded Fallback
    if (!validatedInput.allowDeterministicFallback && !this.isRemoteConfigured()) {
      throw new Error('AI credentials are not configured and fallback was disabled.');
    }

    const fallbackResult = optimizeSummaryDeterministic({
      ...validatedInput,
      jobDescription: sanitizedJD,
      currentSummary: sanitizedCurrentSummary,
    });

    return optimizeSummaryResultSchema.parse({
      ...fallbackResult,
      fallbackReason: fallbackDiagnostic || 'Using local Grounded Heuristics engine.',
    });
  }

  /**
   * Operation 2: Rewrite Experience or Project Bullet Point
   */
  static async rewriteBullet(input: RewriteBulletInput): Promise<RewriteBulletResult> {
    // 1. Validate Input
    const validatedInput = rewriteBulletInputSchema.parse(input);

    // 2. Sanitize untrusted text
    const sanitizedBullet = sanitizeUntrustedText(validatedInput.originalBullet);
    const sanitizedJD = sanitizeUntrustedText(validatedInput.jobDescription || '');

    let fallbackDiagnostic = '';

    // 3. Try Remote Server-Side Edge Function
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-optimizer', {
          body: {
            operation: 'rewrite-bullet',
            payload: {
              ...validatedInput,
              originalBullet: sanitizedBullet,
              jobDescription: sanitizedJD,
            },
          },
        });

        if (!error && data) {
          const validatedOutput = rewriteBulletResultSchema.parse(data);

          // Post-process claim integrity
          for (const alt of validatedOutput.alternatives) {
            const audit = validateClaimIntegrity(
              sanitizedBullet,
              alt.text,
              validatedInput.knownSkills || []
            );
            if (audit.hasViolations) {
              alt.requiresConfirmation = true;
              alt.unsupportedClaims = audit.detectedClaims.map((c) => c.reason);
            }
          }

          return validatedOutput as unknown as RewriteBulletResult;
        }

        if (error) {
          fallbackDiagnostic = `Remote Edge Function unavailable: ${error.message || 'Function not deployed or offline'}. Using local Grounded Heuristics engine.`;
          console.warn('[AiOptimizerService] Edge function rewrite-bullet returned error:', error);
          if (!validatedInput.allowDeterministicFallback) {
            throw new Error(`AI service is unreachable: ${error.message || 'Remote edge function not found'}. Deploy with: supabase functions deploy ai-optimizer`);
          }
        }
      } catch (remoteErr: any) {
        fallbackDiagnostic = `Remote Edge Function offline or unreachable: ${remoteErr?.message || 'Connection error'}. Using local Grounded Heuristics engine.`;
        console.warn('Edge Function rewrite-bullet failed:', remoteErr);
        if (!validatedInput.allowDeterministicFallback) {
          throw new Error(`AI service is currently unreachable: ${remoteErr?.message || 'Remote edge function offline'}. Deploy with: supabase functions deploy ai-optimizer`);
        }
      }
    } else {
      fallbackDiagnostic = 'Remote AI credentials are not configured. Using local Grounded Heuristics engine.';
    }

    // 4. Deterministic Grounded Fallback
    if (!validatedInput.allowDeterministicFallback && !this.isRemoteConfigured()) {
      throw new Error('AI credentials are not configured and fallback was disabled.');
    }

    const fallbackResult = rewriteBulletDeterministic({
      ...validatedInput,
      strategy: validatedInput.strategy as BulletStrategy | undefined,
      originalBullet: sanitizedBullet,
      jobDescription: sanitizedJD,
    });

    return rewriteBulletResultSchema.parse({
      ...fallbackResult,
      fallbackReason: fallbackDiagnostic || 'Using local Grounded Heuristics engine.',
    }) as unknown as RewriteBulletResult;
  }

  /**
   * Operation 3: Suggest Keywords & Match Taxonomies
   */
  static async suggestKeywords(input: SuggestKeywordsInput): Promise<SuggestKeywordsResult> {
    // 1. Validate Input
    const validatedInput = suggestKeywordsInputSchema.parse(input);

    // 2. Sanitize
    const sanitizedJD = sanitizeUntrustedText(validatedInput.jobDescription);
    const sanitizedResume = sanitizeUntrustedText(validatedInput.resumeTextOrSkills);

    let fallbackDiagnostic = '';

    // 3. Try Remote Server-Side Edge Function
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-optimizer', {
          body: {
            operation: 'suggest-keywords',
            payload: {
              ...validatedInput,
              jobDescription: sanitizedJD,
              resumeTextOrSkills: sanitizedResume,
            },
          },
        });

        if (!error && data) {
          return suggestKeywordsResultSchema.parse(data);
        }

        if (error) {
          fallbackDiagnostic = `Remote Edge Function unavailable: ${error.message || 'Function not deployed or offline'}. Using local Grounded Heuristics engine.`;
          console.warn('[AiOptimizerService] Edge function suggest-keywords returned error:', error);
          if (!validatedInput.allowDeterministicFallback) {
            throw new Error(`AI service is unreachable: ${error.message || 'Remote edge function not found'}. Deploy with: supabase functions deploy ai-optimizer`);
          }
        }
      } catch (remoteErr: any) {
        fallbackDiagnostic = `Remote Edge Function offline or unreachable: ${remoteErr?.message || 'Connection error'}. Using local Grounded Heuristics engine.`;
        console.warn('Edge Function suggest-keywords failed:', remoteErr);
        if (!validatedInput.allowDeterministicFallback) {
          throw new Error(`AI service is currently unreachable: ${remoteErr?.message || 'Remote edge function offline'}. Deploy with: supabase functions deploy ai-optimizer`);
        }
      }
    } else {
      fallbackDiagnostic = 'Remote AI credentials are not configured. Using local Grounded Heuristics engine.';
    }

    // 4. Deterministic Grounded Fallback
    if (!validatedInput.allowDeterministicFallback && !this.isRemoteConfigured()) {
      throw new Error('AI credentials are not configured and fallback was disabled.');
    }

    const fallbackResult = suggestKeywordsDeterministic({
      ...validatedInput,
      jobDescription: sanitizedJD,
      resumeTextOrSkills: sanitizedResume,
    });

    return suggestKeywordsResultSchema.parse({
      ...fallbackResult,
      fallbackReason: fallbackDiagnostic || 'Using local Grounded Heuristics engine.',
    });
  }

  /**
   * Operation 4: Generate Role-Tailored Cover Letter
   */
  static async generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterResult> {
    // 1. Validate Input
    const validatedInput = generateCoverLetterInputSchema.parse(input);

    // 2. Sanitize
    const sanitizedJD = sanitizeUntrustedText(validatedInput.jobDescription || '');
    const sanitizedSummary = sanitizeUntrustedText(validatedInput.summary || '');

    let fallbackDiagnostic = '';

    // 3. Try Remote Server-Side Edge Function
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-optimizer', {
          body: {
            operation: 'generate-cover-letter',
            payload: {
              ...validatedInput,
              jobDescription: sanitizedJD,
              summary: sanitizedSummary,
            },
          },
        });

        if (!error && data) {
          return generateCoverLetterResultSchema.parse(data);
        }

        if (error) {
          fallbackDiagnostic = `Remote Edge Function unavailable: ${error.message || 'Function not deployed or offline'}. Using local Grounded Heuristics engine.`;
          console.warn('[AiOptimizerService] Edge function generate-cover-letter returned error:', error);
          if (!validatedInput.allowDeterministicFallback) {
            throw new Error(`AI service is unreachable: ${error.message || 'Remote edge function not found'}. Deploy with: supabase functions deploy ai-optimizer`);
          }
        }
      } catch (remoteErr: any) {
        fallbackDiagnostic = `Remote Edge Function offline or unreachable: ${remoteErr?.message || 'Connection error'}. Using local Grounded Heuristics engine.`;
        console.warn('Edge Function generate-cover-letter failed:', remoteErr);
        if (!validatedInput.allowDeterministicFallback) {
          throw new Error(`AI service is currently unreachable: ${remoteErr?.message || 'Remote edge function offline'}. Deploy with: supabase functions deploy ai-optimizer`);
        }
      }
    } else {
      fallbackDiagnostic = 'Remote AI credentials are not configured. Using local Grounded Heuristics engine.';
    }

    // 4. Deterministic Grounded Fallback
    if (!validatedInput.allowDeterministicFallback && !this.isRemoteConfigured()) {
      throw new Error('AI credentials are not configured and fallback was disabled.');
    }

    const fallbackResult = generateCoverLetterDeterministic({
      ...validatedInput,
      jobDescription: sanitizedJD,
      summary: sanitizedSummary,
    });

    return generateCoverLetterResultSchema.parse({
      ...fallbackResult,
      fallbackReason: fallbackDiagnostic || 'Using local Grounded Heuristics engine.',
    });
  }
}
