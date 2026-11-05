import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockInterviewPage } from '@/features/interviews/pages/MockInterviewPage';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { InterviewService } from '@/features/interviews/services/interviewService';
import type { MockInterviewSession } from '@/features/interviews/types/interview.types';
import type { ResumeData } from '@/features/resumes/types/resume.types';

vi.mock('@/features/resumes/services/resumeService');
vi.mock('@/features/interviews/services/interviewService');

const mockResume: ResumeData = {
  id: 'res-interview',
  userId: 'test-user',
  title: 'Senior Software Engineer Resume',
  templateId: 'jakes-technical',
  sectionsOrder: ['personal', 'skills'],
  personalInfo: {
    fullName: 'Alex Vance',
    professionalTitle: 'Senior Software Engineer',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    summary: '',
  },
  skillCategories: [],
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

const mockSessions: MockInterviewSession[] = [
  {
    id: 'sess-1',
    userId: 'test-user',
    interviewType: 'behavioral',
    targetRole: 'Senior React Engineer',
    companyName: 'Linear',
    difficulty: 'intermediate',
    totalQuestions: 3,
    currentQuestionIndex: 3,
    status: 'completed',
    overallFeedback: {
      overallScore: 85,
      strengthsSummary: ['Clear STAR delivery'],
      priorityImprovements: ['Quantify business impact'],
      summaryNote: 'Completed practice session.',
    },
    questions: [
      {
        id: 'q1',
        sessionId: 'sess-1',
        questionIndex: 0,
        question: 'Describe a difficult bug you resolved.',
        questionType: 'behavioral',
        userAnswer: 'I fixed a deadlock by reviewing mutex contention.',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('MockInterviewPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ResumeService.listResumes).mockResolvedValue([
      { id: 'res-interview', title: 'Senior Software Engineer Resume', templateId: 'jakes-technical', updatedAt: '2026-01-01' } as any,
    ]);
    vi.mocked(ResumeService.getResume).mockResolvedValue(mockResume);
    vi.mocked(InterviewService.listSessions).mockResolvedValue(mockSessions);
  });

  it('renders mock interview hub, metrics, and past session card', async () => {
    render(
      <BrowserRouter>
        <MockInterviewPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Interactive Mock Interviews')).toBeInTheDocument();
      expect(screen.getByText('Senior React Engineer')).toBeInTheDocument();
      expect(screen.getByText('Linear')).toBeInTheDocument();
      expect(screen.getAllByText('85%').length).toBeGreaterThan(0);
    });
  });

  it('opens interview setup modal when clicking New Mock Interview', async () => {
    render(
      <BrowserRouter>
        <MockInterviewPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Interactive Mock Interviews')).toBeInTheDocument();
    });

    const newBtn = screen.getByRole('button', { name: /New Mock Interview/i });
    fireEvent.click(newBtn);

    await waitFor(() => {
      expect(screen.getByText('Configure Mock Interview')).toBeInTheDocument();
      expect(screen.getByLabelText(/Target Role \*/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Practice Session/i })).toBeInTheDocument();
    });
  });
});
