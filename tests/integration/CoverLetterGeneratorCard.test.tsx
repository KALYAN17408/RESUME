import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoverLetterGeneratorCard } from '@/features/optimizer/components/CoverLetterGeneratorCard';
import type { GenerateCoverLetterResult } from '@/features/optimizer/types/optimizer.types';

describe('CoverLetterGeneratorCard Component', () => {
  const mockResult: GenerateCoverLetterResult = {
    content: 'Dear Hiring Team,\n\nI am excited to submit my application for Senior Engineer at Vercel...',
    subjectLine: 'Application for Senior Engineer at Vercel — John Doe',
    usedResumeEvidence: ['5 years experience', 'React', 'Node.js'],
    requiresConfirmation: true,
    suggestedPlaceholders: ['[describe a notable project accomplishment...]'],
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: 18,
  };

  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    // Mock HTMLAnchorElement click to prevent jsdom navigation warning
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('renders ungenerated state with parameters and generate button', () => {
    const handleGenerate = vi.fn();
    render(
      <CoverLetterGeneratorCard
        jobTitle="Staff Engineer"
        companyName="Stripe"
        hiringManagerName=""
        additionalContext=""
        coverLetterResult={null}
        editedCoverLetter=""
        isLoading={false}
        error={null}
        stagedCoverLetter={null}
        onJobTitleChange={vi.fn()}
        onCompanyNameChange={vi.fn()}
        onHiringManagerChange={vi.fn()}
        onAdditionalContextChange={vi.fn()}
        onCoverLetterTextChange={vi.fn()}
        onGenerate={handleGenerate}
        onResetToGenerated={vi.fn()}
        onStageCoverLetter={vi.fn()}
        onUnstageCoverLetter={vi.fn()}
      />
    );

    expect(screen.getByText('AI Cover Letter Generator')).toBeInTheDocument();
    expect(screen.getByText('Cover Letter Not Yet Generated')).toBeInTheDocument();

    const generateBtn = screen.getByRole('button', { name: /generate cover letter/i });
    fireEvent.click(generateBtn);
    expect(handleGenerate).toHaveBeenCalled();
  });

  it('renders generated cover letter, subject line, and confirmation notice', () => {
    const handleTextChange = vi.fn();
    const handleStage = vi.fn();

    render(
      <CoverLetterGeneratorCard
        jobTitle="Senior Engineer"
        companyName="Vercel"
        hiringManagerName="Sarah"
        additionalContext=""
        coverLetterResult={mockResult}
        editedCoverLetter={mockResult.content}
        isLoading={false}
        error={null}
        stagedCoverLetter={null}
        onJobTitleChange={vi.fn()}
        onCompanyNameChange={vi.fn()}
        onHiringManagerChange={vi.fn()}
        onAdditionalContextChange={vi.fn()}
        onCoverLetterTextChange={handleTextChange}
        onGenerate={vi.fn()}
        onResetToGenerated={vi.fn()}
        onStageCoverLetter={handleStage}
        onUnstageCoverLetter={vi.fn()}
      />
    );

    expect(screen.getByText('Grounded Heuristics')).toBeInTheDocument();
    expect(screen.getByText(/Subject: Application for Senior Engineer at Vercel — John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Bracketed placeholders like/i)).toBeInTheDocument();

    // Verify textarea has the content
    const textarea = screen.getByPlaceholderText(/generated cover letter content/i) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toContain('Senior Engineer at Vercel');

    // Change text
    fireEvent.change(textarea, { target: { value: 'Updated cover letter text.' } });
    expect(handleTextChange).toHaveBeenCalledWith('Updated cover letter text.');

    // Stage cover letter
    const stageBtn = screen.getByRole('button', { name: /stage cover letter/i });
    fireEvent.click(stageBtn);
    expect(handleStage).toHaveBeenCalled();
  });

  it('handles parameter input changes and reset to generated', () => {
    const handleJobTitleChange = vi.fn();
    const handleCompanyChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <CoverLetterGeneratorCard
        jobTitle="Frontend Lead"
        companyName="Datadog"
        hiringManagerName=""
        additionalContext=""
        coverLetterResult={mockResult}
        editedCoverLetter="Edited draft"
        isLoading={false}
        error={null}
        stagedCoverLetter={null}
        onJobTitleChange={handleJobTitleChange}
        onCompanyNameChange={handleCompanyChange}
        onHiringManagerChange={vi.fn()}
        onAdditionalContextChange={vi.fn()}
        onCoverLetterTextChange={vi.fn()}
        onGenerate={vi.fn()}
        onResetToGenerated={handleReset}
        onStageCoverLetter={vi.fn()}
        onUnstageCoverLetter={vi.fn()}
      />
    );

    const titleInput = screen.getByDisplayValue('Frontend Lead');
    fireEvent.change(titleInput, { target: { value: 'Full Stack Lead' } });
    expect(handleJobTitleChange).toHaveBeenCalledWith('Full Stack Lead');

    const companyInput = screen.getByDisplayValue('Datadog');
    fireEvent.change(companyInput, { target: { value: 'Linear' } });
    expect(handleCompanyChange).toHaveBeenCalledWith('Linear');

    const resetBtn = screen.getByRole('button', { name: /reset to generated/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });

  it('handles copy to clipboard and download TXT', () => {
    render(
      <CoverLetterGeneratorCard
        jobTitle="Senior Engineer"
        companyName="Vercel"
        hiringManagerName=""
        additionalContext=""
        coverLetterResult={mockResult}
        editedCoverLetter={mockResult.content}
        isLoading={false}
        error={null}
        stagedCoverLetter={null}
        onJobTitleChange={vi.fn()}
        onCompanyNameChange={vi.fn()}
        onHiringManagerChange={vi.fn()}
        onAdditionalContextChange={vi.fn()}
        onCoverLetterTextChange={vi.fn()}
        onGenerate={vi.fn()}
        onResetToGenerated={vi.fn()}
        onStageCoverLetter={vi.fn()}
        onUnstageCoverLetter={vi.fn()}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copy to clipboard/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockResult.content);

    const downloadBtn = screen.getByRole('button', { name: /download txt/i });
    fireEvent.click(downloadBtn);
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('renders staged state and handles unstaging', () => {
    const handleUnstage = vi.fn();

    render(
      <CoverLetterGeneratorCard
        jobTitle="Senior Engineer"
        companyName="Vercel"
        hiringManagerName=""
        additionalContext=""
        coverLetterResult={mockResult}
        editedCoverLetter={mockResult.content}
        isLoading={false}
        error={null}
        stagedCoverLetter={{
          subjectLine: 'Application for Senior Engineer at Vercel — John Doe',
          content: mockResult.content,
          companyName: 'Vercel',
          jobTitle: 'Senior Engineer',
          approved: true,
        }}
        onJobTitleChange={vi.fn()}
        onCompanyNameChange={vi.fn()}
        onHiringManagerChange={vi.fn()}
        onAdditionalContextChange={vi.fn()}
        onCoverLetterTextChange={vi.fn()}
        onGenerate={vi.fn()}
        onResetToGenerated={vi.fn()}
        onStageCoverLetter={vi.fn()}
        onUnstageCoverLetter={handleUnstage}
      />
    );

    expect(screen.getByText('Staged for Export')).toBeInTheDocument();
    const unstageBtn = screen.getByRole('button', { name: /staged \(click to unstage\)/i });
    fireEvent.click(unstageBtn);
    expect(handleUnstage).toHaveBeenCalled();
  });

  it('renders loading state and error alert', () => {
    render(
      <CoverLetterGeneratorCard
        jobTitle="Engineer"
        companyName="Meta"
        hiringManagerName=""
        additionalContext=""
        coverLetterResult={null}
        editedCoverLetter=""
        isLoading={true}
        error="Network error reaching edge function."
        stagedCoverLetter={null}
        onJobTitleChange={vi.fn()}
        onCompanyNameChange={vi.fn()}
        onHiringManagerChange={vi.fn()}
        onAdditionalContextChange={vi.fn()}
        onCoverLetterTextChange={vi.fn()}
        onGenerate={vi.fn()}
        onResetToGenerated={vi.fn()}
        onStageCoverLetter={vi.fn()}
        onUnstageCoverLetter={vi.fn()}
      />
    );

    expect(screen.getByText('Network error reaching edge function.')).toBeInTheDocument();
    expect(screen.getByText(/Crafting personalized cover letter from verified qualifications/i)).toBeInTheDocument();
  });
});
