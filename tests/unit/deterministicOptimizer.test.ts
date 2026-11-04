import { describe, it, expect } from 'vitest';
import {
  rewriteBulletDeterministic,
  optimizeSummaryDeterministic,
  suggestKeywordsDeterministic,
  generateCoverLetterDeterministic,
} from '@/features/optimizer/services/deterministicOptimizer';

describe('Deterministic Grounded Optimizer', () => {
  describe('rewriteBulletDeterministic', () => {
    it('generates 3 alternatives using Google XYZ and Action-Result formulas', () => {
      const result = rewriteBulletDeterministic({
        originalBullet: 'Worked on database queries and caching to improve speed.',
        jobDescription: 'Senior Backend Engineer with PostgreSQL and Redis experience.',
        knownSkills: ['PostgreSQL', 'Redis'],
      });

      expect(result.provider).toBe('deterministic');
      expect(result.isDeterministic).toBe(true);
      expect(result.alternatives).toHaveLength(3);

      const xyzAlt = result.alternatives.find((a) => a.formula === 'XYZ');
      expect(xyzAlt).toBeDefined();
      expect(xyzAlt?.actionVerb).toBe('Engineered');
      // Original had no metric: bullet text is clean without placeholders, metric opportunity is provided separately
      expect(xyzAlt?.text).not.toContain('[add measurable result');
      expect(xyzAlt?.metricOpportunity).toBeDefined();
    });

    it('preserves existing verified metrics and does not replace them with placeholders', () => {
      const result = rewriteBulletDeterministic({
        originalBullet: 'Optimized PostgreSQL queries reducing p99 latency by 45% across 2M daily requests.',
        jobDescription: 'Senior Backend Engineer.',
        knownSkills: ['PostgreSQL'],
      });

      const xyzAlt = result.alternatives[0];
      expect(xyzAlt.text).toMatch(/45%/);
      expect(xyzAlt.requiresConfirmation).toBe(false);
    });
  });

  describe('optimizeSummaryDeterministic', () => {
    it('produces 3 tone variants grounded in target role and candidate skills', () => {
      const result = optimizeSummaryDeterministic({
        currentSummary: 'Full stack developer building web apps.',
        targetJobTitle: 'Senior Full-Stack Engineer',
        targetCompany: 'Stripe',
        jobDescription: 'Seeking Senior Engineer with React, TypeScript, and AWS expertise.',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
      });

      expect(result.isDeterministic).toBe(true);
      expect(result.alternatives).toHaveLength(3);

      const tones = result.alternatives.map((a) => a.tone);
      expect(tones).toContain('professional-concise');
      expect(tones).toContain('skills-focused');
      expect(tones).toContain('role-aligned');

      const conciseAlt = result.alternatives.find((a) => a.tone === 'professional-concise');
      expect(conciseAlt?.text).toContain('Senior Full-Stack Engineer at Stripe');
      expect(conciseAlt?.text).toContain('React');
    });
  });

  describe('suggestKeywordsDeterministic', () => {
    it('detects matched and missing keywords from job description against resume text', () => {
      const jd = `
        We are hiring a Lead Cloud Architect.
        Requirements:
        • Deep expertise with Kubernetes, Kubernetes, and Kubernetes cluster orchestration.
        • Strong proficiency in Go, Docker, and Terraform.
        • Experience with AWS, DynamoDB, and CI/CD pipelines.
      `;

      const result = suggestKeywordsDeterministic({
        resumeTextOrSkills: 'Senior Engineer with Docker, Go, and AWS cloud experience.',
        jobDescription: jd,
        existingSkills: ['Docker', 'Go', 'AWS'],
      });

      expect(result.isDeterministic).toBe(true);

      // Kubernetes is mentioned 3 times in JD and absent in resume -> critical missing
      const k8s = result.missingKeywords.find((k) => k.term === 'Kubernetes');
      expect(k8s).toBeDefined();
      expect(k8s?.importance).toBe('critical');
      expect(k8s?.frequencyInJD).toBe(3);
      expect(k8s?.evidenceStatus).toBe('missing');

      // Docker is in resume -> matched
      const docker = result.matchedKeywords.find((k) => k.term === 'Docker');
      expect(docker).toBeDefined();
      expect(docker?.evidenceStatus).toBe('in_resume');
    });
  });

  describe('generateCoverLetterDeterministic', () => {
    it('creates a personalized, grounded cover letter with confirmation markers', () => {
      const result = generateCoverLetterDeterministic({
        candidateName: 'Jane Smith',
        professionalTitle: 'Lead Software Architect',
        jobTitle: 'Principal Cloud Engineer',
        companyName: 'Datadog',
        hiringManagerName: 'Alex Rivera',
        jobDescription: 'Looking for a Principal Cloud Engineer to scale monitoring systems.',
        skills: ['Kubernetes', 'Go', 'Distributed Systems'],
        keyAchievements: ['scaled core metrics pipeline handling 5B daily telemetry events'],
      });

      expect(result.isDeterministic).toBe(true);
      expect(result.requiresConfirmation).toBe(true);
      expect(result.subjectLine).toBe('Application for Principal Cloud Engineer — Jane Smith');
      expect(result.content).toContain('Dear Alex Rivera,');
      expect(result.content).toContain('Principal Cloud Engineer position at Datadog');
      expect(result.content).toContain('scaled core metrics pipeline handling 5B daily telemetry events');
    });
  });
});
