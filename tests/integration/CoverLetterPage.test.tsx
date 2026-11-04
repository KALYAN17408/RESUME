import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CoverLetterPage } from '@/features/cover-letter/pages/CoverLetterPage';
import { useAuthStore } from '@/stores/authStore';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import * as coverLetterPdfModule from '@/features/cover-letter/services/coverLetterPdf';

describe('CoverLetterPage Component & Integration Workflow', () => {
  const sampleResume = createSampleResume('user_123', 'jakes-technical');

  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: { id: 'user_123', email: 'test@example.com' } as any,
      session: { access_token: 'fake-token' } as any,
      profile: { id: 'user_123', email: 'test@example.com', full_name: 'Alex Morgan' },
      isLoading: false,
      isInitialized: true,
    });

    vi.spyOn(ResumeService, 'listResumes').mockResolvedValue([
      {
        id: sampleResume.id,
        userId: 'user_123',
        title: sampleResume.title,
        targetRole: sampleResume.targetRole,
        templateId: sampleResume.templateId,
        createdAt: sampleResume.createdAt,
        updatedAt: sampleResume.updatedAt,
      },
    ]);

    vi.spyOn(ResumeService, 'getResume').mockResolvedValue(sampleResume);
  });

  it('renders initial view with source resume selector and parameter inputs', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/cover-letter']}>
        <CoverLetterPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Cover Letter Generator')).toBeInTheDocument();
    expect(screen.getByText(/1. Source Resume/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Role & Company Details/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Stripe, Datadog, Google/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Cover Letter/i })).toBeInTheDocument();
  });

  it('generates a tailored cover letter and allows in-browser editing', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/cover-letter']}>
        <CoverLetterPage />
      </MemoryRouter>
    );

    // Fill in target role and company
    const titleInput = screen.getByPlaceholderText(/e.g. Senior Full-Stack Engineer/i);
    const companyInput = screen.getByPlaceholderText(/e.g. Stripe, Datadog, Google/i);

    fireEvent.change(titleInput, { target: { value: 'Staff Backend Engineer' } });
    fireEvent.change(companyInput, { target: { value: 'Stripe' } });

    // Click tone button: Confident
    const confidentBtn = screen.getByText('Confident');
    fireEvent.click(confidentBtn);

    // Generate letter
    const generateBtn = screen.getByRole('button', { name: /Generate Cover Letter/i });
    fireEvent.click(generateBtn);

    // Wait for generated content to appear in editor
    await waitFor(() => {
      expect(screen.getByText(/Cover Letter Editor/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Cover letter body paragraphs.../i) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toContain('Staff Backend Engineer');
    expect(textarea.value).toContain('Stripe');

    // Edit content
    fireEvent.change(textarea, {
      target: { value: textarea.value + '\n\nLooking forward to speaking soon.' },
    });
    expect(textarea.value).toContain('Looking forward to speaking soon.');
  });

  it('saves and reloads drafts from Drafts modal', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/cover-letter']}>
        <CoverLetterPage />
      </MemoryRouter>
    );

    const titleInput = screen.getByPlaceholderText(/e.g. Senior Full-Stack Engineer/i);
    const companyInput = screen.getByPlaceholderText(/e.g. Stripe, Datadog, Google/i);

    fireEvent.change(titleInput, { target: { value: 'Platform Engineer' } });
    fireEvent.change(companyInput, { target: { value: 'Datadog' } });

    fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Draft/i })).toBeInTheDocument();
    });

    // Save draft
    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      expect(screen.getByText(/Update Draft/i)).toBeInTheDocument();
    });

    // Open My Drafts modal
    const draftsBtn = screen.getByTestId('open-drafts-btn');
    fireEvent.click(draftsBtn);

    await waitFor(() => {
      expect(screen.getByText(/Saved Cover Letter Drafts/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Datadog/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Platform Engineer/i).length).toBeGreaterThanOrEqual(1);
  });

  it('triggers PDF download using the current edited text and sanitized filename', async () => {
    const downloadPdfSpy = vi
      .spyOn(coverLetterPdfModule, 'downloadCoverLetterPdf')
      .mockResolvedValue('Cover_Letter_Datadog_Platform_Engineer.pdf');

    render(
      <MemoryRouter initialEntries={['/dashboard/cover-letter']}>
        <CoverLetterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/e.g. Senior Full-Stack Engineer/i), {
      target: { value: 'Platform Engineer' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Stripe, Datadog, Google/i), {
      target: { value: 'Datadog' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
    });

    // Edit the text before downloading
    const textarea = screen.getByPlaceholderText(/Cover letter body paragraphs.../i);
    fireEvent.change(textarea, {
      target: { value: 'My custom edited cover letter text for Datadog.' },
    });

    // Click Download PDF
    fireEvent.click(screen.getByRole('button', { name: /Download PDF/i }));

    await waitFor(() => {
      expect(downloadPdfSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'My custom edited cover letter text for Datadog.',
          companyName: 'Datadog',
        })
      );
    });
  });

  it('redirects legacy /dashboard/ai-optimizer URL directly to /dashboard/cover-letter', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/ai-optimizer']}>
        <Routes>
          <Route path="/dashboard/cover-letter" element={<CoverLetterPage />} />
          <Route path="/dashboard/ai-optimizer" element={<Navigate to="/dashboard/cover-letter" replace />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify it redirected and rendered CoverLetterPage
    expect(screen.getByText('Cover Letter Generator')).toBeInTheDocument();
  });
});
