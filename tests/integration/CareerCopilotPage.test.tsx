import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CareerCopilotPage } from '@/features/copilot/pages/CareerCopilotPage';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { CopilotStorageService } from '@/features/copilot/services/copilotStorageService';
import type { CareerConversation } from '@/features/copilot/types/copilot.types';
import type { ResumeData } from '@/features/resumes/types/resume.types';

vi.mock('@/features/resumes/services/resumeService');
vi.mock('@/features/copilot/services/copilotStorageService');

const mockResume: ResumeData = {
  id: 'res-copilot',
  userId: 'test-user',
  title: 'Senior Frontend Resume',
  templateId: 'jakes-technical',
  sectionsOrder: ['personal', 'skills'],
  personalInfo: {
    fullName: 'Morgan Lee',
    professionalTitle: 'Senior Frontend Engineer',
    email: 'morgan@example.com',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    summary: '',
  },
  skillCategories: [{ id: '1', name: 'Languages', skills: ['React', 'TypeScript'] }],
  experiences: [],
  projects: [],
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

const mockConversations: CareerConversation[] = [
  {
    id: 'conv-1',
    userId: 'test-user',
    title: 'Resume Bullet Strategy',
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        userId: 'test-user',
        role: 'user',
        content: 'How can I improve my project highlights?',
        createdAt: '2026-01-01T10:00:00Z',
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        userId: 'test-user',
        role: 'assistant',
        content: 'Quantify your impact using the Action + Context + Result formula.',
        metadata: {
          actionableSuggestions: ['Add measurable performance metrics'],
        },
        createdAt: '2026-01-01T10:00:05Z',
      },
    ],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:05Z',
  },
];

describe('CareerCopilotPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ResumeService.listResumes).mockResolvedValue([
      { id: 'res-copilot', title: 'Senior Frontend Resume', templateId: 'jakes-technical', updatedAt: '2026-01-01' } as any,
    ]);
    vi.mocked(ResumeService.getResume).mockResolvedValue(mockResume);
    vi.mocked(CopilotStorageService.listConversations).mockResolvedValue(mockConversations);
  });

  it('renders chat workspace, conversation history, and message bubbles', async () => {
    render(
      <BrowserRouter>
        <CareerCopilotPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('AI Career Copilot')).toBeInTheDocument();
      expect(screen.getByText('Resume Bullet Strategy')).toBeInTheDocument();
      expect(screen.getByText('How can I improve my project highlights?')).toBeInTheDocument();
      expect(screen.getByText(/Quantify your impact using the Action/i)).toBeInTheDocument();
    });
  });

  it('displays resume context badge when active', async () => {
    render(
      <BrowserRouter>
        <CareerCopilotPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior Frontend Resume')).toBeInTheDocument();
    });
  });

  it('allows typing and triggers message sending', async () => {
    vi.mocked(CopilotStorageService.addMessage).mockResolvedValue({
      id: 'msg-new',
      conversationId: 'conv-1',
      userId: 'test-user',
      role: 'user',
      content: 'What skills should I learn?',
      createdAt: '2026-01-01T11:00:00Z',
    });

    render(
      <BrowserRouter>
        <CareerCopilotPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask about resume refinement/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Ask about resume refinement/i);
    fireEvent.change(textarea, { target: { value: 'What skills should I learn?' } });

    const sendBtn = screen.getByRole('button', { name: '' }); // Send button
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(CopilotStorageService.addMessage).toHaveBeenCalled();
    });
  });
});
