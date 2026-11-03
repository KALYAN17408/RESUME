import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OptimizationSessionHistory } from '@/features/optimizer/components/OptimizationSessionHistory';
import { OptimizationSessionService } from '@/features/optimizer/services/optimizationSessionService';
import type { OptimizationSession, OptimizationSessionListItem } from '@/features/optimizer/types/optimizer.types';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';

describe('OptimizationSessionHistory Component', () => {
  const sampleResume = createSampleResume('user_123', 'jakes-technical');

  const mockSessionsList: OptimizationSessionListItem[] = [
    {
      id: 'session-1',
      userId: 'user_123',
      resumeId: sampleResume.id,
      resumeTitle: 'Software Engineer Resume',
      sessionName: 'Stripe Senior Engineer Optimization',
      jobTitle: 'Senior Software Engineer',
      companyName: 'Stripe',
      status: 'in_progress',
      stagedCount: 3,
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-02T12:00:00Z',
      lastOpenedAt: '2026-11-02T12:00:00Z',
    },
    {
      id: 'session-2',
      userId: 'user_123',
      resumeId: sampleResume.id,
      resumeTitle: 'Software Engineer Resume',
      sessionName: 'Google Tech Lead Tailoring',
      jobTitle: 'Staff Engineer',
      companyName: 'Google',
      status: 'completed',
      stagedCount: 0,
      createdAt: '2026-10-25T08:00:00Z',
      updatedAt: '2026-10-26T09:00:00Z',
      lastOpenedAt: '2026-10-26T09:00:00Z',
    },
  ];

  const fullMockSession: OptimizationSession = {
    id: 'session-1',
    userId: 'user_123',
    resumeId: sampleResume.id,
    resumeTitle: 'Software Engineer Resume',
    sessionName: 'Stripe Senior Engineer Optimization',
    jobTitle: 'Senior Software Engineer',
    companyName: 'Stripe',
    jobDescription: 'High-throughput payment services role.',
    resumeVersionId: sampleResume.id,
    originalResumeSnapshot: sampleResume,
    optimizationResults: {
      summaryResult: null,
      bulletResults: {},
      keywordResult: null,
    },
    stagedChanges: {
      stagedSummary: null,
      stagedBullets: [],
      confirmedSkills: [],
      learningGoals: [],
      rejectedKeywords: [],
    },
    coverLetter: {
      coverLetterResult: null,
      editedCoverLetter: '',
      hiringManagerName: '',
      additionalCoverLetterContext: '',
      stagedCoverLetter: null,
    },
    status: 'in_progress',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-02T12:00:00Z',
    lastOpenedAt: '2026-11-02T12:00:00Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(OptimizationSessionService, 'listSessions').mockResolvedValue(mockSessionsList);
    vi.spyOn(OptimizationSessionService, 'getSessionById').mockResolvedValue(fullMockSession);
    vi.spyOn(OptimizationSessionService, 'renameSession').mockResolvedValue(true);
    vi.spyOn(OptimizationSessionService, 'deleteSession').mockResolvedValue(true);
  });

  it('renders modal when open and displays user sessions list', async () => {
    render(
      <OptimizationSessionHistory
        isOpen={true}
        onClose={vi.fn()}
        userId="user_123"
        onSelectSession={vi.fn()}
      />
    );

    expect(screen.getByText('Optimization Sessions History')).toBeInTheDocument();
    expect(screen.getByText(/Loading optimization history.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Stripe Senior Engineer Optimization')).toBeInTheDocument();
      expect(screen.getByText('Google Tech Lead Tailoring')).toBeInTheDocument();
    });

    expect(screen.getByText('3 staged')).toBeInTheDocument();
    expect(screen.getByText('0 staged')).toBeInTheDocument();
  });

  it('filters sessions by search input query', async () => {
    render(
      <OptimizationSessionHistory
        isOpen={true}
        onClose={vi.fn()}
        userId="user_123"
        onSelectSession={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Stripe Senior Engineer Optimization')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search sessions by name, job, or company/i);
    fireEvent.change(searchInput, { target: { value: 'Google' } });

    expect(screen.queryByText('Stripe Senior Engineer Optimization')).not.toBeInTheDocument();
    expect(screen.getByText('Google Tech Lead Tailoring')).toBeInTheDocument();
  });

  it('filters sessions by status dropdown', async () => {
    render(
      <OptimizationSessionHistory
        isOpen={true}
        onClose={vi.fn()}
        userId="user_123"
        onSelectSession={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Stripe Senior Engineer Optimization')).toBeInTheDocument();
    });

    const selectDropdown = screen.getByRole('combobox');
    fireEvent.change(selectDropdown, { target: { value: 'completed' } });

    expect(screen.queryByText('Stripe Senior Engineer Optimization')).not.toBeInTheDocument();
    expect(screen.getByText('Google Tech Lead Tailoring')).toBeInTheDocument();
  });

  it('calls onSelectSession and onClose when user clicks Open Session', async () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <OptimizationSessionHistory
        isOpen={true}
        onClose={handleClose}
        userId="user_123"
        onSelectSession={handleSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Stripe Senior Engineer Optimization')).toBeInTheDocument();
    });

    const openButtons = screen.getAllByRole('button', { name: /Open Session/i });
    fireEvent.click(openButtons[0]);

    await waitFor(() => {
      expect(OptimizationSessionService.getSessionById).toHaveBeenCalledWith('session-1', 'user_123');
      expect(handleSelect).toHaveBeenCalledWith(fullMockSession);
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('allows renaming a session inline', async () => {
    render(
      <OptimizationSessionHistory
        isOpen={true}
        onClose={vi.fn()}
        userId="user_123"
        onSelectSession={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Stripe Senior Engineer Optimization')).toBeInTheDocument();
    });

    const renameButtons = screen.getAllByTitle('Rename session');
    fireEvent.click(renameButtons[0]);

    const editInput = screen.getByDisplayValue('Stripe Senior Engineer Optimization');
    fireEvent.change(editInput, { target: { value: 'Stripe Staff Role 2026' } });

    const saveButton = screen.getByTitle('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(OptimizationSessionService.renameSession).toHaveBeenCalledWith('session-1', 'Stripe Staff Role 2026', 'user_123');
      expect(screen.getByText('Stripe Staff Role 2026')).toBeInTheDocument();
    });
  });

  it('allows deleting a session after confirmation', async () => {
    render(
      <OptimizationSessionHistory
        isOpen={true}
        onClose={vi.fn()}
        userId="user_123"
        onSelectSession={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Stripe Senior Engineer Optimization')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete session');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete this session?')).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole('button', { name: /Yes, Delete/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(OptimizationSessionService.deleteSession).toHaveBeenCalledWith('session-1', 'user_123');
      expect(screen.queryByText('Stripe Senior Engineer Optimization')).not.toBeInTheDocument();
    });
  });

  it('displays empty state when user has no optimization sessions', async () => {
    vi.spyOn(OptimizationSessionService, 'listSessions').mockResolvedValue([]);

    render(
      <OptimizationSessionHistory
        isOpen={true}
        onClose={vi.fn()}
        userId="user_123"
        onSelectSession={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Optimization Sessions Yet')).toBeInTheDocument();
    });
  });
});
