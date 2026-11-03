import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SummaryOptimizerCard } from '@/features/optimizer/components/SummaryOptimizerCard';
import type { OptimizeSummaryResult } from '@/features/optimizer/types/optimizer.types';

describe('SummaryOptimizerCard Component', () => {
  const mockResult: OptimizeSummaryResult = {
    originalSummary: 'Software developer building web apps.',
    alternatives: [
      {
        id: 'alt-1',
        text: 'Results-driven Senior Full-Stack Engineer with proven experience designing and scaling production systems.',
        tone: 'impact-driven',
        keywordsUsed: ['React', 'TypeScript', 'Node.js'],
        rationale: 'Highlights quantifiable delivery and cross-functional leadership.',
        requiresConfirmation: true,
        suggestedPlaceholders: ['[add measurable impact if available, e.g. 35% latency reduction]'],
      },
      {
        id: 'alt-2',
        text: 'Technical Senior Full-Stack Engineer specializing in distributed architectures and maintainable code.',
        tone: 'technical-focus',
        keywordsUsed: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        rationale: 'Focuses deeply on technical depth and tooling alignment.',
        requiresConfirmation: false,
        suggestedPlaceholders: [],
      },
      {
        id: 'alt-3',
        text: 'Accomplished Senior Full-Stack Engineer driving engineering excellence.',
        tone: 'executive',
        keywordsUsed: ['React', 'TypeScript'],
        rationale: 'Emphasizes strategic ownership.',
        requiresConfirmation: false,
        suggestedPlaceholders: [],
      },
    ],
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: 15,
  };

  it('renders original summary and ungenerated state', () => {
    const handleGenerate = vi.fn();
    render(
      <SummaryOptimizerCard
        originalSummary="Experienced engineer."
        summaryResult={null}
        isLoading={false}
        error={null}
        stagedSummary={null}
        onGenerate={handleGenerate}
        onStage={vi.fn()}
        onUnstage={vi.fn()}
      />
    );

    expect(screen.getByText('Current Resume Summary')).toBeInTheDocument();
    expect(screen.getByText('Experienced engineer.')).toBeInTheDocument();
    expect(screen.getByText('Summary Alternatives Not Yet Generated')).toBeInTheDocument();

    const generateBtn = screen.getByRole('button', { name: /generate summary rewrites/i });
    fireEvent.click(generateBtn);
    expect(handleGenerate).toHaveBeenCalled();
  });

  it('renders generated alternatives, tone tabs, keywords, and placeholders', () => {
    const handleStage = vi.fn();
    render(
      <SummaryOptimizerCard
        originalSummary="Experienced engineer."
        summaryResult={mockResult}
        isLoading={false}
        error={null}
        stagedSummary={null}
        onGenerate={vi.fn()}
        onStage={handleStage}
        onUnstage={vi.fn()}
      />
    );

    // Active tone tab text
    expect(screen.getByText(/Results-driven Senior Full-Stack Engineer/i)).toBeInTheDocument();
    expect(screen.getByText('Grounded Heuristics')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Requires Metric Confirmation')).toBeInTheDocument();

    // Switch tone to technical focus
    const techTab = screen.getByRole('button', { name: /technical focus/i });
    fireEvent.click(techTab);
    expect(screen.getByText(/Technical Senior Full-Stack Engineer/i)).toBeInTheDocument();

    // Stage button
    const stageBtn = screen.getByRole('button', { name: /apply to staged changes/i });
    fireEvent.click(stageBtn);
    expect(handleStage).toHaveBeenCalled();
  });

  it('displays loading state and error alert', () => {
    render(
      <SummaryOptimizerCard
        originalSummary=""
        summaryResult={null}
        isLoading={true}
        error="Network error generating summaries."
        stagedSummary={null}
        onGenerate={vi.fn()}
        onStage={vi.fn()}
        onUnstage={vi.fn()}
      />
    );

    expect(screen.getByText('Network error generating summaries.')).toBeInTheDocument();
    expect(screen.getByText(/Grounding summary alternatives/i)).toBeInTheDocument();
  });

  it('allows inline editing of summary alternative and stages customized text', () => {
    const handleStage = vi.fn();
    render(
      <SummaryOptimizerCard
        originalSummary="Experienced engineer."
        summaryResult={mockResult}
        isLoading={false}
        error={null}
        stagedSummary={null}
        onGenerate={vi.fn()}
        onStage={handleStage}
        onUnstage={vi.fn()}
      />
    );

    // Click "Edit & Customize"
    const editBtn = screen.getByRole('button', { name: /edit & customize/i });
    fireEvent.click(editBtn);

    // Textarea should now be present
    const textarea = screen.getByPlaceholderText(/edit your professional summary/i);
    expect(textarea).toBeInTheDocument();

    // Type customized summary
    fireEvent.change(textarea, {
      target: { value: 'Custom tailored summary with verified 40% performance gain.' },
    });

    // Click "Done"
    const doneBtn = screen.getByRole('button', { name: /done editing/i });
    fireEvent.click(doneBtn);

    // Staging should now pass the custom edited text
    const stageBtn = screen.getByRole('button', { name: /apply to staged changes/i });
    fireEvent.click(stageBtn);

    expect(handleStage).toHaveBeenCalledWith(
      'Custom tailored summary with verified 40% performance gain.',
      'impact-driven'
    );
  });

  it('allows dismissing an alternative', () => {
    render(
      <SummaryOptimizerCard
        originalSummary="Experienced engineer."
        summaryResult={mockResult}
        isLoading={false}
        error={null}
        stagedSummary={null}
        onGenerate={vi.fn()}
        onStage={vi.fn()}
        onUnstage={vi.fn()}
      />
    );

    const dismissBtn = screen.getByTitle('Dismiss this alternative');
    fireEvent.click(dismissBtn);

    // Should switch or show dismissed notice if all dismissed
    expect(screen.queryByText(mockResult.alternatives[0].text)).not.toBeInTheDocument();
  });
});
