import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/lib/supabase/client';
import {
  generateCoverLetterDeterministic,
  CoverLetterAiService,
} from '@/features/cover-letter/services/coverLetterAiService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { CoverLetterTone } from '@/features/cover-letter/types/coverLetter.types';

describe('CoverLetterAiService & Grounded Synthesis', () => {
  const sampleResume = createSampleResume('user_test', 'jakes-technical');

  it('generates grounded cover letter for each of the 4 tones without fabrication', () => {
    const tones: CoverLetterTone[] = ['professional', 'confident', 'concise', 'enthusiastic'];

    for (const tone of tones) {
      const result = generateCoverLetterDeterministic({
        resumeData: sampleResume,
        jobTitle: 'Staff Backend Engineer',
        companyName: 'Stripe',
        hiringManagerName: 'Engineering Leadership',
        jobDescription: 'Seeking backend engineer skilled in high-throughput distributed architectures.',
        tone,
      });

      expect(result.content).toBeTruthy();
      expect(result.subjectLine).toContain('Staff Backend Engineer');
      expect(result.subjectLine).toContain(sampleResume.personalInfo.fullName);
      expect(result.isDeterministic).toBe(true);
      expect(result.tone).toBe(tone);

      // Factual grounding: mentions candidate's real tools or projects
      expect(result.usedResumeEvidence.length).toBeGreaterThan(0);

      // Strict prohibition of unresolved bracket placeholders
      expect(result.content).not.toContain('[Company Name]');
      expect(result.content).not.toContain('[Add achievement]');
      expect(result.content).not.toContain('[describe a notable');

      // Tone-specific characteristics
      if (tone === 'enthusiastic') {
        expect(result.content).toMatch(/thrilled|immense enthusiasm|passionate/i);
      } else if (tone === 'confident') {
        expect(result.content).toMatch(/strong candidacy|track record|confident|ready/i);
      } else if (tone === 'concise') {
        // Concise tone should be tighter (fewer lines/words)
        expect(result.content.split('\n\n').length).toBeLessThanOrEqual(5);
      }
    }
  });

  it('gracefully handles missing resume or job description without fabricating facts or failing', () => {
    const result = generateCoverLetterDeterministic({
      resumeData: null,
      jobTitle: 'Frontend Developer',
      companyName: 'Vercel',
      candidateName: 'Jordan Smith',
    });

    expect(result.content).toContain('Dear Hiring Team');
    expect(result.content).toContain('Jordan Smith');
    expect(result.content).toContain('Frontend Developer');
    expect(result.content).toContain('Vercel');
    expect(result.content).not.toContain('[');
    expect(result.content).not.toContain('undefined');
  });

  it('incorporates optional additional context seamlessly into the narrative', () => {
    const result = generateCoverLetterDeterministic({
      resumeData: sampleResume,
      jobTitle: 'Cloud Architect',
      companyName: 'AWS',
      additionalContext: 'Referred by Dave K.; previously contributed to open-source Kubernetes plugins.',
      tone: 'professional',
    });

    expect(result.content).toContain('Referred by Dave K.');
    expect(result.content).toContain('open-source Kubernetes plugins');
  });

  it('provides a labeled offline fallback with clear explanation when remote AI is offline', async () => {
    vi.spyOn(supabase.functions, 'invoke').mockRejectedValueOnce(
      new Error('Edge function offline or unconfigured')
    );

    const result = await CoverLetterAiService.generateCoverLetter({
      resumeData: sampleResume,
      jobTitle: 'Site Reliability Engineer',
      companyName: 'Datadog',
    });

    expect(result.content).toBeTruthy();
    expect(result.isDeterministic).toBe(true);
    expect(result.fallbackReason).toBeDefined();
  });
});
