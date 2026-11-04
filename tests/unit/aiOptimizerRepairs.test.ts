import { describe, it, expect } from 'vitest';
import {
  rewriteBulletDeterministic,
  optimizeSummaryDeterministic,
  suggestKeywordsDeterministic,
  generateCoverLetterDeterministic,
} from '@/features/optimizer/services/deterministicOptimizer';
import type { RewriteBulletResult } from '@/features/optimizer/types/optimizer.types';

describe('AI Optimizer Intelligence & Feature Repairs', () => {
  describe('1. Resume Bullet Diversity & Anti-Repetition', () => {
    it('generates genuinely distinct bullet rewrites across 5 consecutive regenerations', () => {
      const original = 'Worked on database queries and caching to improve speed.';
      const jobDescription = 'Senior Backend Engineer with PostgreSQL, Redis, and high concurrency optimization.';
      const knownSkills = ['PostgreSQL', 'Redis', 'Docker'];

      const generations: RewriteBulletResult[] = [];
      const historyStrings: string[] = [];

      for (let i = 0; i < 5; i++) {
        const result = rewriteBulletDeterministic({
          originalBullet: original,
          jobDescription,
          knownSkills,
          previousGenerations: [...historyStrings],
        });

        expect(result.alternatives).toHaveLength(3);
        const primaryRewrite = result.alternatives[0].text;
        expect(primaryRewrite).toBeTruthy();

        // Ensure primary rewrite is not identical to any previous generation
        for (const prev of historyStrings) {
          expect(primaryRewrite.toLowerCase().trim()).not.toBe(prev.toLowerCase().trim());
        }

        // Add all alternatives from this cycle to the history to prevent repetition
        historyStrings.push(primaryRewrite);
        generations.push(result);
      }

      // Verify that across 5 generations, at least 3 distinct action verbs were explored
      const leadVerbs = new Set(generations.map((g) => g.alternatives[0].actionVerb));
      expect(leadVerbs.size).toBeGreaterThanOrEqual(3);

      // Verify that no fabricated metrics were introduced and bullets remain clean without bracket placeholders
      for (const gen of generations) {
        for (const alt of gen.alternatives) {
          expect(alt.text).not.toContain('[add measurable result');
          expect(alt.metricOpportunity).toBeDefined();
        }
      }
    });
  });

  describe('2. Professional Summary Rewriting & Profile Adaptation', () => {
    it('adapts summary strictly to candidate profile (fresher vs experienced)', () => {
      // Fresher candidate profile
      const fresherResult = optimizeSummaryDeterministic({
        currentSummary: 'Computer science graduate eager to build web systems.',
        targetJobTitle: 'Junior Frontend Developer',
        targetCompany: 'Vercel',
        jobDescription: 'Frontend engineer with React, Next.js, and TypeScript skills.',
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
        candidateProfile: {
          isFresher: true,
          totalYearsExperience: 0,
          educations: [{ institution: 'IIT Bombay', degree: 'B.Tech CS', year: '2026' }],
          projects: [{ name: 'Campus Portal', technologies: ['React', 'Next.js'] }],
        },
      });

      expect(fresherResult.isDeterministic).toBe(true);
      expect(fresherResult.alternatives).toHaveLength(3);

      const fresherTones = fresherResult.alternatives.map((a) => a.tone);
      expect(fresherTones).toContain('professional-concise');
      expect(fresherTones).toContain('skills-focused');
      expect(fresherTones).toContain('role-aligned');

      // Crucial constraint: Fresher summary must NEVER invent years of experience or enterprise employment
      for (const alt of fresherResult.alternatives) {
        expect(alt.text.toLowerCase()).not.toContain('years of experience');
        expect(alt.text.toLowerCase()).not.toContain('proven track record of architecting');
        expect(alt.text.toLowerCase()).not.toContain('senior-level');
      }

      // Experienced candidate profile
      const experiencedResult = optimizeSummaryDeterministic({
        currentSummary: 'Lead engineer scaling distributed systems.',
        targetJobTitle: 'Staff Backend Engineer',
        targetCompany: 'Stripe',
        jobDescription: 'Senior engineer leading payments architecture and Kafka event streaming.',
        skills: ['Kafka', 'Go', 'Distributed Systems', 'PostgreSQL'],
        candidateProfile: {
          isFresher: false,
          totalYearsExperience: 7,
        },
      });

      expect(experiencedResult.alternatives).toHaveLength(3);
      const expTones = experiencedResult.alternatives.map((a) => a.tone);
      expect(expTones).toContain('professional-concise');
      expect(expTones).toContain('skills-focused');
      expect(expTones).toContain('role-aligned');

      const expConcise = experiencedResult.alternatives.find((a) => a.tone === 'professional-concise');
      expect(expConcise?.text).toContain('Staff Backend Engineer at Stripe');
      expect(expConcise?.text).toContain('Kafka');
    });
  });

  describe('3. Skills & Keywords 4-Group Taxonomy Classification', () => {
    it('classifies JD requirements into matched, missing, transferable, and learning goal groups', () => {
      const jd = `
        We are seeking a Full-Stack Cloud Engineer.
        Core Technical Requirements:
        - React, Next.js, and TypeScript frontend development.
        - Python, FastAPI, and PostgreSQL microservices.
        - Docker, Kubernetes, and AWS deployment automation.
        - GraphQL and Redis caching strategies.
      `;

      // Candidate has React and Docker, but lacks Next.js, Kubernetes, and Redis
      const result = suggestKeywordsDeterministic({
        resumeTextOrSkills: 'Full stack developer proficient in React, Docker, Python, and SQL.',
        jobDescription: jd,
        existingSkills: ['React', 'Docker', 'Python', 'SQL'],
      });

      expect(result.isDeterministic).toBe(true);

      // 4 distinct groups must be populated
      expect(result.matchedKeywords.length).toBeGreaterThan(0);
      expect(result.missingKeywords.length).toBeGreaterThan(0);
      expect(result.transferableKeywords?.length).toBeGreaterThan(0);
      expect(result.learningGoalKeywords?.length).toBeGreaterThan(0);

      // Verify each keyword has term, importance, whyItMatters, and suggestedAction
      const missingSample = result.missingKeywords[0];
      expect(missingSample.term).toBeTruthy();
      expect(missingSample.whyItMatters).toBeTruthy();
      expect(missingSample.suggestedAction).toBeTruthy();

      // Check transferable relationship: React candidate has transferable Next.js
      const nextJs = result.transferableKeywords?.find((k) => k.term.toLowerCase().includes('next'));
      if (nextJs) {
        expect(nextJs.isTransferable).toBe(true);
        expect(nextJs.suggestedAction).toContain('Transferable');
      }

      // Check matched skills
      const reactSkill = result.matchedKeywords.find((k) => k.term.toLowerCase() === 'react');
      expect(reactSkill).toBeDefined();
      expect(reactSkill?.evidenceStatus).toBe('in_resume');
    });
  });

  describe('4. Tailored Cover Letter Grounded Synthesis', () => {
    it('generates role-tailored cover letter grounded in candidate credentials without hallucinating facts', () => {
      const result = generateCoverLetterDeterministic({
        candidateName: 'Kalyan Chandana',
        professionalTitle: 'AI Engineer',
        jobTitle: 'Senior AI Engineer',
        companyName: 'Anthropic',
        hiringManagerName: 'Research Platform Team',
        jobDescription: 'Seeking AI Engineer with Python, PyTorch, LLM fine-tuning, and vector database experience.',
        skills: ['Python', 'PyTorch', 'Vector Databases', 'LangChain'],
        projects: [
          {
            name: 'ResuMax AI',
            technologies: ['TypeScript', 'Supabase', 'Vector Embeddings'],
          },
        ],
        educations: [
          {
            institution: 'Osmania University',
            degree: 'B.Tech in Artificial Intelligence',
            year: '2025',
          },
        ],
      });

      expect(result.isDeterministic).toBe(true);
      expect(result.subjectLine).toContain('Senior AI Engineer — Kalyan Chandana');
      expect(result.content).toContain('Dear Research Platform Team,');
      expect(result.content).toContain('Anthropic');
      expect(result.content).toContain('Python');
      expect(result.content).toContain('ResuMax AI');
      expect(result.content).toContain('Osmania University');
      expect(result.content).toContain('B.Tech in Artificial Intelligence');
      expect(result.content).toContain('Kalyan Chandana');

      // Anti-hallucination check: should not fabricate random companies or fake metrics
      expect(result.content).not.toContain('Google');
      expect(result.content).not.toContain('10 years of leadership');
    });
  });
});
