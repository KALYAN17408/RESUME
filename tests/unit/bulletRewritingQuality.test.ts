import { describe, it, expect } from 'vitest';
import {
  rewriteBulletDeterministic,
  analyzeBullet,
  validateBulletQuality,
} from '@/features/optimizer/services/deterministicOptimizer';
import { AiOptimizerService } from '@/features/optimizer/services/aiOptimizerService';
import type { RewriteBulletResult } from '@/features/optimizer/types/optimizer.types';

describe('Resume Bullet Rewriting Quality & Diversity (Regression Tests)', () => {
  const EXACT_PROBLEMATIC_INPUT = 'Developed mini applications using Python and MySQL.';

  describe('1. Semantic Parsing & Quality Validation', () => {
    it('accurately parses action verb, subject, and technologies without duplicating verbs', () => {
      const analysis = analyzeBullet(EXACT_PROBLEMATIC_INPUT, ['Python', 'MySQL']);

      expect(analysis.originalActionVerb?.toLowerCase()).toBe('developed');
      expect(analysis.subject).toBe('mini applications');
      expect(analysis.technologies).toContain('Python');
      expect(analysis.technologies).toContain('MySQL');
      expect(analysis.isPythonMySqlExample).toBe(true);
      expect(analysis.hasMetric).toBe(false);
    });

    it('rejects duplicated verbs, raw SVG markup, and embedded bracket placeholders', () => {
      // Duplicated verb detection
      expect(
        validateBulletQuality('Engineered and delivered developed mini applications using Python.').isValid
      ).toBe(false);
      expect(
        validateBulletQuality('Orchestrated end-to-end development of developed mini applications.').isValid
      ).toBe(false);
      expect(
        validateBulletQuality('Refactored robust implementation of developed mini applications.').isValid
      ).toBe(false);

      // Raw SVG markup detection
      expect(
        validateBulletQuality('**svgApplied Heuristics** Built Python apps.').isValid
      ).toBe(false);

      // Bracketed placeholder in final text detection
      expect(
        validateBulletQuality('Built Python apps resulting in [add measurable result if available].').isValid
      ).toBe(false);

      // Clean, well-formed suggestion should pass
      expect(
        validateBulletQuality('Built Python applications backed by MySQL to implement core functionality and manage structured data.').isValid
      ).toBe(true);
    });
  });

  describe('2. Five-Generation Diversity on Exact Problematic Input', () => {
    it('generates 3 distinct, non-repetitive, factually grounded alternatives across 5 consecutive cycles', () => {
      const generations: RewriteBulletResult[] = [];
      const allGeneratedTexts: string[] = [];

      for (let cycle = 0; cycle < 5; cycle++) {
        const result = rewriteBulletDeterministic({
          originalBullet: EXACT_PROBLEMATIC_INPUT,
          previousGenerations: [...allGeneratedTexts],
        });

        expect(result.alternatives).toHaveLength(3);

        const currentBatchTexts = result.alternatives.map((a) => a.text);

        // A. No duplicates within the current generation
        const uniqueInBatch = new Set(currentBatchTexts.map((t) => t.toLowerCase().trim()));
        expect(uniqueInBatch.size).toBe(3);

        // B. No duplicates against previous generations
        for (const text of currentBatchTexts) {
          const lower = text.toLowerCase().trim();
          expect(allGeneratedTexts.map((t) => t.toLowerCase().trim())).not.toContain(lower);

          // Quality checks: No duplicated verbs like "engineered ... developed"
          expect(lower).not.toMatch(/\b(engineered|orchestrated|refactored|built)\b.*\bdeveloped\b/);
          // No generic filler claims like "production workflows" or "modern architecture standards"
          expect(lower).not.toContain('production workflows');
          expect(lower).not.toContain('modern architecture standards');
          // No bracket placeholders inside the bullet text
          expect(text).not.toContain('[');
          expect(text).not.toContain(']');

          allGeneratedTexts.push(text);
        }

        // C. Approach coverage: Check that each alternative covers a distinct improvement approach
        const approaches = result.alternatives.map((a) => a.approach);
        expect(approaches).toContain('concise-ats');
        expect(approaches).toContain('technical-contribution');
        expect(approaches).toContain('outcome-focused');

        // D. Metric Opportunity: Must be provided as a separate guidance question, not in the text
        for (const alt of result.alternatives) {
          expect(alt.metricOpportunity).toBeDefined();
          expect(alt.metricOpportunity?.toLowerCase()).toContain('how many');
        }

        generations.push(result);
      }

      // Total of 15 unique, high-quality bullet suggestions across 5 cycles
      expect(allGeneratedTexts).toHaveLength(15);
      const grandTotalUnique = new Set(allGeneratedTexts.map((t) => t.toLowerCase().trim()));
      expect(grandTotalUnique.size).toBe(15);

      // Verify Cycle 0 matches the user-specified gold-standard grounded examples
      const cycle0Texts = generations[0].alternatives.map((a) => a.text);
      expect(cycle0Texts).toContain('Built Python applications backed by MySQL to implement core functionality and manage structured data.');
      expect(cycle0Texts).toContain('Implemented Python-based applications with MySQL integration, strengthening application logic and relational data handling.');
      expect(cycle0Texts).toContain('Developed mini applications using Python and MySQL, applying programming and database concepts to solve practical problems.');
    });
  });

  describe('3. Job Description & ATS Keyword Alignment', () => {
    it('naturally aligns with supported target JD keywords without keyword stuffing or unsupported claims', () => {
      const targetJD = `
        Seeking a Python Developer with experience in relational data modeling,
        database queries, and building structured application features.
      `;

      const result = rewriteBulletDeterministic({
        originalBullet: EXACT_PROBLEMATIC_INPUT,
        jobDescription: targetJD,
        knownSkills: ['Python', 'MySQL'],
      });

      expect(result.alternatives).toHaveLength(3);

      for (const alt of result.alternatives) {
        // Relevant keywords extracted cleanly
        expect(alt.relevantKeywords).toBeDefined();
        expect(alt.relevantKeywords?.length).toBeGreaterThan(0);
        // Clean text without bracket placeholders
        expect(alt.text).not.toContain('[add measurable result');
      }
    });

    it('gracefully handles missing or empty job description without inventing fake keywords', () => {
      const result = rewriteBulletDeterministic({
        originalBullet: EXACT_PROBLEMATIC_INPUT,
        jobDescription: '',
        knownSkills: ['Python', 'MySQL'],
      });

      expect(result.alternatives).toHaveLength(3);
      for (const alt of result.alternatives) {
        expect(alt.text).toBeTruthy();
        // Should only use the candidate's actual skills (Python, MySQL), not invented job keywords
        expect(alt.relevantKeywords).toContain('Python');
        expect(alt.relevantKeywords).toContain('MySQL');
      }
    });
  });

  describe('4. Verified Metrics Preservation vs No-Metric Bullets', () => {
    it('preserves existing verified metrics and does not overwrite them with placeholders', () => {
      const metricBullet = 'Developed Python backend modules handling 50,000 requests per day with 99.9% uptime.';
      const result = rewriteBulletDeterministic({
        originalBullet: metricBullet,
        knownSkills: ['Python'],
      });

      expect(result.alternatives).toHaveLength(3);
      for (const alt of result.alternatives) {
        // Verified figures must be preserved
        expect(alt.text).toMatch(/50,000|99\.9%/);
        // When metrics are already present, no metric opportunity prompt is required
        expect(alt.metricOpportunity).toBeUndefined();
      }
    });
  });

  describe('5. AiOptimizerService Fallback & Error Resilience', () => {
    it('gracefully falls back to deterministic engine when remote edge function is offline', async () => {
      const result = await AiOptimizerService.rewriteBullet({
        originalBullet: EXACT_PROBLEMATIC_INPUT,
        allowDeterministicFallback: true,
      });

      expect(result.isDeterministic).toBe(true);
      expect(result.alternatives).toHaveLength(3);
      // Clean rewritten bullets without bracket placeholders
      expect(result.alternatives[0].text).not.toContain('[add measurable result');
      expect(result.alternatives[0].approach).toBe('concise-ats');
    });

    it('rejects input violating Zod minimum character schema before invoking service', async () => {
      await expect(
        AiOptimizerService.rewriteBullet({
          originalBullet: 'Tiny',
          allowDeterministicFallback: true,
        })
      ).rejects.toThrow('Bullet text must be at least 5 characters');
    });
  });
});
