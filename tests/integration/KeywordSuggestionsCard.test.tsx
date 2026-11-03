import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeywordSuggestionsCard } from '@/features/optimizer/components/KeywordSuggestionsCard';
import type { SuggestKeywordsResult, SuggestedKeyword } from '@/features/optimizer/types/optimizer.types';

describe('KeywordSuggestionsCard Component', () => {
  const mockSuggestions: SuggestedKeyword[] = [
    {
      id: 'kw-1',
      term: 'Kubernetes',
      category: 'Databases & Cloud',
      importance: 'critical',
      evidenceStatus: 'missing',
      frequencyInJD: 4,
      whyItMatters: 'Target JD requires multi-cluster orchestration experience.',
      suggestedSection: 'skills',
      userTriageStatus: 'unreviewed',
    },
    {
      id: 'kw-2',
      term: 'Docker',
      category: 'Databases & Cloud',
      importance: 'important',
      evidenceStatus: 'in_resume',
      frequencyInJD: 2,
      whyItMatters: 'Found in employment history and skills list.',
      suggestedSection: 'skills',
      userTriageStatus: 'unreviewed',
    },
    {
      id: 'kw-3',
      term: 'TypeScript',
      category: 'Languages',
      importance: 'critical',
      evidenceStatus: 'under_emphasized',
      frequencyInJD: 5,
      whyItMatters: 'JD stresses modern TypeScript; currently only listed once without detail.',
      suggestedSection: 'skills',
      userTriageStatus: 'unreviewed',
    },
  ];

  const mockResult: SuggestKeywordsResult = {
    allSuggestions: mockSuggestions,
    missingKeywords: [mockSuggestions[0]],
    matchedKeywords: [mockSuggestions[1]],
    underEmphasizedKeywords: [mockSuggestions[2]],
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: 14,
  };

  it('renders un-analyzed state with analyze trigger button', () => {
    const handleAnalyze = vi.fn();
    render(
      <KeywordSuggestionsCard
        keywordResult={null}
        isLoading={false}
        error={null}
        confirmedSkills={[]}
        learningGoals={[]}
        rejectedKeywords={[]}
        onAnalyze={handleAnalyze}
        onTriage={vi.fn()}
        onStageSkill={vi.fn()}
        onUnstageSkill={vi.fn()}
      />
    );

    expect(screen.getByText('Keywords Not Yet Analyzed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /extract jd keywords/i })).toBeInTheDocument();

    const analyzeBtn = screen.getByRole('button', { name: /analyze target keywords/i });
    fireEvent.click(analyzeBtn);
    expect(handleAnalyze).toHaveBeenCalledTimes(1);
  });

  it('renders extracted keywords with metrics strip and tabs', () => {
    render(
      <KeywordSuggestionsCard
        keywordResult={mockResult}
        isLoading={false}
        error={null}
        confirmedSkills={[]}
        learningGoals={[]}
        rejectedKeywords={[]}
        onAnalyze={vi.fn()}
        onTriage={vi.fn()}
        onStageSkill={vi.fn()}
        onUnstageSkill={vi.fn()}
      />
    );

    // Header and tags
    expect(screen.getByText('Job-Specific Skills & Keyword Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Taxonomy Extracted')).toBeInTheDocument();

    // Default tab is 'missing'
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(screen.getByText('Target JD requires multi-cluster orchestration experience.')).toBeInTheDocument();

    // Switch to Matched tab
    const matchedTab = screen.getByRole('button', { name: /matched/i });
    fireEvent.click(matchedTab);
    expect(screen.getByText('Docker')).toBeInTheDocument();

    // Switch to Under-Emphasized tab
    const underTab = screen.getByRole('button', { name: /under-emphasized/i });
    fireEvent.click(underTab);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();

    // Switch to All Suggestions tab
    const allTab = screen.getByRole('button', { name: /all suggestions/i });
    fireEvent.click(allTab);
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('handles "I Have This" with candidate confirmation modal', () => {
    const handleTriage = vi.fn();
    render(
      <KeywordSuggestionsCard
        keywordResult={mockResult}
        isLoading={false}
        error={null}
        confirmedSkills={[]}
        learningGoals={[]}
        rejectedKeywords={[]}
        onAnalyze={vi.fn()}
        onTriage={handleTriage}
        onStageSkill={vi.fn()}
        onUnstageSkill={vi.fn()}
      />
    );

    // By default on missing tab, Kubernetes is shown
    const iHaveThisBtn = screen.getByRole('button', { name: /i have this/i });
    fireEvent.click(iHaveThisBtn);

    // Confirmation banner / modal should appear
    expect(screen.getByText(/confirm skill possession:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/ResuMax AI strictly prohibits inventing candidate qualifications/i)
    ).toBeInTheDocument();

    // Confirm button
    const confirmBtn = screen.getByRole('button', { name: /yes, i have this skill/i });
    fireEvent.click(confirmBtn);

    expect(handleTriage).toHaveBeenCalledWith('Kubernetes', 'Databases & Cloud', 'already_have', 'skills');
  });

  it('handles "Need to Learn" and "Not Relevant" triage actions', () => {
    const handleTriage = vi.fn();
    render(
      <KeywordSuggestionsCard
        keywordResult={mockResult}
        isLoading={false}
        error={null}
        confirmedSkills={[]}
        learningGoals={[]}
        rejectedKeywords={[]}
        onAnalyze={vi.fn()}
        onTriage={handleTriage}
        onStageSkill={vi.fn()}
        onUnstageSkill={vi.fn()}
      />
    );

    // Need to Learn
    const needToLearnBtn = screen.getByRole('button', { name: /need to learn/i });
    fireEvent.click(needToLearnBtn);
    expect(handleTriage).toHaveBeenCalledWith('Kubernetes', 'Databases & Cloud', 'need_to_learn', 'skills');

    // Not Relevant
    const notRelevantBtn = screen.getByTitle(/mark as not relevant/i);
    fireEvent.click(notRelevantBtn);
    expect(handleTriage).toHaveBeenCalledWith('Kubernetes', 'Databases & Cloud', 'not_relevant', 'skills');
  });

  it('renders confirmed skills and allows unstaging', () => {
    const handleUnstage = vi.fn();
    render(
      <KeywordSuggestionsCard
        keywordResult={mockResult}
        isLoading={false}
        error={null}
        confirmedSkills={[
          {
            skill: 'Kubernetes',
            category: 'Databases & Cloud',
            suggestedSection: 'skills',
            approved: true,
          },
        ]}
        learningGoals={[]}
        rejectedKeywords={[]}
        onAnalyze={vi.fn()}
        onTriage={vi.fn()}
        onStageSkill={vi.fn()}
        onUnstageSkill={handleUnstage}
      />
    );

    expect(screen.getAllByText('Confirmed & Staged').length).toBeGreaterThanOrEqual(1);

    const unstageBtn = screen.getByRole('button', { name: /unstage/i });
    fireEvent.click(unstageBtn);
    expect(handleUnstage).toHaveBeenCalledWith('Kubernetes');
  });

  it('shows loading indicator and error message', () => {
    render(
      <KeywordSuggestionsCard
        keywordResult={null}
        isLoading={true}
        error="Failed to analyze keywords from server."
        confirmedSkills={[]}
        learningGoals={[]}
        rejectedKeywords={[]}
        onAnalyze={vi.fn()}
        onTriage={vi.fn()}
        onStageSkill={vi.fn()}
        onUnstageSkill={vi.fn()}
      />
    );

    expect(screen.getByText('Failed to analyze keywords from server.')).toBeInTheDocument();
    expect(screen.getByText(/Scanning job description against technical taxonomy/i)).toBeInTheDocument();
  });
});
