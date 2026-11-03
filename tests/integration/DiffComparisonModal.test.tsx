import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiffComparisonModal } from '@/features/optimizer/components/DiffComparisonModal';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { StagedSummaryItem, StagedBulletItem, ConfirmedSkillItem } from '@/features/optimizer/hooks/useOptimizer';

describe('DiffComparisonModal Component', () => {
  const sampleResume = createSampleResume('user_test', 'jakes-technical');
  sampleResume.personalInfo.summary = 'Old baseline summary.';

  const mockSummary: StagedSummaryItem = {
    original: 'Old baseline summary.',
    selected: 'New executive summary showcasing cloud scalability.',
    tone: 'executive',
    approved: true,
  };

  const mockBullets: StagedBulletItem[] = [
    {
      key: 'exp_exp-1_0',
      sourceType: 'experience',
      sourceId: sampleResume.experiences[0]?.id || 'exp-1',
      sourceTitle: 'Senior Software Engineer at Stripe',
      bulletIndex: 0,
      original: 'Led web development team.',
      rewritten: 'Directed 8-engineer cross-functional squad reducing sprint cycle times by 30%.',
      formula: 'XYZ',
      approved: true,
    },
  ];

  const mockSkills: ConfirmedSkillItem[] = [
    {
      skill: 'Kubernetes',
      category: 'Databases & Cloud',
      suggestedSection: 'skills',
      approved: true,
    },
  ];

  it('renders modal when open with summary, bullets, and confirmed skills', () => {
    render(
      <DiffComparisonModal
        isOpen={true}
        onClose={vi.fn()}
        resume={sampleResume}
        stagedSummary={mockSummary}
        stagedBullets={mockBullets}
        confirmedSkills={mockSkills}
        onApplyApprovedChanges={vi.fn()}
      />
    );

    expect(screen.getByText(/Review AI Optimizations for/i)).toBeInTheDocument();
    expect(screen.getByText('Professional Summary')).toBeInTheDocument();
    expect(screen.getByText('Old baseline summary.')).toBeInTheDocument();
    expect(screen.getByText('New executive summary showcasing cloud scalability.')).toBeInTheDocument();
    expect(screen.getByText('Experience & Project Bullets (1)')).toBeInTheDocument();
    expect(screen.getByText(/Directed 8-engineer cross-functional squad/i)).toBeInTheDocument();
    expect(screen.getByText('Candidate-Confirmed Skills (1)')).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
  });

  it('handles select all and deselect all controls', () => {
    render(
      <DiffComparisonModal
        isOpen={true}
        onClose={vi.fn()}
        resume={sampleResume}
        stagedSummary={mockSummary}
        stagedBullets={mockBullets}
        confirmedSkills={mockSkills}
        onApplyApprovedChanges={vi.fn()}
      />
    );

    // Initial state: all 3 selected
    expect(screen.getByText('3 of 3 changes selected')).toBeInTheDocument();

    // Deselect all
    const deselectBtn = screen.getByRole('button', { name: /^deselect all$/i });
    fireEvent.click(deselectBtn);
    expect(screen.getByText('0 of 3 changes selected')).toBeInTheDocument();

    // Apply button should now be disabled
    const applyBtn = screen.getByRole('button', { name: /apply approved changes \(0\)/i });
    expect(applyBtn).toBeDisabled();

    // Select all
    const selectAllBtn = screen.getByRole('button', { name: /^select all$/i });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('3 of 3 changes selected')).toBeInTheDocument();
  });

  it('switches to Result Preview mode and displays simulated changes', () => {
    render(
      <DiffComparisonModal
        isOpen={true}
        onClose={vi.fn()}
        resume={sampleResume}
        stagedSummary={mockSummary}
        stagedBullets={mockBullets}
        confirmedSkills={mockSkills}
        onApplyApprovedChanges={vi.fn()}
      />
    );

    const previewBtn = screen.getByRole('button', { name: /result preview/i });
    fireEvent.click(previewBtn);

    expect(screen.getByText('Simulated Result')).toBeInTheDocument();
    expect(screen.getByText(/New executive summary showcasing cloud scalability./i)).toBeInTheDocument();
    expect(screen.getByText(/Newly Added Confirmed Skills/i)).toBeInTheDocument();

    // Switch back to diff
    const backBtn = screen.getByRole('button', { name: /back to diff review/i });
    fireEvent.click(backBtn);
    expect(screen.getByText('Professional Summary')).toBeInTheDocument();
  });

  it('navigates to confirmation step and invokes onApplyApprovedChanges on confirm', async () => {
    const handleApply = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <DiffComparisonModal
        isOpen={true}
        onClose={handleClose}
        resume={sampleResume}
        stagedSummary={mockSummary}
        stagedBullets={mockBullets}
        confirmedSkills={mockSkills}
        onApplyApprovedChanges={handleApply}
      />
    );

    const applyTrigger = screen.getByRole('button', { name: /apply approved changes \(3\)/i });
    fireEvent.click(applyTrigger);

    // Confirmation screen shown
    expect(screen.getByText(/Confirm Version Snapshot & Resume Merge/i)).toBeInTheDocument();
    expect(screen.getByText(/A point-in-time snapshot/i)).toBeInTheDocument();

    // Click confirm & apply
    const confirmBtn = screen.getByRole('button', { name: /confirm & apply to resume/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledTimes(1);
    });

    const passedPayload = handleApply.mock.calls[0][0];
    expect(passedPayload.summary?.selected).toBe(mockSummary.selected);
    expect(passedPayload.bullets?.length).toBe(1);
    expect(passedPayload.skills?.length).toBe(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onApplyApprovedChanges when cancel is clicked', () => {
    const handleClose = vi.fn();
    const handleApply = vi.fn();

    render(
      <DiffComparisonModal
        isOpen={true}
        onClose={handleClose}
        resume={sampleResume}
        stagedSummary={mockSummary}
        stagedBullets={mockBullets}
        confirmedSkills={mockSkills}
        onApplyApprovedChanges={handleApply}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
    expect(handleApply).not.toHaveBeenCalled();
  });
});
