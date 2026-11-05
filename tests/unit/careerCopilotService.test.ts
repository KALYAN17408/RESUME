import { describe, it, expect } from 'vitest';
import { synthesizeCareerGuidance } from '@/features/copilot/services/careerCopilotService';
import type { ResumeData } from '@/features/resumes/types/resume.types';

const mockResume: ResumeData = {
  id: 'resume-copilot-1',
  userId: 'user-1',
  title: 'Full Stack Engineer Resume',
  templateId: 'jakes-technical',
  sectionsOrder: ['personal', 'skills', 'experience'],
  personalInfo: {
    fullName: 'Casey Morgan',
    professionalTitle: 'Full Stack Engineer',
    email: 'casey@example.com',
    phone: '555-1234',
    location: 'Austin, TX',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    summary: 'Full Stack Engineer with 4 years building web apps.',
  },
  skillCategories: [
    { id: '1', name: 'Languages', skills: ['TypeScript', 'Python', 'SQL'] },
    { id: '2', name: 'Frameworks', skills: ['React', 'FastAPI', 'Node.js'] },
  ],
  experiences: [
    {
      id: 'e1',
      jobTitle: 'Software Engineer',
      company: 'Apex Systems',
      location: 'Austin, TX',
      startDate: '2022-03',
      endDate: 'Present',
      current: true,
      highlights: ['Built payment APIs serving 100k daily requests with 99.99% uptime.'],
    },
  ],
  projects: [
    {
      id: 'p1',
      name: 'OmniStream',
      description: 'Real-time telemetry pipeline built with FastAPI and React.',
      technologies: ['FastAPI', 'React', 'Redis'],
    },
  ],
  educations: [],
  enabledSections: {} as any,
  customization: {
    accentColor: '#7C3AED',
    fontFamily: 'Inter',
    fontSize: 'medium',
    lineSpacing: 'normal',
    margins: 'normal',
  },
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
} as unknown as ResumeData;

describe('CareerCopilotService & Grounded Synthesizer', () => {
  it('generates structured resume review guidance incorporating real candidate context', () => {
    const result = synthesizeCareerGuidance({
      prompt: 'Review my resume and suggest bullet point improvements',
      conversationHistory: [],
      resumeData: mockResume,
    });

    expect(result.content).toContain('Resume Strategic Analysis');
    expect(result.content).toContain('Full Stack Engineer');
    expect(result.content).toContain('TypeScript');
    expect(result.metadata?.topic).toBe('resume_review');
    expect(result.metadata?.actionableSuggestions?.length).toBeGreaterThan(0);
  });

  it('generates structured skill gap analysis and 90-day learning roadmap', () => {
    const result = synthesizeCareerGuidance({
      prompt: 'What skills are missing from my background for senior roles?',
      conversationHistory: [],
      resumeData: mockResume,
    });

    expect(result.content).toContain('Skills Gap & Learning Strategy');
    expect(result.content).toContain('Cloud Infrastructure');
    expect(result.metadata?.topic).toBe('skill_gap');
  });

  it('provides STAR behavioral interview frameworks', () => {
    const result = synthesizeCareerGuidance({
      prompt: 'How do I answer behavioral interview questions?',
      conversationHistory: [],
      resumeData: mockResume,
    });

    expect(result.content).toContain('STAR Behavioral Method');
    expect(result.content).toContain('Situation:');
    expect(result.content).toContain('Action:');
    expect(result.content).toContain('Result:');
    expect(result.metadata?.topic).toBe('interview_prep');
  });

  it('handles general career queries without hallucinations', () => {
    const result = synthesizeCareerGuidance({
      prompt: 'Hello! What can you help me with?',
      conversationHistory: [],
      resumeData: null,
    });

    expect(result.content).toContain('Career Copilot');
    expect(result.metadata?.topic).toBe('general');
  });
});
