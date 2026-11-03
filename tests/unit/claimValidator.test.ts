import { describe, it, expect } from 'vitest';
import {
  extractMetrics,
  hasBracketedPlaceholders,
  detectInventedMetrics,
  detectInventedSkills,
  detectUnsupportedQualifications,
  detectSeniorityInflation,
  validateClaimIntegrity,
} from '@/features/optimizer/services/claimValidator';

describe('Claim Validator & Anti-Hallucination Guard', () => {
  describe('extractMetrics & hasBracketedPlaceholders', () => {
    it('extracts quantifiable metrics from text', () => {
      const text = 'Reduced latency by 45% across 1.2M queries, saving $150k annually.';
      const metrics = extractMetrics(text);
      expect(metrics).toContain('45%');
      expect(metrics).toContain('1.2m');
      expect(metrics).toContain('$150k');
    });

    it('ignores metrics that are part of bracketed placeholders', () => {
      const text = 'Improved database performance [add measurable result, e.g. 35%].';
      const metrics = extractMetrics(text);
      // Because it was inside brackets, extractMetrics ignores it
      expect(metrics).not.toContain('35%');
      expect(hasBracketedPlaceholders(text)).toBe(true);
    });
  });

  describe('detectInventedMetrics', () => {
    it('flags ungrounded metrics not present in original text', () => {
      const original = 'Worked on backend services and updated API endpoints.';
      const proposed = 'Engineered backend services reducing server costs by $80k and boosting uptime by 99.9%.';

      const violations = detectInventedMetrics(original, proposed);
      expect(violations.length).toBeGreaterThanOrEqual(1);
      expect(violations.some((v) => v.text === '$80k')).toBe(true);
    });

    it('allows metrics that were already in original text', () => {
      const original = 'Optimized API reducing latency by 40% across 500k users.';
      const proposed = 'Streamlined API architecture, achieving 40% latency reduction across 500k users.';

      const violations = detectInventedMetrics(original, proposed);
      expect(violations).toHaveLength(0);
    });

    it('permits bracketed placeholders for missing metrics', () => {
      const original = 'Built customer onboarding flow.';
      const proposed = 'Engineered customer onboarding flow, increasing signups by [add measurable result if available].';

      const violations = detectInventedMetrics(original, proposed);
      expect(violations).toHaveLength(0);
    });
  });

  describe('detectInventedSkills', () => {
    it('flags technical taxonomy skills introduced without candidate evidence', () => {
      const knownSkills = ['JavaScript', 'HTML', 'CSS'];
      const original = 'Built responsive websites using JavaScript and CSS.';
      const proposed = 'Architected enterprise microservices with Kubernetes, Rust, and GraphQL.';

      const violations = detectInventedSkills(knownSkills, proposed, original);
      const terms = violations.map((v) => v.text.toLowerCase());
      expect(terms).toContain('kubernetes');
      expect(terms).toContain('rust');
      expect(terms).toContain('graphql');
    });
  });

  describe('detectUnsupportedQualifications & Seniority Inflation', () => {
    it('flags ungrounded high-risk degrees or certifications', () => {
      const original = 'Bachelor of Science in Information Technology.';
      const proposed = 'PhD holder and Certified Solutions Architect Professional leading distributed systems.';

      const claims = detectUnsupportedQualifications(original, proposed);
      expect(claims.some((c) => c.text === 'phd')).toBe(true);
      expect(claims.some((c) => c.text === 'certified solutions architect professional')).toBe(true);
    });

    it('flags major seniority jumps from junior to executive levels', () => {
      const original = 'Junior Developer assisting team with bug fixes.';
      const proposed = 'Vice President of Engineering directing cloud strategy.';

      const claims = detectSeniorityInflation(original, proposed);
      expect(claims.length).toBeGreaterThan(0);
      expect(claims[0].type).toBe('unsupported_experience');
    });
  });

  describe('validateClaimIntegrity', () => {
    it('returns isValid = true for clean, truthful rewrites', () => {
      const original = 'Managed AWS infrastructure and deployed Docker containers.';
      const proposed = 'Administered AWS infrastructure and orchestrated Docker containers, improving reliability by [add measurable result if available].';

      const report = validateClaimIntegrity(original, proposed, ['AWS', 'Docker']);
      expect(report.isValid).toBe(true);
      expect(report.hasViolations).toBe(false);
    });

    it('returns isValid = false and hasViolations = true for hallucinated numbers', () => {
      const original = 'Refactored backend code.';
      const proposed = 'Refactored backend code saving $500k across 10M users.';

      const report = validateClaimIntegrity(original, proposed, []);
      expect(report.isValid).toBe(false);
      expect(report.hasViolations).toBe(true);
    });
  });
});
