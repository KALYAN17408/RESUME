import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  countTermOccurrences,
  extractKeywordsFromJob,
  analyzeSections,
  analyzeFormatting,
  generateRecommendations,
  runAtsAnalysis,
} from '@/features/analyzer/services/atsEngine';
import type { AtsAnalysisInput } from '@/features/analyzer/types/analyzer.types';

describe('ATS Analysis Engine (Deterministic Multi-Vector)', () => {
  const sampleJobDescription = `
Senior Full-Stack Engineer

Requirements:
- 5+ years experience building web applications using React, TypeScript, and Node.js.
- Strong knowledge of PostgreSQL, Redis, and REST APIs.
- Experience with Docker, Kubernetes, and CI/CD pipelines on AWS.
- Demonstrated experience mentoring engineers, writing clean code, and conducting code reviews.
- Bachelor's degree in Computer Science or related field.
  `;

  const sampleResumeText = `
Alex Mercer
alex.mercer@example.com | (555) 019-2834 | San Francisco, CA | linkedin.com/in/alexmercer | github.com/alexmercer

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 6+ years of experience architecting scalable distributed systems, high-throughput REST APIs, and modern web applications using TypeScript and React.

WORK EXPERIENCE
Lead Software Engineer | TechScale Inc. | Jan 2021 - Present
• Architected event-driven microservices with Node.js and PostgreSQL, reducing latency by 45% and supporting 2.5M daily active users.
• Spearheaded migration from legacy monolithic architecture to Docker containers orchestrated with Kubernetes on AWS, cutting cloud expenditure by $120,000 annually.
• Engineered responsive user interfaces in React and TypeScript, boosting customer conversion rates by 28%.
• Implemented automated CI/CD deployment pipelines using GitHub Actions, decreasing build times from 35 minutes to 6 minutes.
• Mentored 5 junior engineers and instituted strict code reviews standards across the engineering department.

EDUCATION
B.S. in Computer Science | Stanford University | 2016 - 2020 | GPA: 3.85

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML, CSS
Frameworks: React, Next.js, Node.js, Express.js
Databases & Cloud: PostgreSQL, Redis, AWS, Docker, Kubernetes
Tools: Git, GitHub Actions, Jest, Vitest

PROJECTS & CERTIFICATIONS
Cloud Native Microservices Platform [React, Node.js, AWS, Docker]
• Architected open-source distributed event processing platform handling 50k events/sec.
  `;

  describe('Text Normalization & Term Occurrence Counter', () => {
    it('normalizes text while preserving technical keywords', () => {
      expect(normalizeText('React, TypeScript & Node.js!')).toBe('react typescript node.js');
      expect(normalizeText('C++ and C# developer on .NET')).toBe('c++ and c# developer on .net');
      expect(normalizeText('CI/CD Pipelines')).toBe('ci/cd pipelines');
    });

    it('counts term occurrences accurately with boundary preservation', () => {
      const text = 'Expert in React, react, and REACT. Also uses reactive programming.';
      // "React" should match 3 times, not match "reactive"
      expect(countTermOccurrences(text, 'React')).toBe(3);
    });

    it('matches term aliases correctly', () => {
      const text = 'Built microservices using Golang and K8s.';
      expect(countTermOccurrences(text, 'Go', ['golang'])).toBe(1);
      expect(countTermOccurrences(text, 'Kubernetes', ['k8s'])).toBe(1);
    });
  });

  describe('Keyword Extraction from Job Description', () => {
    it('extracts technical taxonomy terms with appropriate importance', () => {
      const { detectedTaxonomy } = extractKeywordsFromJob(sampleJobDescription);
      const terms = detectedTaxonomy.map((t) => t.term);

      expect(terms).toContain('React');
      expect(terms).toContain('TypeScript');
      expect(terms).toContain('Node.js');
      expect(terms).toContain('PostgreSQL');
      expect(terms).toContain('AWS');
      expect(terms).toContain('Docker');
    });

    it('does not extract stop-words or generic filler words as keywords', () => {
      const { detectedTaxonomy, extractedPhrases } = extractKeywordsFromJob(
        'The candidate must have strong experience with work and day to day requirements.'
      );
      const allExtracted = [...detectedTaxonomy, ...extractedPhrases].map((t) => t.normalized);
      expect(allExtracted).not.toContain('the');
      expect(allExtracted).not.toContain('with');
      expect(allExtracted).not.toContain('candidate');
      expect(allExtracted).not.toContain('experience');
    });
  });

  describe('Section Completeness Analysis', () => {
    it('identifies all 6 standard resume sections in a complete resume', () => {
      const sections = analyzeSections(sampleResumeText);
      expect(sections).toHaveLength(6);

      const contact = sections.find((s) => s.id === 'contact_info');
      expect(contact?.status).toBe('complete');
      expect(contact?.found).toBe(true);

      const exp = sections.find((s) => s.id === 'experience');
      expect(exp?.status).toBe('complete');

      const edu = sections.find((s) => s.id === 'education');
      expect(edu?.status).toBe('complete');

      const skills = sections.find((s) => s.id === 'skills');
      expect(skills?.status).toBe('complete');
    });

    it('flags missing sections when absent from resume text', () => {
      const bareText = 'John Doe. Software Engineer with some general projects.';
      const sections = analyzeSections(bareText);

      const exp = sections.find((s) => s.id === 'experience');
      expect(exp?.status).toBe('missing');

      const edu = sections.find((s) => s.id === 'education');
      expect(edu?.status).toBe('missing');
    });
  });

  describe('Formatting & Readability Checks', () => {
    it('evaluates word count, action verbs, and quantifiable metrics', () => {
      const result = analyzeFormatting(sampleResumeText);

      expect(result.wordCount).toBeGreaterThan(150);
      expect(result.actionVerbCount).toBeGreaterThanOrEqual(5);
      expect(result.metricCount).toBeGreaterThanOrEqual(3);

      const verbCheck = result.checks.find((c) => c.id === 'action_verbs');
      expect(verbCheck?.status).toBe('pass');

      const metricCheck = result.checks.find((c) => c.id === 'quantifiable_metrics');
      expect(metricCheck?.status).toBe('pass');
    });

    it('warns when resume is overly brief or lacks quantifiable metrics', () => {
      const briefText = 'Bob Smith. bob@example.com. Developer. Helped with coding and worked on features.';
      const result = analyzeFormatting(briefText);

      expect(result.wordCount).toBeLessThan(100);
      const wordCountCheck = result.checks.find((c) => c.id === 'word_count');
      expect(wordCountCheck?.status).toBe('fail');

      const metricCheck = result.checks.find((c) => c.id === 'quantifiable_metrics');
      expect(metricCheck?.status).toBe('fail');
    });
  });

  describe('Recommendations Generation', () => {
    it('generates prioritized recommendations for missing critical keywords and metrics', () => {
      const missingKeywords = [
        {
          term: 'Kubernetes',
          normalized: 'kubernetes',
          category: 'cloud_devops' as const,
          importance: 'critical' as const,
          countInJob: 3,
          countInResume: 0,
          matched: false,
        },
      ];

      const sections = analyzeSections('Simple resume with no education section');
      const { checks: formatting } = analyzeFormatting('Short text without numbers or action verbs.');

      const recs = generateRecommendations(missingKeywords, sections, formatting);
      expect(recs.length).toBeGreaterThan(0);

      const highRecs = recs.filter((r) => r.severity === 'high');
      expect(highRecs.length).toBeGreaterThanOrEqual(1);
      expect(highRecs.some((r) => r.title.includes('Kubernetes') || r.description.includes('Kubernetes'))).toBe(true);
    });
  });

  describe('Full End-to-End ATS Analysis Engine', () => {
    it('calculates bounded overall score and detailed breakdown for aligned resume', () => {
      const input: AtsAnalysisInput = {
        sourceType: 'existing_resume',
        jobDescription: sampleJobDescription,
        resumeText: sampleResumeText,
        jobTitle: 'Senior Full-Stack Engineer',
      };

      const report = runAtsAnalysis(input, 'user_123');

      expect(report.id).toBeTruthy();
      expect(report.userId).toBe('user_123');
      expect(report.scores.overallScore).toBeGreaterThanOrEqual(75);
      expect(report.scores.overallScore).toBeLessThanOrEqual(100);
      expect(['Strong', 'Excellent']).toContain(report.scores.scoreGrade);

      expect(report.scores.keywordScore).toBeGreaterThanOrEqual(70);
      expect(report.scores.skillsScore).toBeGreaterThanOrEqual(70);
      expect(report.scores.sectionScore).toBe(100);
      expect(report.scores.formattingScore).toBeGreaterThanOrEqual(80);

      expect(report.matchedKeywords.length).toBeGreaterThan(0);
      expect(report.matchedKeywords.some((k) => k.term === 'React')).toBe(true);
      expect(report.matchedKeywords.some((k) => k.term === 'TypeScript')).toBe(true);
    });

    it('calculates lower score when resume lacks target role keywords', () => {
      const unalignedResume = `
Jane Doe
jane@example.com | 555-0100 | Boston, MA
PROFESSIONAL SUMMARY
Experienced marketing manager with 5 years in digital advertising and content creation.
WORK EXPERIENCE
Marketing Lead | Brand Co | 2020 - Present
• Directed social media campaigns across Instagram and TikTok.
• Managed a team of 3 copywriters.
EDUCATION
B.A. in Communications | Boston College | 2019
      `;

      const input: AtsAnalysisInput = {
        sourceType: 'existing_resume',
        jobDescription: sampleJobDescription, // Technical Software Engineer JD
        resumeText: unalignedResume,
      };

      const report = runAtsAnalysis(input, 'user_marketing');

      expect(report.scores.overallScore).toBeLessThan(65);
      expect(report.scores.skillsScore).toBeLessThan(50);
      expect(report.missingKeywords.length).toBeGreaterThan(report.matchedKeywords.length);
    });

    it('throws validation error when resume text or job description is empty', () => {
      expect(() => {
        runAtsAnalysis({ sourceType: 'existing_resume', resumeText: '', jobDescription: 'Some JD' }, 'user_1');
      }).toThrow(/resume text is empty/i);

      expect(() => {
        runAtsAnalysis({ sourceType: 'existing_resume', resumeText: 'Some resume', jobDescription: '   ' }, 'user_1');
      }).toThrow(/job description is empty/i);
    });
  });
});
