import { describe, it, expect } from 'vitest';
import { generateInterviewQuestions } from '@/features/interviews/services/interviewQuestionGenerator';
import { evaluateAnswer } from '@/features/interviews/services/interviewFeedbackEngine';
import type { ResumeData } from '@/features/resumes/types/resume.types';

const mockResume: ResumeData = {
  id: 'res-interview',
  userId: 'user-1',
  title: 'Full Stack Engineer Resume',
  templateId: 'jakes-technical',
  sectionsOrder: ['personal', 'skills'],
  personalInfo: {
    fullName: 'Robin Chen',
    professionalTitle: 'Full Stack Software Engineer',
    email: 'robin@example.com',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    summary: '',
  },
  skillCategories: [
    { id: '1', name: 'Languages', skills: ['TypeScript', 'Python', 'Go'] },
  ],
  experiences: [],
  projects: [],
  educations: [],
  enabledSections: {} as any,
  customization: {
    accentColor: '#0D9488',
    fontFamily: 'Inter',
    fontSize: 'medium',
    lineSpacing: 'normal',
    margins: 'normal',
  },
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
} as unknown as ResumeData;

describe('InterviewQuestionGenerator', () => {
  it('generates the specified number of questions', () => {
    const questions = generateInterviewQuestions('behavioral', 'Senior Engineer', 'intermediate', 5);
    expect(questions.length).toBe(5);
  });

  it('incorporates candidate resume technologies into questions', () => {
    const questions = generateInterviewQuestions('technical', 'Backend Developer', 'advanced', 3, mockResume);
    const combined = questions.map((q) => q.question).join(' ');

    expect(combined).toContain('TypeScript');
    expect(combined).toContain('Backend Developer');
  });

  it('handles mixed interview tracks', () => {
    const questions = generateInterviewQuestions('mixed', 'Full Stack Developer', 'intermediate', 4);
    expect(questions.length).toBe(4);
    const types = questions.map((q) => q.questionType);
    expect(types).toContain('technical');
    expect(types).toContain('behavioral');
  });
});

describe('InterviewFeedbackEngine', () => {
  it('evaluates STAR method adherence for behavioral responses', () => {
    const question = 'Tell me about a time you handled a severe production issue.';
    const answer =
      'During a high-traffic sale at my previous company, we experienced database lock timeouts. My goal was to restore checkout availability within 30 minutes. I implemented query index caching in Redis and isolated slow write queries. As a result, database CPU dropped by 65% and we maintained 100% checkout uptime with zero lost transactions.';

    const feedback = evaluateAnswer(question, answer, 'behavioral');

    expect(feedback.starEvaluation).toBeDefined();
    expect(feedback.starEvaluation?.situationPresent).toBe(true);
    expect(feedback.starEvaluation?.taskPresent).toBe(true);
    expect(feedback.starEvaluation?.actionPresent).toBe(true);
    expect(feedback.starEvaluation?.resultPresent).toBe(true);
    expect(feedback.relevanceScore).toBeGreaterThanOrEqual(70);
    expect(feedback.clarityScore).toBeGreaterThanOrEqual(80);
    expect(feedback.strengths.length).toBeGreaterThan(0);
  });

  it('identifies missing STAR elements when answer is incomplete', () => {
    const question = 'Tell me about a challenge you solved.';
    const answer = 'I just wrote some code to fix a bug.';

    const feedback = evaluateAnswer(question, answer, 'behavioral');

    expect(feedback.clarityScore).toBeLessThan(70);
    expect(feedback.improvements.length).toBeGreaterThan(0);
  });

  it('provides structured sample framework and recommendations', () => {
    const question = 'How do you design scalable distributed systems?';
    const answer =
      'I structure distributed architectures around asynchronous event buses and horizontal replication.';

    const feedback = evaluateAnswer(question, answer, 'technical');

    expect(feedback.suggestedAnswerStructure).toContain('Thesis');
    expect(feedback.sampleAnswer).toContain('Example Structure');
  });
});
