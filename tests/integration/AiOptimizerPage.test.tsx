import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AiOptimizerPage } from '@/features/optimizer/pages/AiOptimizerPage';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';

describe('AiOptimizerPage Integration', () => {
  const sampleResume = createSampleResume('test_user', 'jakes-technical');

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(ResumeService, 'listResumes').mockResolvedValue([
      {
        id: sampleResume.id,
        userId: sampleResume.userId,
        title: sampleResume.title,
        templateId: sampleResume.templateId,
        updatedAt: sampleResume.updatedAt,
        createdAt: sampleResume.createdAt,
      },
    ]);
    vi.spyOn(ResumeService, 'getResume').mockResolvedValue(sampleResume);
  });

  it('renders initial setup view with resume and JD ingestion fields', () => {
    render(
      <MemoryRouter>
        <AiOptimizerPage />
      </MemoryRouter>
    );

    expect(screen.getByText('AI Resume Optimizer')).toBeInTheDocument();
    expect(screen.getByText('1. Select Target Resume')).toBeInTheDocument();
    expect(screen.getByText('2. Target Job Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load sample jd/i })).toBeInTheDocument();
  });

  it('populates job description when Load Sample JD is clicked', () => {
    render(
      <MemoryRouter>
        <AiOptimizerPage />
      </MemoryRouter>
    );

    const loadSampleBtn = screen.getByRole('button', { name: /load sample jd/i });
    fireEvent.click(loadSampleBtn);

    const textarea = screen.getByPlaceholderText(/paste the target job description here/i) as HTMLTextAreaElement;
    expect(textarea.value.length).toBeGreaterThan(100);
    expect(textarea.value).toContain('Senior Full-Stack Software Engineer');
  });

  it('preloads resume and JD when navigating from ATS Analyzer with location state', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/dashboard/ai-optimizer',
            state: {
              resumeId: sampleResume.id,
              jobDescription: 'Seeking Senior Full-Stack Engineer with React and Node.js.',
              jobTitle: 'Senior Full-Stack Engineer',
              companyName: 'Stripe',
            },
          },
        ]}
      >
        <AiOptimizerPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(sampleResume.title)).toBeInTheDocument();
    });

    expect(screen.getByText('Professional Summary')).toBeInTheDocument();
    expect(screen.getByText('Bullet Rewriter')).toBeInTheDocument();
    expect(screen.getByText(/Skills & Keywords/i)).toBeInTheDocument();
    expect(screen.getByText(/Cover Letter/i)).toBeInTheDocument();
  });

  it('switches between Professional Summary and Bullet Rewriter tabs in workspace', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/dashboard/ai-optimizer',
            state: {
              resumeId: sampleResume.id,
              jobDescription: 'Senior Engineer requirements with TypeScript.',
            },
          },
        ]}
      >
        <AiOptimizerPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(sampleResume.title)).toBeInTheDocument();
    });

    // Default tab is Summary
    expect(screen.getByText('Current Resume Summary')).toBeInTheDocument();

    // Switch to Bullet Rewriter tab
    const bulletsTab = screen.getByRole('button', { name: /bullet rewriter/i });
    fireEvent.click(bulletsTab);

    expect(screen.getByText('Experience & Project Bullet Rewriter')).toBeInTheDocument();

    // Switch to Skills & Keywords tab
    const keywordsTab = screen.getByRole('button', { name: /skills & keywords/i });
    fireEvent.click(keywordsTab);

    expect(screen.getByText('Job-Specific Skills & Keyword Suggestions')).toBeInTheDocument();

    // Switch to Cover Letter tab
    const coverLetterTab = screen.getByRole('button', { name: /cover letter/i });
    fireEvent.click(coverLetterTab);

    expect(screen.getByText('AI Cover Letter Generator')).toBeInTheDocument();
  });

  it('opens and closes DiffComparisonModal from Review & Apply trigger', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/dashboard/ai-optimizer',
            state: {
              resumeId: sampleResume.id,
              jobDescription: 'Senior Engineer requirements with TypeScript.',
            },
          },
        ]}
      >
        <AiOptimizerPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(sampleResume.title)).toBeInTheDocument();
    });

    // Generate summary rewrite
    const generateBtn = screen.getByRole('button', { name: /generate summary rewrites/i });
    fireEvent.click(generateBtn);

    // Wait for alternatives and stage
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /apply to staged changes/i })).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
    const stageBtn = screen.getByRole('button', { name: /apply to staged changes/i });
    fireEvent.click(stageBtn);

    // Banner and header both display "Review & Apply"
    await waitFor(
      () => {
        expect(screen.getAllByText(/Review & Apply \(1\)/i).length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 10000 }
    );

    // Open DiffComparisonModal
    const reviewBtn = screen.getAllByRole('button', { name: /Review & Apply/i })[0];
    fireEvent.click(reviewBtn);

    expect(screen.getByText(/Review AI Optimizations for/i)).toBeInTheDocument();
    expect(screen.getAllByText('Professional Summary').length).toBeGreaterThanOrEqual(1);

    // Cancel / Close modal
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Review AI Optimizations for/i)).not.toBeInTheDocument();
    });
  });
});
