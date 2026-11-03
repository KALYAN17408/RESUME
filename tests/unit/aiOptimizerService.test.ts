import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiOptimizerService } from '@/features/optimizer/services/aiOptimizerService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';

describe('AiOptimizerService — PII Sanitization & Resilience', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('PII Sanitization', () => {
    it('sanitizes personal contact details from ResumeData before transmission', () => {
      const sample = createSampleResume('test_user', 'jakes-technical');
      sample.personalInfo.phone = '+1 (555) 019-2834';
      sample.personalInfo.email = 'private.candidate@example.com';
      sample.personalInfo.location = '123 Secret St, San Francisco, CA';
      sample.personalInfo.linkedinUrl = 'https://linkedin.com/in/secret-profile';

      const sanitized = AiOptimizerService.sanitizeResume(sample);

      // Verify necessary professional context is retained
      expect(sanitized.fullName).toBe(sample.personalInfo.fullName);
      expect(sanitized.professionalTitle).toBe(sample.personalInfo.professionalTitle);
      expect(sanitized.experiences.length).toBeGreaterThan(0);
      expect(sanitized.skills.length).toBeGreaterThan(0);

      // Verify private contact PII is scrubbed from the sanitized payload
      const serialized = JSON.stringify(sanitized);
      expect(serialized).not.toContain('+1 (555) 019-2834');
      expect(serialized).not.toContain('private.candidate@example.com');
      expect(serialized).not.toContain('123 Secret St');
      expect(serialized).not.toContain('secret-profile');
    });
  });

  describe('Provider Failures & Fallback Behavior', () => {
    it('gracefully falls back to deterministic optimizer when remote is offline', async () => {
      // isRemoteConfigured returns false in standard test environment without remote edge function
      const result = await AiOptimizerService.rewriteBullet({
        originalBullet: 'Built customer authentication flow.',
        jobDescription: 'Senior Software Engineer with Auth0 and React.',
        allowDeterministicFallback: true,
      });

      expect(result.provider).toBe('deterministic');
      expect(result.isDeterministic).toBe(true);
      expect(result.alternatives).toHaveLength(3);
      expect(result.alternatives[0].text).toContain('[add measurable result if available');
    });

    it('throws a descriptive error when deterministic fallback is disabled and remote is unconfigured', async () => {
      // When remote is not configured and fallback is explicitly disabled
      vi.spyOn(AiOptimizerService, 'isRemoteConfigured').mockReturnValue(false);

      await expect(
        AiOptimizerService.optimizeSummary({
          jobDescription: 'Looking for a Senior Software Engineer with TypeScript.',
          allowDeterministicFallback: false,
        })
      ).rejects.toThrow('AI credentials are not configured and fallback was disabled.');
    });

    it('rejects invalid inputs violating Zod schemas before attempting external calls', async () => {
      await expect(
        AiOptimizerService.rewriteBullet({
          originalBullet: 'Bad', // too short (< 5 chars)
          jobDescription: 'Valid job description with enough length.',
        })
      ).rejects.toThrow('Bullet text must be at least 5 characters');
    });
  });
});
