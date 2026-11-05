import { describe, it, expect } from 'vitest';
import { analyzeJobMatch } from '@/features/jobs/services/jobMatchingEngine';
import type { ResumeData } from '@/features/resumes/types/resume.types';

const mockResume: ResumeData = {
  id: 'resume-123',
  userId: 'user-abc',
  title: 'Full Stack Engineer Resume',
  templateId: 'jakes-technical',
  sectionsOrder: ['personal', 'summary', 'skills', 'experience', 'projects', 'education'],
  personalInfo: {
    fullName: 'Jordan Taylor',
    professionalTitle: 'Senior Full Stack Software Engineer',
    email: 'jordan@example.com',
    phone: '+1 555-0199',
    location: 'Seattle, WA',
    linkedinUrl: 'https://linkedin.com/in/jordantaylor',
    githubUrl: 'https://github.com/jordantaylor',
    portfolioUrl: 'https://jordantaylor.dev',
    summary: 'Experienced Full Stack Engineer with expertise in TypeScript, React, Node.js, and cloud systems.',
  },
  skillCategories: [
    {
      id: 'cat-1',
      name: 'Languages & Frameworks',
      skills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    },
    {
      id: 'cat-2',
      name: 'Cloud & DevOps',
      skills: ['AWS', 'Docker', 'PostgreSQL', 'Git', 'CI/CD'],
    },
  ],
  experiences: [
    {
      id: 'exp-1',
      jobTitle: 'Senior Software Engineer',
      company: 'TechFlow Corp',
      location: 'Seattle, WA',
      startDate: '2022-01',
      endDate: 'Present',
      current: true,
      highlights: [
        'Architected high-throughput microservices using Node.js, TypeScript, and AWS Lambda.',
        'Spearheaded frontend migration to React 18, cutting bundle size by 35%.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'CloudMetrics Engine',
      description: 'Distributed analytics platform built with React, Node.js, Docker, and PostgreSQL.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    },
  ],
  educations: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      institution: 'University of Washington',
      location: 'Seattle, WA',
      startDate: '2016-09',
      endDate: '2020-06',
    },
  ],
  enabledSections: {} as any,
  customization: {
    accentColor: '#2563EB',
    fontFamily: 'Inter',
    fontSize: 'medium',
    lineSpacing: 'normal',
    margins: 'normal',
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
} as unknown as ResumeData;

describe('JobMatchingEngine', () => {
  it('correctly calculates match score and identifies matched vs missing skills', () => {
    const jobDescription = `
      We are looking for a Senior Software Engineer with strong experience in:
      - React and TypeScript
      - Node.js and PostgreSQL
      - Docker and Kubernetes
      - GraphQL and Golang
    `;

    const analysis = analyzeJobMatch(mockResume, jobDescription, 'Senior Software Engineer');

    expect(analysis.overallScore).toBeGreaterThanOrEqual(50);
    expect(analysis.overallScore).toBeLessThanOrEqual(100);

    // React, TypeScript, Node.js, Docker, PostgreSQL should be matched
    expect(analysis.skillsMatch.matched).toContain('React');
    expect(analysis.skillsMatch.matched).toContain('TypeScript');
    expect(analysis.skillsMatch.matched).toContain('Node.js');
    expect(analysis.skillsMatch.matched).toContain('Docker');
    expect(analysis.skillsMatch.matched).toContain('PostgreSQL');

    // Missing skills
    expect(analysis.skillsMatch.missing.length).toBeGreaterThan(0);
    expect(analysis.skillsMatch.matchPercentage).toBeGreaterThanOrEqual(40);
  });

  it('evaluates strong experience alignment when titles match', () => {
    const jobDescription = 'Senior Software Engineer needed for core engineering team.';
    const analysis = analyzeJobMatch(mockResume, jobDescription, 'Senior Software Engineer');

    expect(analysis.experienceAlignment.titleAlignment).toBe('strong');
    expect(analysis.experienceAlignment.relevantRolesFound.length).toBeGreaterThan(0);
  });

  it('evaluates weak experience alignment when titles do not match', () => {
    const jobDescription = 'Chief Marketing Officer responsible for acquisition.';
    const analysis = analyzeJobMatch(mockResume, jobDescription, 'Chief Marketing Officer');

    expect(analysis.experienceAlignment.titleAlignment).toBe('weak');
  });

  it('generates non-empty actionable suggestions and legal disclaimer', () => {
    const jobDescription = `
      Software Developer specializing in Ruby on Rails, Redis, and Kafka.
    `;
    const analysis = analyzeJobMatch(mockResume, jobDescription, 'Software Developer');

    expect(analysis.suggestions.length).toBeGreaterThan(0);
    expect(analysis.disclaimer).toContain('estimate based on keyword frequency');
  });
});
